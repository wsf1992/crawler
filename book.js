//数据表titles


const express = require('express');     //引入express框架
const request = require('superagent');  //用于发送请求
const cheerio = require('cheerio'); //用于处理返回的html
const mysql = require('mysql'); //引入muysql
const async = require('async'); //引入async

const myurls = require('./urls.js')

// 链接数据库
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'C1oudP8x&2017',
    database: 'book2'
})
connection.connect();

function InsertTable(content,callback,id) {     //插入数据库
    async.mapLimit(content,10,function(sqlStr,callbacksss){
        connection.query('insert into book' + id + ' set ?', sqlStr, function (err, results) {
            if (err) {
                console.log(err)
            }
            console.log('第' + id + '本数的，第' +sqlStr.id + '插入完成')
            callbacksss(null,123)
        })
    },function(err,results){
        if(err){
            console.log(err)
        }
        console.log('第' + id + '本书完毕')
        callback(null,1)
    })

}

var app = express();    //创建入口函数

app.get('/', function (req, response) {
    response.send('请耐心等待')
    
    async.mapLimit(myurls, 10,function (url, callback) {
        request
            .get(url.url)
            .end((err, res) => {
                const $ = cheerio.load(res.text);
                let abcdef = [];
                $(".volume .cf li").each(function (index, elem) {
                    abcdef.push('https:' + $(this).find("a").attr('href'));
                });
                
                console.log('第' + url.id + '本书所有章节url获取完毕');
                console.log(abcdef)
                let num = 0;
                async.mapSeries(abcdef, function (item, callback1) {
                    num++;
                    request
                        .get(item)
                        .end((err1, res1) => {
                            if (err1) {
                                console.log(err);
                            }
                            const $1 = cheerio.load(res1.text);
                            obj = {
                                id: num,
                                err: 0,
                                bookName: $1("#bookImg").text(),
                                title: $1(".j_chapterName").text(),
                                content: $1(".j_readContent").text().trim(),//章节内容
                            };
                            console.log('第' + url.id + '本书第' + num + '章缓存完成，共' + abcdef.length + '章')
                            callback1(null, obj)
                        })
                }, function (err, results1) {
                    if (err) {
                        console.log(err);
                    };                
                    console.log('第' + url.id + '本书全部缓存完成')
                    InsertTable(results1,callback,url.id)
                    // callback(null, abcdef);
                    
                })




            })
    }, function (err, results) {
        if (err) {
            console.log(err)
        }
        console.log('所有书籍完成')
    })
});



// 监听300端口
app.listen(3000, function () {
    console.log('服务器已启动，监听3000端口')
})