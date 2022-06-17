const PORT = process.env.PORT || 8000;
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
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
    name: "Amnesty",
    address: "https://www.amnesty.org/en/latest/news/?qlocation=1793",
    base: "",
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

newspapers.forEach((newspaper) => {
  axios.get(newspaper.address).then((response) => {
    const html = response.data;
    const $ = cheerio.load(html);

    $('a:contains("Nicaragua")', html).each(function () {
      const title = $(this).text().replace(/\s\s+/g, "");
      const url = $(this).attr("href");

      var str = title;
      str = str.replace(/(\d+)/g, function (_, num) {
        return " " + num + " ";
      });
      str = str.trim();

      const image =
        $('meta[property="og:image"]').attr("content") ||
        $('meta[property="og:image:url"]').attr("content");

      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
        image: image,
      });
    });
  });
});

app.get("/", (req, res) => {
  res.json("Nicaragua News en English");
});

app.get("/news", (req, res) => {
  res.json(articles);
});

app.get("/news/:newspaperId", (req, res) => {
  const newspaperId = req.params.newspaperId;

  const newspaperAddress = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].address;
  const newspaperBase = newspapers.filter(
    (newspaper) => newspaper.name == newspaperId
  )[0].base;

  console.log(newspaperAddress, newspaperBase);

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("Nicaragua")', html).each(function () {
        const title = $(this).text().replace(/\s\s+/g, "");
        const url = $(this).attr("href");
        specificArticles.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
          image: image,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
