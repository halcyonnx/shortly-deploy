var path = require('path');
var mongoose = require('mongoose');
var crypto = require('crypto');
var Promise = require('bluebird');
var bcrypt = require('bcrypt-nodejs');

if (process.env.NODE_ENV === 'production') {
  console.log("this is ", process.env.NODE_ENV);
  mongoose.connect('mongodb://MongoLab-c:VgnCQ4kDo4G450FSfyxt9fmzy7i1_w33QSFsA9cVOQE-@ds038888.mongolab.com:38888/MongoLab-c');
}
else {
  mongoose.connect('mongodb://MongoLab-c:VgnCQ4kDo4G450FSfyxt9fmzy7i1_w33QSFsA9cVOQE-@ds038888.mongolab.com:38888/MongoLab-c');
}

var db = mongoose.connection;
//db.on('error', console.error("THERE was a connection error to mongodb"));
var usersSchema = mongoose.Schema({
  id: mongoose.Schema.Types.ObjectId,
  username: {type: String, unique: true},
  password: {type: String}

});

usersSchema.pre('save', function(next) {
  var self = this;
  bcrypt.hash(this.password, null, null, function(err, hash) {
    self.password = hash;
    next();
  });
});

usersSchema.methods.comparePassword = function(attemptedPassword) {
  var self = this;
  return new Promise(function(resolve, reject) {
    bcrypt.compare(attemptedPassword, self.password, function(err, isMatch) {
      if (err) {
        reject(err);
      }
      else {
        resolve(isMatch);
      }
    });
  });
};

var urlsSchema = mongoose.Schema({
  id: { type: mongoose.Schema.Types.ObjectId, unique: true},
  url: {type: String},
  base_url: {type: String},
  code: {type: String},
  title: {type: String},
  visits: {type: Number, default: 0}

});

urlsSchema.pre('save', function(next) {
  var shasum = crypto.createHash('sha1');
  shasum.update(this.url);
  this.code = shasum.digest('hex').slice(0,5);
  next();
});

db.once('open', function (){
  //console.log("WE HAVE CONNECTED");
  

  var Link = mongoose.model('urls', urlsSchema);
  var User = mongoose.model('users', usersSchema);


});
module.exports = db;

