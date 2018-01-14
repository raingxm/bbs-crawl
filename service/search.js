let mongoose = require('mongoose');
let jsonfile = require('jsonfile');
let ArticleModel = mongoose.model('Article');
let imageMapFilePath = './assest.json';
let filtersService = require('./filters');
let sortService = require('./sort');
let fileCacheService = require('./filecache');

module.exports = {
  search: function (keyword, callback) {
    let regex = new RegExp(".*" + keyword + ".*");
    ArticleModel.find({body: regex}, function (err, result) {
      result = filtersService.filterForRecent(result);

      result = result.map(article => {
        article.images = resolveImage(article.images);
        return article;
      });

      result = sortService.sort(result);

      callback(err, result)
    })
  },
  articleList: function () {
    ArticleModel.find({})
  }
};

function resolveImage(imageUrls) {
  let imageData = jsonfile.readFileSync(imageMapFilePath);
  let imageMap = imageData.images_path_name_map;
  let newImageUrls = imageUrls.map(imageUrl => {
    if (imageMap[imageUrl]) {
      return `/static/images/${encodeURIComponent(imageMap[imageUrl])}`;
    }

    return ""
  });
  newImageUrls = newImageUrls.filter(imageUrl => newImageUrls !=="");
  return newImageUrls;
}