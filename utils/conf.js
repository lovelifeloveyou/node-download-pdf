const baseUrl = 'http://www.bookask.com/';
module.exports = {
  imageDir:'./images',
  pdfDir: './pdf',
  searchUrl:baseUrl + 's/kw_%s/t_0.html',
  bookPageUrl:baseUrl + 'book/isbn_%s.html',
  getImageUrl: 'http://img.bookask.com/book/page/img/%s/%d/width_592.jpeg',
  pageUrl: baseUrl + 'book/page/text/%s/%d.html'
};