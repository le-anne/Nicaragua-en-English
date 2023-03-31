import express from "express";
import axios from "axios";
import { load as cheerioLoad } from "cheerio";

const PORT = process.env.PORT || 8000;
const app = express();

const newspapers = [
  {
    name: "Al Jazeera",
    address: "https://www.aljazeera.com/where/nicaragua/",
    base: "",
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
    base: "",
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
    base: "www.euronews.com",
    img: "",
  },
  {
    name: "US News",
    address: "https://www.usnews.com/topics/locations/nicaragua",
    base: "",
    img: "",
  },
  {
    name: "Costa Rica Star News",
    address: "https://news.co.cr/nicaragua-news/",
    base: "",
    img: "",
  },
  {
    name: "DW",
    address: "https://www.dw.com/en/nicaragua/t-18943648",
    base: "https://www.dw.com/",
    img: "",
  },
  {
    name: "UNESCO",
    address: "https://en.unesco.org/countries/nicaragua/news",
    base: "",
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
    base: "",
    img: "",
  },
];

const articles = [];

const axiosInstance = axios.create({
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; YourAppName/1.0; your@email.com)",
    Accept:
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
    Connection: "keep-alive",
  },
});

const fetchArticles = async () => {
  console.log("Fetching articles...");
  articles.length = 0;

  const fetchPromises = newspapers.map(async (newspaper) => {
    try {
      const response = await axiosInstance.get(newspaper.address);
      const html = response.data;
      const $ = cheerioLoad(html);

      const foundArticles = [];

      $('a:contains("Nicaragua")', html).each(function () {
        const title = $(this).text().replace(/\s\s+/g, "");
        const url = newspaper.base
          ? $(this).attr("href")
          : $(this).attr("href");

        var str = title;
        str = str.replace(/(\d+)/g, function (_, num) {
          return " " + num + " ";
        });
        str = str.trim();

        const image =
          $('meta[property="og:image"]').attr("content") ||
          $('meta[property="og:image:url"]').attr("content");

        foundArticles.push({
          str,
          url: newspaper.base + url,
          source: newspaper.name,
          image: image,
        });
      });

      console.log(
        `Found ${foundArticles.length} articles for ${newspaper.name}`
      );

      articles.push(...foundArticles);
    } catch (error) {
      console.error(
        `Error fetching data from ${newspaper.address}:`,
        error.message
      );
    }
  });
};

const main = async () => {
  console.log("Starting main function");
  await fetchArticles();

  app.get("/", (req, res) => {
    res.json("Nicaragua News en English");
  });

  app.get("/news", async (req, res) => {
    console.log("Request received for /news");
    try {
      res.json(articles);
      
    } catch (error) {
      console.error("Error in /news route:", error.message);
      res
        .status(500)
        .json({ error: "An error has occurred while fetching the news." });
    }
  });

  app.get("/news/:newspaperId", async (req, res) => {
    const newspaperId = req.params.newspaperId;

    const newspaperAddress = newspapers.filter(
      (newspaper) => newspaper.name == newspaperId
    )[0].address;
    const newspaperBase = newspapers.filter(
      (newspaper) => newspaper.name == newspaperId
    )[0].base;

    console.log(newspaperAddress, newspaperBase);

    try {
      const response = await axiosInstance.get(newspaperAddress);
      const html = response.data;
      const $ = cheerioLoad(html);
      const specificArticles = [];

      $('a:contains("Nicaragua")', html).each(function () {
        const title = $(this).text().replace(/\s\s+/g, "");
        var str = title;
        str = str.replace(/(\d+)/g, function (_, num) {
          return " " + num + " ";
        });
        str = str.trim();

        const url = $(this).attr("href");

        specificArticles.push({
          str,
          url: newspaperBase + url,
          source: newspaperId,
        });
      });
      res.json(specificArticles);
    } catch (err) {
      console.log(err);
      res
        .status(500)
        .json({ error: "An error occurred while fetching the news" });
    }
  });
};
main();
app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
