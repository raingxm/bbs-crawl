module.exports = {
  page: function(req, res, next) {
    console.log(process.env.NODE_ENV);
    let data = {
      isDev: process.env.NODE_ENV === 'development'
    };

    res.render('page', data);
  }
};