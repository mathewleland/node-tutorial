const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const reviewSchema = new mongoose.Schema({
  created: {
    type: Date,
    defalt: Date.now()
  },
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: 'You have to have an author!'
  },
  store: {
    type: mongoose.Schema.ObjectId,
    ref: 'Store',
    required: 'A review has to be associated with a store!'
  },
  text: {
    type: String,
    required: 'Please give a brief review'
  },
  rating: {
    type: Number,
    min:1,
    max:5
  }
});

function autopopulate(next) {
  this.populate('author');
  next();
}

reviewSchema.pre('find', autopopulate);
reviewSchema.pre('findOne', autopopulate);

module.exports = mongoose.model('Review', reviewSchema);