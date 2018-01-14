var superagent = require('superagent');
require('superagent-charset')(superagent);
let cheerio = require('cheerio');
let mongoose = require('mongoose');

let ArticleModel = mongoose.model('Article');

module.exports = {
  fetchArticlesContent: function(articleUrls) {
    articleUrls.map(url => {
      this.fetchArticleContentByUrl(url, function(err, result) {
        if (err) {
          return ;
        }
        saveArticleContentToDb(url, result.content, result.images);
      });
    });
  },
  fetchArticleContentByUrl: function(url, callback) {
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
  },
  fetchArticleListByInPage: function(pageUrl, callback) {
    superagent.get(pageUrl)
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
            title: $title.text(),
            date: $date.text(),
            url: `${CRAWL_BASE_URL}/${$title.attr("href")}`
          });
        });
        console.log(items);
        callback(null, items);
      });
  },
  populateContentAndImages: function(newsListContent) {
    for (let newsContent of newsListContent) {
      let currentArticle = allArticles.find((article)=> article.url === newsContent.url);
      if (currentArticle) {
        currentArticle.content = newsContent.content;
        currentArticle.images = newsContent.images;
      }
    }
  }
};

function parseImageInContent(content) {
  var regex  = /<img.*?src=[\'\"]([^\'\"]*)[\'\"].*?>/g;
  var match;
  var imageList = [];
  while ( match = regex.exec( content ) ) {
    imageList.push( match[1] );
  }

  return imageList;
}

function saveArticleContentToDb(url, articleContent, images) {
  let date = parseDateFromContent(articleContent);

  ArticleModel.update({ _id: url }, { $set: { body: articleContent, images: images, date: date}}, function (err, result) {
    if (err) {
      console.log(`populate content for ${url} failed`);
      return ;
    }
    console.log(result);
  });
}

function parseDateFromContent(content) {
  var regex = /发信站: 兵马俑BBS \((.*?)\)/;
  if (content.match(regex)) {
    return content.match(regex)[1];
  }
  return ""
}