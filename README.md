# shuwen-download
基于Node.JS的爬虫简单项目，[书问网](http://www.bookask.com/)pdf电子书下载

使用模块：bluebird、cheerio、mkdirp、pdfkit、request、request-promise、rimraf、fs

需要下载一个pdf电子书，百度谷歌后只在书问网有发现电子版，但是发现预览只能看几十页，简单测试后发现禁用cookie可以无限制预览，并且可以比较简单的爬到书籍图片，于是临时抱佛脚用Node.JS写了这个小工具

# 使用方法
先安装node.js环境
```
git clone https://gitee.com/981764793/shuwen-download.git
```
```
cd shuwen-download

npm i  (or cnpm i)

node app.js -h
  Usage: app [options]


  Options:

    -V, --version            output the version number
    -d,--download [书籍ISBN号]  开始下载
    -c,--clean               清理图片
    -g,--gen [bookID]        将已有图片文件夹生成pdf
    -h, --help               output usage information
```

在书问网搜索想要的书籍（此处不得不吐槽这网站搜索功能的不人性化），确认可以预览后复制书籍的ISBN号，运行node app.js -d xxx

xxx为isbn号，小几率情况会在中途出错，重试即可

example： <br/>
node app.js -d 9787302467410 <br/>
node app.js -d 9787302464914 <br/>
node app.js -d 9787121247446


