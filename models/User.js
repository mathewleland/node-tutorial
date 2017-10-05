const mongoose = require('mongoose');
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
const md5 = require('md5');
const validator = require('validator');
const mongodbErrorHandler = require('mongoose-mongodb-errors');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
      type: String,
      unique: true,
      lowercase: true, // will always lowercase an email for you
      trim: true,
      validate: [validator.isEmail, 'Invalid Email Address'], //make sure this is proper email, first takes function for proper email address, then the message if it is not
      require: 'Please enter an email addy',
},
  name: {
      type: String,
      required: 'You need to have a name',
      trim: true
  }
});

userSchema.plugin(passportLocalMongoose, {usernameField: 'email'}); //gives us a register method to use in our userContorller
userSchema.plugin(mongodbErrorHandler);


//when you dont exports.something else, it sends whatever its assigned to here.
// so when requiring the file, this is what we'll get
module.exports = mongoose.model('User', userSchema)