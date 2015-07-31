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
  mongoose.connect('mongodb://127.0.0.1/test');
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
    console.log(hash);
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

usersSchema.methods.userExists = function(username) {
  var self = this;
  return new Promise(function(resolve, reject) {
    self.model('users').find({username: username}, function(err, found) {
      if (err) {
        reject(err);
      } 
      else {
        if (found) {
          resolve(true);
        }
        else {
          resolve(false);
        }
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

  //var test = new Link({url: 'http://www.roflzoo.com/', base_url:'test', title: 'test'}).save();
  //var user = new User({username: "test", password: "test"}).save();
  //console.log(user.password);
  // var User = mongoose.model('users', usersSchema);
      // usersSchema.pre('save', function(next)  {
      //   var shasum = cryto.createHash('sha1');
      //   shasum.update()
      // });

  //   if (names.indexOf('urls') === -1) {
      
  //   }
  // });

});
module.exports = db;

// var Bookshelf = require('bookshelf');

// var db = Bookshelf.initialize({
//   client: 'sqlite3',
//   connection: {
//     host: '127.0.0.1',
//     user: 'your_database_user',
//     password: 'password',
//     database: 'shortlydb',
//     charset: 'utf8',
//     filename: path.join(__dirname, '../db/shortly.sqlite')
//   }
// });

// db.knex.schema.hasTable('urls').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('urls', function (link) {
//       link.increments('id').primary();
//       link.string('url', 255);
//       link.string('base_url', 255);
//       link.string('code', 100);
//       link.string('title', 255);
//       link.integer('visits');
//       link.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });

// db.knex.schema.hasTable('users').then(function(exists) {
//   if (!exists) {
//     db.knex.schema.createTable('users', function (user) {
//       user.increments('id').primary();
//       user.string('username', 100).unique();
//       user.string('password', 100);
//       user.timestamps();
//     }).then(function (table) {
//       console.log('Created Table', table);
//     });
//   }
// });


//module.exports = db;
