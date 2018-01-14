var mongoose = require('mongoose');

var ArticleSchema = new mongoose.Schema({
  _id: String,
  url: String,
  title: String,
  date: String,
  user: String,
  body: String,
  images: Array,
  position: {type: Number, default: 0}
}, {timestamps: true});


mongoose.model('Article', ArticleSchema);