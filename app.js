var express = require('express');
var cheerio = require('cheerio');
var superagent = require('superagent');
var async = require('async');
var _ = require('lodash');
var jsonfile = require('jsonfile');
require('superagent-charset')(superagent);
var mongoose = require('mongoose');

var fileCache = require('./service/filecache');
var dataFilePath = './data.json';

var isProduction = process.env.NODE_ENV === 'production';

var port = process.env.PORT || 3000;
var app = express();

app.use('/static', express.static(__dirname + '/public'));
app.set('view engine', 'jade');

// if(isProduction){
//   mongoose.connect(process.env.MONGODB_URI);
// } else {
//   mongoose.connect('mongodb://localhost/crawlbbs');
//   mongoose.set('debug', false);
// }

// require models
require('./models/Article');

// routes
var home = require('./routes/index');
var article = require('./routes/article');
var api = require('./routes/api');

// service
var articleSearcherService = require('./service/search');
var imageDownloadService = require('./service/image_download');
var exportService = require('./service/export');

var allArticles = [];

app.get('/', function(req, res, next) {
  var articlesWithImage = allArticles.filter((article)=> article.images && article.images.length > 0);
  console.log('article has image');
  console.log(articlesWithImage.length);
  res.render('index', { articles: articlesWithImage});
});

app.get('/page', home.page);

app.get('/export_data', exportService.export_recent);

app.get('/search', function(req, res, next) {
  let keyword = req.query.keyword || "女";
  articleSearcherService.search(keyword, function (err, result) {
    if (err) {
      return res.json({
        status: 'failed'
      })
    }

    res.json({
      status: 'success',
      articles: result
    })
  });
});

app.get('/articles', article.getArticle);
app.get('/test', article.fetchArticleContent);
app.get('/image_download', imageDownloadService.download);

app.get('/api/list', api.list);

app.get('/get_article_content', function(req, res, next) {
  var start = +req.param('start') || 0;
  var end = +req.param('end') || 10;
  if (allArticles.length === 0) {
    // 从文件缓存中读取
    console.log('read from file cache');
    allArticles = fileCache.getArticlesFromCache(dataFilePath);
  }
  var articlesPopulateContent = allArticles.slice(start, end);
  async.mapLimit(articlesPopulateContent, 5, function (article, callback) {
    fetchArticleContentByUrl(article.url, callback);
  }, function (err, result) {
    result = result.filter(filterArticleContent);
    populateContentAndImages(result);
    res.json({
      status: 'success'
    })
  });
});

function fetchArticleContentByUrl(url, callback) {
  superagent.get(url)
    .charset('gb2312')
    .end(function (err, sres) {
      if (err) {
        return callback(err);
      }
      var $ = cheerio.load(sres.text);
      var rawcontentHtml = $('#filecontent').html();
      var content = $('#filecontent').text();
      var images = parseImageInContent(rawcontentHtml);

      callback(null, {
        url: url,
        content: content,
        images: images
      });
    });
}

function parseImageInContent(content) {
  var regex  = /<img.*?src=[\'\"]([^\'\"]*)[\'\"].*?>/g;
  var match;
  var imageList = [];
  while ( match = regex.exec( content ) ) {
    imageList.push( match[1] );
  }

  return imageList;
}

function filterArticleContent(article) {
  if (article.images.length === 0) {
    return false;
  }
  return true;
}

function updateDataJsonFile(articles) {
  jsonfile.writeFileSync(dataFilePath, {
    articles: articles,
    count: articles.length
  });
}

function populateContentAndImages(newsListContent) {
  for (let newsContent of newsListContent) {
    let currentArticle = allArticles.find((article)=> article.url === newsContent.url);
    if (currentArticle) {
      currentArticle.content = newsContent.content;
      currentArticle.images = newsContent.images;
    }
  }
  if (allArticles.length > 0) {
    console.log(allArticles.length);
    updateDataJsonFile(allArticles);
  }
}

app.listen(port, function () {
  console.log('app is listening at port ' + port);
});
