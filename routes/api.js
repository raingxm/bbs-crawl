var articleSearcherService = require('../service/search');

module.exports = {
  list: function (req, res, next) {
    articleSearcherService.articleList(function (err, result) {

    });
  }
};