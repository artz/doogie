var mongoose = require('mongoose');
var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;
var User = mongoose.model('User');
var app = require('express')();
var env = app.get('env').toLowerCase();
var config = require('../config')[env];
var debug = require('debug')('doogie');

var isNew = true;
User.findOne({}, function (err, users) {
  if (users) {
    isNew = false;
  }
});

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new TwitterStrategy({
  consumerKey: config.twitter.key,
  consumerSecret: config.twitter.secret,
  callbackURL: config.host + '/auth/twitter/callback'
}, function (token, tokenSecret, profile, done) {
  debug('Running Twitter strategy.');
  User.findOne({
    account: 'twitter~' + profile.id
  }, function (err, user) {
    if (user) {
      debug('Returning current user.');
      return done(err, user);
    }
    debug(profile);
    user = {
      account: 'twitter~' + profile.id,
      username: profile.username,
      displayName: profile.displayName,
      roles: []
    };
    if (isNew) {
      user.roles.push('admin');
    }
    User.create(user, function (err, user) {
      debug('Returning new user.');
      done(err, user);
    });
  });
}));

module.exports = function (app) {

  app.use(passport.initialize());
  app.use(passport.session());

  app.get('/auth/twitter', passport.authenticate('twitter'));

  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/',
      failureRedirect: '/'
    })
  );

  app.get('/auth/user', function (req, res) {
    if (req.user) {
      res.json(req.user);
    } else {
      res.status(401).send();
    }
  });

  app.get('/auth/logout', function (req, res) {
    req.logout();
    res.redirect('/');
  });
};
