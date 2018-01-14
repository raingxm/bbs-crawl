var jsonfile = require('jsonfile');

module.exports = {
  getArticlesFromCache: function(filePath) {
    return jsonfile.readFileSync(filePath).articles;
  },
  setArticlesToCache: function(filePath, articles) {
    return jsonfile.writeFileSync(filePath, {
      articles: articles,
      count: articles.length
    });
  },
  readRecentArticle: function() {
    return jsonfile.readFileSync('./data_recent.json').articles;
  }
};
