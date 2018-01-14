let filePath = "./data_recent.json";
let fileCacheService = require('./filecache');
let mongoose = require('mongoose');
let ArticleModel = mongoose.model('Article');
let filtersService = require('./filters');

module.exports = {
  export_recent: function(req, res, next) {
    let regex = new RegExp(".*[2015|2016|2017].*");
    ArticleModel.find({date: regex}, function (err, result) {
      fileCacheService.setArticlesToCache(filePath, result);
    })
    res.json({
      status: "success"
    })
  }
};