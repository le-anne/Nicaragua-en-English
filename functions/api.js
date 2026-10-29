import express from "express";
import axios from "axios";
import { load as cheerioLoad } from "cheerio";

const PORT = process.env.PORT || 8000;
const app = express();

const newspapers = [
  {
    name: "Al Jazeera",
    address: "https://www.aljazeera.com/where/nicaragua/",
    base: "https://www.aljazeera.com",
    img: "",
  },
  {
    name: "AP News",
    address: "https://apnews.com/hub/nicaragua",
    base: "https://apnews.com",
    img: "",
  },
  {
    name: "The Guardian",
    address: "https://www.theguardian.com/world/nicaragua",
    base: "https://www.theguardian.com",
    img: "",
  },
  {
    name: "Independent",
    address: "https://www.independent.co.uk/topic/nicaragua",
    base: "https://www.independent.co.uk",
    img: "",
  },
  {
    name: "BBC",
    address: "https://www.bbc.com/news/topics/cdl8n2ede8zt/nicaragua",
    base: "https://www.bbc.com",
    img: "",
  },
  {
    name: "France24",
    address: "https://www.france24.com/en/tag/nicaragua/",
    base: "https://www.france24.com",
    img: "",
  },
  {
    name: "Euronews",
    address: "https://www.euronews.com/news/america/nicaragua",
    base: "https://www.euronews.com",
    img: "",
  },
  {
    name: "US News",
    address: "https://www.usnews.com/topics/locations/nicaragua",
    base: "https://www.usnews.com",
    img: "",
  },
  {
    name: "Costa Rica Star News",
    address: "https://news.co.cr/nicaragua-news/",
    base: "https://news.co.cr",
    img: "",
  },
  {
    name: "DW",
    address: "https://www.dw.com/en/nicaragua/t-18943648",
    base: "https://www.dw.com",
    img: "",
  },
  {
    name: "UNESCO",
    address: "https://www.unesco.org/en/countries/ni",
    base: "https://www.unesco.org",
    img: "",
  },
  {
    name: "National Post",
    address: "https://nationalpost.com/tag/nicaragua/",
    base: "https://nationalpost.com",
    img: "",
  },
  {
    name: "Today Nicaragua",
    address: "https://todaynicaragua.com/",
    base: "https://todaynicaragua.com",
    img: "",
  },
];

const articles = [];
let lastFetchAt = 0;
let fetchInFlight = null;
const CACHE_TTL_MS = 5 * 60 * 1000;

const axiosInstance = axios.create({
  timeout: 12000,
  maxRedirects: 5,
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    Connection: "keep-alive",
  },
});

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

const normalizeTitle = (title) =>
  title
    .replace(/\s+/g, " ")
    .replace(/(\d+)/g, " $1 ")
    .replace(/\s+/g, " ")
    .trim();

const resolveArticleUrl = (href, pageUrl) => {
  if (!href || href.startsWith("#") || href.startsWith("javascript:")) {
    return null;
  }

  try {
    return new URL(href, pageUrl).href;
  } catch {
    return null;
  }
};

const findNewspaper = (newspaperId) => {
  const decoded = decodeURIComponent(newspaperId || "").trim();
  const needle = decoded.toLowerCase();
  const slugNeedle = needle.replace(/[\s_]+/g, "-");

  return newspapers.find((newspaper) => {
    const name = newspaper.name.toLowerCase();
    const slug = name.replace(/[\s_]+/g, "-");
    return name === needle || slug === slugNeedle;
  });
};

const scrapeNewspaper = (newspaper, html) => {
  const $ = cheerioLoad(html);
  const foundArticles = [];
  const seen = new Set();

  const image =
    $('meta[property="og:image"]').attr("content") ||
    $('meta[property="og:image:url"]').attr("content") ||
    null;

  $('a:contains("Nicaragua")').each(function () {
    const title = normalizeTitle($(this).text());
    const url = resolveArticleUrl($(this).attr("href"), newspaper.address);

    if (!title || title.toLowerCase() === "nicaragua" || !url) {
      return;
    }

    const key = `${title}::${url}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    foundArticles.push({
      title,
      str: title,
      url,
      source: newspaper.name,
      image,
    });
  });

  return foundArticles;
};

const fetchArticles = async () => {
  if (fetchInFlight) {
    return fetchInFlight;
  }

  fetchInFlight = (async () => {
    console.log("Fetching articles...");
    const nextArticles = [];

    const fetchPromises = newspapers.map(async (newspaper) => {
      try {
        const response = await axiosInstance.get(newspaper.address);
        const foundArticles = scrapeNewspaper(newspaper, response.data);

        console.log(
          `Found ${foundArticles.length} articles for ${newspaper.name}`
        );
        nextArticles.push(...foundArticles);
      } catch (error) {
        console.error(
          `Error fetching data from ${newspaper.address}:`,
          error.message
        );
      }
    });

    await Promise.all(fetchPromises);
    articles.length = 0;
    articles.push(...nextArticles);
    lastFetchAt = Date.now();
  })().finally(() => {
    fetchInFlight = null;
  });

  return fetchInFlight;
};

app.get("/", (req, res) => {
  res.json({
    name: "Nicaragua News en English",
    endpoints: ["/news", "/sources", "/news/:newspaperId"],
  });
});

app.get("/sources", (req, res) => {
  res.json(
    newspapers.map(({ name, address }) => ({
      name,
      id: name.toLowerCase().replace(/[\s_]+/g, "-"),
      address,
    }))
  );
});

app.get("/news", async (req, res) => {
  console.log("Request received for /news");
  try {
    const forceRefresh = req.query.refresh === "1";
    const cacheFresh =
      articles.length > 0 && Date.now() - lastFetchAt < CACHE_TTL_MS;

    if (!forceRefresh && cacheFresh) {
      return res.json(articles);
    }

    if (!forceRefresh && articles.length > 0) {
      res.json(articles);
      fetchArticles().catch((error) => {
        console.error("Background refresh failed:", error.message);
      });
      return;
    }

    await fetchArticles();
    res.json(articles);
  } catch (error) {
    console.error("Error in /news route:", error.message);
    res
      .status(500)
      .json({ error: "An error has occurred while fetching the news." });
  }
});

app.get("/news/:newspaperId", async (req, res) => {
  const newspaper = findNewspaper(req.params.newspaperId);

  if (!newspaper) {
    return res.status(404).json({
      error: "Newspaper not found",
      available: newspapers.map((item) => item.name),
    });
  }

  console.log(newspaper.address, newspaper.base);

  try {
    const response = await axiosInstance.get(newspaper.address);
    const specificArticles = scrapeNewspaper(newspaper, response.data).map(
      ({ title, str, url, source }) => ({ title, str, url, source })
    );
    res.json(specificArticles);
  } catch (err) {
    console.log(err.message || err);
    res
      .status(500)
      .json({ error: "An error occurred while fetching the news" });
  }
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));

fetchArticles().catch((error) => {
  console.error("Initial article fetch failed:", error.message);
});
