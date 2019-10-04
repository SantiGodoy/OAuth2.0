'use strict';

const express = require('express');
const app = express();
const logger = require('morgan');
const http = require('http');
const port = (process.env.PORT || 8080);
require('dotenv').config();
const bodyParser = require('body-parser');
const baseApi = '/api/v1';
const flash = require('connect-flash');
const passport = require('passport');
var GoogleStrategy = require('passport-google-oauth20').Strategy;
const usersList = require('./users-list');

/** SECURITY **/

passport.use(new GoogleStrategy({
    clientID: "",
    clientSecret: "",
    callbackURL: "http://localhost:8080/login/google/return",
    scope: "https://www.googleapis.com/auth/plus.login"    
  },
  function(accessToken, refreshToken, profile, cb) {
    usersList.findByToken(accessToken, function (err, user) {
      return cb(err, user);
    });
  }
));

/** APP SETTINGS **/

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.use(flash());

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: false
}));

app.use(require('express-session')({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

/** ROUTERS **/

app.get('/',
  function(req, res) {
    res.render('home', { user: req.user });
});

app.get('/login',
  function(req, res){
    res.render('login');
  });

app.get('/login/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/login/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
  });


/*

app.get('/login/google', passport.authenticate('google'));

app.get('/login/google/return', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  function(req, res) {
    res.redirect('/');
});

app.get('/profile',
  require('connect-ensure-login').ensureLoggedIn(),
  function(req, res){
    res.render('profile', { user: req.user });
});

*/

/***** *****/

const server = http.createServer(app);

server.listen(port, function () {
    console.log("Server with GUI up and running!");
});

module.exports = app;
