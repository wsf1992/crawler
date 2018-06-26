//数据表titles


const express = require('express');     //引入express框架
const request = require('superagent');  //用于发送请求
const cheerio = require('cheerio'); //用于处理返回的html
const mysql = require('mysql'); //引入muysql
const urls = require('./urls.js');


// 链接数据库
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'C1oudP8x&2017',
    database: 'book2'
})
connection.connect();

function InsertTable(content){     //插入数据库
    connection.query('insert into booktitles set ?',content,function(err,results){
        console.log(results)

    })
}

var app = express();    //创建入口函数

app.get('/',function(req,res){
    urls.forEach(function(url,index){
        requestMethod(url.url,res,index)   
    })
});


function requestMethod(url,response,index){       //请求的方法
    request
        .get(url)
        .end((err,res) => {
            // response.send(res.text)
            const $ = cheerio.load(res.text);
            let titles = [];
            $(".volume .cf li").each(function(index,elem){
                titles[index] = $(this).find("a").text();
            })
            obj = {
                id : index+1,
                name : $(".book-info h1 em").text(),
                titles : titles.join('-')
            };
            InsertTable(obj)
        })
}



// 监听300端口
app.listen(3000,function(){
    console.log('服务器已启动，监听3000端口')
})