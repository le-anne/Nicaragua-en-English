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
  },
  {
    name: "AP News",
    address: "https://apnews.com/hub/nicaragua",
    base: "https://apnews.com",
  },
  {
    name: "The Guardian",
    address: "https://www.theguardian.com/world/nicaragua",
    base: "",
  },
  {
    name: "Independent",
    address: "https://www.independent.co.uk/topic/nicaragua",
    base: "https://www.independent.co.uk",
  },
  {
    name: "BBC",
    address: "https://www.bbc.com/news/topics/cdl8n2ede8zt/nicaragua",
    base: "https://www.bbc.com",
  },
  {
    name: "France24",
    address: "https://www.france24.com/en/tag/nicaragua/",
    base: "https://www.france24.com",
  },
  {
    name: "Euronews",
    address: "https://www.euronews.com/news/america/nicaragua",
    base: "www.euronews.com",
  },
  {
    name: "US News",
    address: "https://www.usnews.com/topics/locations/nicaragua",
    base: "",
  },
  {
    name: "Costa Rica Star News",
    address: "https://news.co.cr/nicaragua-news/",
    base: "",
  },
  {
    name: "DW",
    address: "https://www.dw.com/en/nicaragua/t-18943648",
    base: "https://www.dw.com/",
  },
  {
    name: "UNESCO",
    address: "https://en.unesco.org/countries/nicaragua/news",
    base: "",
  },
  {
    name: "National Post",
    address: "https://nationalpost.com/tag/nicaragua/",
    base: "https://nationalpost.com",
  },
  {
    name: "Amnesty",
    address: "https://www.amnesty.org/en/latest/news/?qlocation=1793",
    base: "",
  },
  {
    name: "Today Nicaragua",
    address: "https://todaynicaragua.com/",
    base: "",
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

      articles.push({
        title,
        url: newspaper.base + url,
        source: newspaper.name,
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

  axios
    .get(newspaperAddress)
    .then((response) => {
      const html = response.data;
      const $ = cheerio.load(html);
      const specificArticles = [];

      $('a:contains("nicaragua")', html).each(function () {
        const title = $(this).text().replace(/\s\s+/g, "");
        const url = $(this).attr("href");
        specificArticles.push({
          title,
          url: newspaperBase + url,
          source: newspaperId,
        });
      });
      res.json(specificArticles);
    })
    .catch((err) => console.log(err));
});

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`));
