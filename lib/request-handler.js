var request = require('request');
var crypto = require('crypto');
var bcrypt = require('bcrypt-nodejs');
var util = require('../lib/utility');

var db = require('../app/config');

exports.renderIndex = function(req, res) {
  res.render('index');
};

exports.signupUserForm = function(req, res) {
  res.render('signup');
};

exports.loginUserForm = function(req, res) {
  res.render('login');
};

exports.logoutUser = function(req, res) {
  req.session.destroy(function(){
    res.redirect('/login');
  });
};

exports.fetchLinks = function(req, res) {
  // Links.reset().fetch().then(function(links) {
  //   res.send(200, links.models);
  // })
  db.models.urls.find().exec()
  .then(function(models) {
    res.send(200, models);
  });
};

exports.saveLink = function(req, res) {
  var uri = req.body.url;
  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  util.linkExists(uri)
  .then(function(found) {
    if (found) {
      res.send(200, found);
    }
    else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var newLink = new db.models.urls({
          url: uri,
          title: title,
          base_url: req.headers.origin
        }).save(function(err, savedLink) {
          if (err) console.log(err);
          res.send(200, savedLink);
        })

      })
    }
  })
};

exports.loginUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  util.userExists(username)
  .then(function(found) {
    if (!found) {
      res.redirect('/login');
    }
    else {
      found.comparePassword(password)
      .then(function(match) {
        if (match) {
          util.createSession(req, res, found);
        }
        else {
          res.redirect('/login');
        }
      })
    }
  });
};

exports.signupUser = function(req, res) {
  var username = req.body.username;
  var password = req.body.password;

  util.userExists(username)
  .then(function(exists) {
    if (!exists) {
      var newUser = new db.models.users({username: username, password: password})
      newUser.save(function(err, savedUser) {
        util.createSession(req, res, savedUser);
      });
    }
    else {
      console.log('Accound already exists');
      res.redirect('/signup');
    }
  })
  
};

exports.navToLink = function(req, res) {

  db.models.urls.findOne({code: req.params[0]}).exec()
  .then(function(link) {
    if (!link) {
      res.redirect('/');
    }
    else {
      link.visits += 1;
      link.save(function (err, savedLink) {
        return res.redirect(savedLink.url);
      });
    }
  })

};