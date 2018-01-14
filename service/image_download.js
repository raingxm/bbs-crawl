let jsonfile = require('jsonfile');
let imageFilePath = './assest.json';
let mongoose = require('mongoose');
let async = require('async');
let ArticleModel;
// let ArticleModel = mongoose.model('Article');
let fs = require('fs'),
  request = require('request');

let download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){

    request(uri).on('error', function(err) {
      callback(err);
    }).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

module.exports = {
  download: function (req, res, next) {
    let update = req.query.update || "";
    let imageList = readImagesMap();
    if (imageList.length === 0 || update !== "") {
      setImagesList();
      imageList = readImagesMap();
    }

    async.map(imageList, function (imageUrl, callback) {
      downloadImage(imageUrl, callback);
    }, function (err, result) {
      console.log("done");
    });

    let imageMap = {};
    imageList.forEach(image => {
      imageMap[image] = '/static/images/' + getNameForUrl(image) + ".png";
    });
    setImagesMap(imageMap);

    res.json({
      status: "success",
      images: imageList
    })
  }
};

function downloadImage(imageUrl, callback) {
  let imagePath = '/public/images/' + getNameForUrl(imageUrl) + ".png";
  download(imageUrl, imagePath, function () {
    console.log("done");
    callback(null, {url: imageUrl, filename: imagePath});
  })
}

function readImagesMap() {
  let imageData = jsonfile.readFileSync(imageFilePath);
  return imageData.images_list;
}

function writeImagesMap(imagesMap) {
  jsonfile.writeFileSync(imageFilePath, imagesMap);
}

function getNameForUrl(imageUrl) {
  let imageName = imageUrl.replace("http://202.117.1.8:8080/", "");
  imageName = imageName.replace(/\//g, "_");
  return imageName;
}

function setImagesList() {
  let imageMap = {images_list: []},
    imageList = [];

  // 获取images数组大于等于1的文章
  ArticleModel.where({'images.1': {$exists: true}}).select('_id images').exec(function(err, result) {
    result.forEach(article => {
      imageList = imageList.concat(article.images);
    });

    imageList = imageList.filter(image => {
      return image.indexOf("http://202.117.1.8:8080/") > -1;
    });

    imageMap.images_list = imageList;
    writeImagesMap(imageMap);
  })
}

function setImagesMap(imagePathNameMap) {
  let imageList = readImagesMap(),
    imageMap = {images_list: imageList};
  imageMap.images_path_name_map = imagePathNameMap;
  writeImagesMap(imageMap);
}