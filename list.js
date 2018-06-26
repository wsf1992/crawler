// 数据表list
const express = require('express');
const request = require('superagent');
const cheerio = require('cheerio');
const mysql = require('mysql');
const urls = require('./urls.js');

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'C1oudP8x&2017',
    database: 'book2'
})
connection.connect();


function InsertTable(content){     //插入数据库
    connection.query('insert into booklist set ?',content,function(err,results){
        console.log(err)

    })
}


var app = express();

app.get('/',function(req,res){
    urls.forEach(function(url,index){
        requestMethod(url.url,res,index)   
    })
})


function requestMethod(url,response,index){       //请求的方法
    request
        .get(url)
        .end((err,res) => {
            // response.send(res.text)
            const $ = cheerio.load(res.text);
            obj = {
                id : index+1,//小说id
                name : $(".book-info h1 em").text(),//小说名称
                author : $(".book-info h1 a").text(),//小说作者
                images : $("#bookImg img").attr('src'),//图片地址
                ratings : Math.random()*10,//评分
                wordcount : 10000,//字数
                type : $(".book-info .tag-box .tag i").eq(3).text(),//书籍类型
                intro : $(".book-info .intro").text().trim(),//书籍简介
                serialize : $(".book-info .tag-box .tag i").first().text(),//小说状态
                like : '',//类似推荐
            };
            // response.send(obj)
            InsertTable(obj)
        })
};


app.listen(3000,function(){
    console.log('已成功监听3000端口');
})