var async = require('async');
var cheerio = require('cheerio');
var mongoose = require('mongoose');
var superagent = require('superagent');
require('superagent-charset')(superagent);
var _ = require('lodash');

let articleCrawl = require("../service/crawl");

var fileCache = require('../service/filecache');
var filters = require('../service/filters');

var dataFilePath = './data.json';

var ArticleModel = mongoose.model('Article');

const CRAWL_BASE_URL = `http://bbs.xjtu.edu.cn/BMYAAJEEVIOSKGEAQVZAKHHHEXOZXSYSAHQN_B`;
const CRAWL_PAGE_URL = `${CRAWL_BASE_URL}/doc?B=PieBridge&S=`;

module.exports = {
  getArticle: function(req, res, next) {
    var action = req.query.action || "";
    var start = +req.query.start || 0;
    var end = +req.query.end || 10;

    var allArticles = [];

    if (action === "") {
      allArticles = fileCache.getArticlesFromCache(dataFilePath);
      var beijingArticle = allArticles.filter((article)=> {
        if (article.title.indexOf("征MM") > -1) {
          return false;
        }
        return article.content && article.content.indexOf("北京") > -1;
      }).map((article) => {
        delete article.content;
        return article;
      });
      return res.json({
        status: 'success',
        count: allArticles.length,
        articles: beijingArticle
      })
    }

    var crawlUrls = getCrawlPageUrls();
    crawlUrls = crawlUrls.slice(-300);

    async.mapLimit(crawlUrls, 5, function (url, callback) {
      fetchUrl(url, callback);
    }, function (err, result) {
      result = _.flatten(result);
      result = result.filter(filterArticle);
      // result = result.reverse().slice(0, 500);
      // for (let article of result) {
      //   saveArticleToDb(article);
      // }

      // let articleUrls = result.map(article => article.url);
      // console.log(articleUrls);
      articleCrawl.fetchArticlesContent(result);

      let articles = result.filter(article => {
        if (article.publish) {
          if (article.content && article.content.indexOf('guersisi') !== -1) {
            return true;
          }
          if (article.publish.indexOf('2016') !== -1 || article.publish.indexOf('2017') !== -1 ||
            article.publish.indexOf('2018') !== -1 || article.publish.indexOf('2019') !== -1
          || article.publish.indexOf('2020') !== -1) {
            if (article.content.indexOf('微信') !== -1 || article.content.indexOf('weixin') !== -1 ||
              article.content.indexOf('qq') !== -1 || article.content.indexOf('QQ') !== -1) {
              return true;
            }
          }
          return true;
        }
        return true;
      });

      res.json({
        status: 'success',
        count: articles.length,
        articles: articles
      })
    });
  },
  fetchArticleContent: function(req, res, next) {
    let articleUrls = ["http://bbs.xjtu.edu.cn/BMYAAJEEVIOSKGEAQVZAKHHHEXOZXSYSAHQN_B/con?B=PieBridge&F=M.1080381634.A&N=75&T=0"];
    articleCrawl.fetchArticlesContent(articleUrls);
    res.json({
      status: "success"
    })
  }
};

function saveArticleToDb(articleData) {
  ArticleModel.findById(articleData.url, function(err, found) {
    if (err) {
      console.log(err);
      return ;
    }

    if (!found) {
      let newArticle = new ArticleModel();
      newArticle._id = articleData.url;
      newArticle.url = articleData.url;
      newArticle.title = articleData.title;
      newArticle.user = articleData.user;
      newArticle.position = articleData.position;
      newArticle.save();
    }
  });
}

function filterArticle(article) {
  if (!filters.filterByTitle(article)) {
    return false;
  }

  let blackUserList = filters.getBlackListUsers();
  if (blackUserList.indexOf(article.user) > -1) {
    return false;
  }

  return true;
}

function fetchUrl(url, callback) {
  superagent.get(url)
    .charset('gb2312')
    .end(function (err, sres) {
      if (err) {
        return callback(err);
      }
      var $ = cheerio.load(sres.text);
      var items = [];
      $('.level1 .d0').each(function (idx, element) {
        var $element = $(element);
        var $position = $element.find('.tdborder').first();
        var $user = $element.find('.tduser');
        var $title = $element.find('.tdborder a');
        var $date = $element.find('.tdborder nobr');
        items.push({
          position: +$position.text(),
          user: $user.text(),
          title: $title.text() || "",
          date: $date.text(),
          url: `${CRAWL_BASE_URL}/${$title.attr("href")}`
        });
      });
      // console.log(items);
      callback(null, items);
    });
}

function getCrawlPageUrls() {
  var articleCount = 24629;
  var currentPosition = 1;
  var page_article_count = 20,
    urls = [],
    pageCount = Math.ceil(articleCount / page_article_count);
  for (var i = 0; i < pageCount; i++) {
    currentPosition += page_article_count;
    if (currentPosition > articleCount) {
      break;
    }
    urls.push(`${CRAWL_PAGE_URL}${currentPosition}`);
  }
  return urls;
}
