var crypto = require('crypto');
var mongoose = require('mongoose');
var session = require('express-session');
var MongoStore = require('connect-mongo')(session);
var models = require('../models/model');
var User = models.User;
var Note = models.Note;

exports.regCheck = function(req,res){
    var username = req.body.username,
        password = req.body.password,
        passwordRepeat = req.body.passwordRepeat;

    User.findOne({username: username}, function (err, user) {
        if(err) {
            console.log(err);
            return res.redirect('/register');
        }

        if(user){
            console.log('用户名已存在');
            return res.redirect('/register');

            return;
        }

        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');

        var newUser = new User({
            username : username,
            password : md5password
        });
        if(password != passwordRepeat){
            console.log('两次输入的密码不一致！');
            return res.redirect('/register');

            return;
        }
        newUser.save(function (err,doc) {
            if(err){
                console.log(err);
                return res.redirect('/register');
            }else{
                console.log('注册成功');
                newUser.password = null;
                delete newUser.password;
                req.session.user = newUser;
                return res.redirect('/');
            }
        });
    })
};


exports.loginCheck = function (req, res) {
    var username = req.body.username,
        password = req.body.password;

    User.findOne({username:username}, function (err,user) {
        if(err){
            console.log(err);
            return next(err);
        }
        if(!user){
            console.log('用户名不存在！');
            return res.redirect('/login');
        }
        var md5 = crypto.createHash('md5'),
            md5password = md5.update(password).digest('hex');
        if(user.password !== md5password){
            console.log('密码错误！');
            return res.redirect('/login');
        }
        console.log('登录成功！');
        user.password = null;
        delete user.password;
        req.session.user = user;
        return res.redirect('/');
    });

}

exports.post = function (req, res) {
    var note = new Note({
        title  : req.body.title,
        author : req.session.user.username,
        tag    : req.body.tag,
        content: req.body.content
    });

    note.save(function (err, doc) {
        if (err) {
            console.log(err);
            return res.redirect('/post');
        }
        console.log('文章发表成功!');
        return res.redirect('/');
    });
}

exports.hasLogin = function (req, res, next) {
    if(req.session.user){
        console.log('您已经登录');
        return res.redirect('back');
    }
    next();
}

exports.noLogin = function (req, res, next) {
    if(!req.session.user){
        console.log('抱歉您还没有登录');
        return res.redirect('/login');
    }
    next();
}

exports.quit = function (req, res) {
    req.session.destroy(function (err) {
        if(err){
            console.log('退出失败');
            return res.redirect('/');
        }
        console.log('退出成功');
        return res.redirect('/login');
    })
}
