module.exports = {
  getBlackListUsers: function() {
    return [
      'yintianhua',
      'mervynzheng',
      'wxqxs',
      'ballgoal'
    ];
  },
  getInvilidTitles: function() {
    return [
      ""
    ]
  },
  filterByTitle: function (article) {
    if (!article.title) {
      return false;
    }
    // 必须满足
    if (article.title.indexOf("征") === -1) {
      return false;
    }

    // 必须不满足
    // if (article.title.indexOf("征mm") > -1) {
    //   return false;
    // }

    if (article.title.indexOf("Re:") > -1) {
      return false;
    }

    if (article.title.indexOf("版聚") > -1) {
      return false;
    }

    // 或者满足
    if (article.title.indexOf("征gg") > -1 || article.title.indexOf("征GG") > -1) {
      return true;
    }

    return true;
  },

  filterForRecent(articles) {
    return articles.filter(article => {
      if (!article.date) {
        return ;
      }
      return article.date.indexOf("2017") > -1 || article.date.indexOf("2016") > -1 || article.date.indexOf("2015") > -1;
    });
  },

  filteryByKeyword(articles, keyword) {
    return articles.filter(article => {
      return article.body.indexOf(keyword) > -1;
    });
  }
};
