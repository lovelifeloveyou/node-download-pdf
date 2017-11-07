const request = require('request-promise');
const util = require('util');
const conf = require('./conf');
const Promise = require('bluebird');
const cheerio = require('cheerio');
const fs = require('fs');
const mkdirp = require('mkdirp');
const PDFDocument = require('pdfkit');

function httpGet(url) {
  let options = {
    uri: url,
    transform: function (body) {
      return cheerio.load(body,{decodeEntities:false});
    }
  };
  return request(options);
}

//获取书籍id用于爬取预览图
function getBookInfo(isbn) {
  let url = util.format(conf.bookPageUrl,encodeURIComponent(isbn));
  return httpGet(url)
    .then($ => {
      let preview = $('.book-btn-box').children().first();
      let previewHref = preview.attr('href');
      let bookID = new RegExp('\\d+').exec(previewHref)[0];
      let booKTitle = $('.book-top-info').find('h1').text();
      return {
        bookID:bookID,
        bookTitle:booKTitle
      };
    });
}

//下载图片
function downloadImage(url,dir,fileName) {

  let exists = fs.existsSync(dir);//判断路径是否存在

  return new Promise((resolve,reject) =>{
    if(!exists) {//不存在就创建文件夹
      mkdirp(dir,err =>{
        if (err){
          console.log(err);
          reject(err);
        }
        resolve();
      });
    } else {
      resolve();
    }

  })
    .then(()=>{
      return request.get(url).pipe(fs.createWriteStream(dir + "/" + fileName));//下载图片
    });

}

//获取图书每一页的图片
function getPage(bookInfo,pageNum) {
  let pageUrl = util.format(conf.pageUrl, bookInfo.bookID, pageNum);
  return httpGet(pageUrl)
    .then($ => {
      return $('.no-read-pal').html() === null;//判断是否没有更多页
    })
    .then((hasMore)=>{
      if (!hasMore){
        console.log('图片抓取结束');
        return false;
      }
      console.log('下载第' + pageNum + '页');
      let url = util.format(conf.getImageUrl,bookInfo.bookID, pageNum);
      let dir = conf.imageDir + '/' + bookInfo.bookID;
      let fileName = pageNum + '.jpeg';

      return downloadImage(url,dir, fileName).return(true);
    })
    .then((con)=>{
      if (!con)
        return;
      return getPage(bookInfo,pageNum + 1);//递归
    })
}

exports.makePdf = makePdf;

function makePdf(bookInfo) {//生成pdf
  let doc = new PDFDocument();

  let exists = fs.existsSync(conf.pdfDir);

  return new Promise((resolve,reject) =>{
    if(!exists) {
      mkdirp(conf.pdfDir,err =>{
        if (err){
          console.log(err);
          reject(err);
        }
        resolve();
      });
    } else {
      resolve();
    }

  })
    .then(()=>{
      let pdfPath = conf.pdfDir + '/' + bookInfo.bookTitle + ".pdf";
      doc.pipe(fs.createWriteStream(pdfPath));
      let imageDir = conf.imageDir + '/' + bookInfo.bookID;

      fs.readdir(imageDir, (err, files) => {
        if (err) {
          console.log(err);
          return;
        }
        console.log('开始生成pdf');
        files.sort((a,b) => {//文件名排序保证顺序
          let nameA = parseInt(a.split('.')[0]);
          let nameB = parseInt(b.split('.')[0]);
          if(nameA > nameB)
            return 1;
          else if(nameA < nameB)
            return -1;
          return 0;
        });
        for(fn in files){
          if(fn > 0){
            doc.addPage();
          }
          doc.image(imageDir + '/' + files[fn], 0, 15, {width: 595,height:742})
        }
        doc.end();
        console.log('生成pdf完成,请到' + process.cwd() + pdfPath + '路径下查看');
      });
    })


}

exports.startDownload = (isbn) => {
  let url = util.format(conf.bookPageUrl,encodeURIComponent(isbn));
  getBookInfo(isbn)
    .then(bookInfo => {//获取到基本信息
      console.log("书籍ID：" + bookInfo.bookID);
      let pageNum = 1; //页码
      return getPage(bookInfo,pageNum).return(bookInfo);
    })
    .then((bookInfo)=>{
      console.log('下载结束,3s后开始生成pdf');//偷个懒保证图片下载完
      setTimeout(()=>{makePdf(bookInfo)}, 3000);
    })
    .catch(error => {
      console.log('抓取资源出错：' + error);
    });
};

