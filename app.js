const program = require('commander');
const ShuWenUtil = require('./utils/ShuWenUtil');
const Promise = require('bluebird');
const rimraf = require('rimraf');
const conf = require('./utils/conf');

program.version('0.0.1')
  .option('-d,--download [ISBN]','开始下载')
  .option('-c,--clean','清理图片')
  .option('-g,--gen [bookID]','将已有图片文件夹生成pdf')
  .parse(process.argv);

if(program.clean){
  rimraf.sync(conf.imageDir);
}

if(program.download){
  let isbn = program.download;
  console.log('开始爬取：' + program.download);
  ShuWenUtil.startDownload(isbn);
}

if(program.gen){
  let bookInfo = {
    bookID:program.gen,
    bookTitle:program.gen
  }

  ShuWenUtil.makePdf(bookInfo);
}

