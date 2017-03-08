var express = require("express");
var path = require("path");
var bodyParser = require("body-parser");
var crypto = require("crypto");
var mongoose = require('mongoose');
var common = require('./controller/common');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var models = require('./models/model');
var User = models.User;
var Note = models.Note;
var moment = require('moment');
mongoose.connect('mongodb://localhost:27017/Notes');
mongoose.connection.on('error', console.error.bind(console, '连接失败'));
var app = express();

//文件视图存放目录
app.set("views", path.join(__dirname, "views"));
//设置视图模板
app.set("view engine", "ejs");

//设置静态文件存放目录
app.use(express.static(path.join(__dirname, "puplic")));
app.use(session({
    key: 'session',
    secret: 'Keboard cat',
    cookie: {maxAge: null},
    store : new MongoStore({
        db: 'Notes',
        mongooseConnection: mongoose.connection
    }),
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', common.noLogin);
app.get('/', function (req,res) {

    Note.find({author: req.session.user.username})
        .exec(function (err, arts) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            }
            res.render('index',{
                title: '笔记列表',
                user : req.session.user,
                arts : arts,
                moment: moment
            });
        })
});
app.get('/', common.noLogin);
app.get('/detail/:_id', function (req, res) {
    Note.findOne({_id: req.params._id})
        .exec(function (err, art) {
            if (err) {
                console.log(err);
                return res.redirect('/');
            }
            if (art) {
                res.render("detail",{
                    title : '笔记详情',
                    user  : req.session.user,
                    art   : art,
                    moment: moment
                })
            }
        })
})


//register
app.get('/register', common.hasLogin);
app.get('/register', function(req, res){
    res.render('register', {
        title: '注册',
        user : req.session.user,
        page : 'register'
    })
});
app.post('/register',common.regCheck);


//login
app.get('/login', common.hasLogin);
app.get('/login', function (req, res) {
    res.render('login', {
        title: '登录',
        user : req.session.user,
        page : 'login'
    });
})
app.post('/login', common.loginCheck);


//post
app.get('/', common.noLogin);
app.get('/post', function (req, res) {
    res.render('post', {
        title: '发布',
        user : req.session.user
    })
})
app.post('/post', common.post);

//退出登录
app.get('/', common.hasLogin);
app.get('/quit' , common.quit);

app.listen(3000,function (req,reset) {
    console.log('app is running at port 3000');
});
