module.exports = {
  sort(articles) {
    articles = this.sortByDate(articles);
    articles = this.sortByImagesLength(articles);
    return articles;
  },
  sortByDate(articles) {
    return articles.sort((a1, a2) => {
      return new Date(a2).getTime() - new Date(a1).getTime();
    })
  },
  sortByImagesLength(articles) {
    return articles.sort((a1, a2) => {
      return a2.images.length - a1.images.length;
    })
  }
}