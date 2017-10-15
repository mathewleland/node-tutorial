// mongoose is the package we use to interface with MongoDB.  mongoose is how we interface with Mongo in node
// then we tell mongoose to use the global promise.  there's different ways to wait for data.  since we are using
   // async await, we wanna use the global Promise (like type in Promise into the chrome dev tools) to get the native Promise
   // usually dont put anything on global.anythinghere
//slugs library allows us to make url friendly names


const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const slug = require('slugs')


//do all data normalization as close to the model as possible.  so like below, our store name is trimmed
const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: "please enter a store name" //instead of using true, or else there'd be some weird mongodb error message
  },
  slug: String,
  description: {
    type: String,
    trim: true
  }, 
  tags: [String], //our tags will be an array of strings, and when tags are passed they are put inside the array here
  created: {
    type: Date,
    default: Date.now
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: [{
      type: Number,
      required: 'You must supply coordinates!'
    }],
    address: {
      type: String,
      required: 'You must supply an address'
    }
  },
  photo: String,
  author: {
    type: mongoose.Schema.ObjectId,
    ref: 'User', // we are going to store just the object, but it's a reference to the user,
    required: 'You must supply an author'
  }

}, { // this here is really just to be able to h.dump it on the page before loading it.  will work without these
  toJSON: { virtuals: true},
  toObject: { virtuals: true }
});

//define our indexes
storeSchema.index({
  name: 'text',
  description: 'text'
});

storeSchema.index({ location: '2dsphere'})

//before we save the new store, we wanna presupply a slug for it. but first check if the store's name has been modified
storeSchema.pre('save', async function(next) {
  if (!this.isModified('name')) {
    next(); //just skip
    return;
  }
  this.slug = slug(this.name); //this uses the slug library above, then just sets the name to be whatever that output is
  //need to make sure that there are no duplicates, see if corleones-1, corleones-2 exist. use regex
  const slugRegEx = new RegExp(`^(${this.slug})((-[0-9]*$)?)$`, 'i');
  //look for something that starts with the slug and ends in maybe a number. $ means ends with, the ? means optional, i ignores case
  const storesWithSlug = await this.constructor.find({ slug: slugRegEx });
  if (storesWithSlug.length) {
    this.slug = `${this.slug}-${storesWithSlug.length + 1}`;
  }
  console.log('stores with slug comes out as ');
  console.log(storesWithSlug);


  next(); //kind of like middleware.  just says to move along. save doesnt happen until the work inside the function is done

  //TODO make more reseliant so that slugs are unique-212 (no two stores can have same slug!)
});

//put a method on the schema, use name.statics.method
storeSchema.statics.getTagsList = function() {
  return this.aggregate([
    { $unwind: '$tags' }, //$ says this is a field on my document
    { $group: { _id: '$tags', count: { $sum: 1 } }},
    { $sort: { count: -1 }} // sort ascending (1) or by descending (-1)
  ]);
};

// find reviews where the stores _id property === reviews store property
storeSchema.virtual('reviews', {
  //tell it to go to another model and do a quick query
  ref: 'Review', //what model to link?
  localField: '_id', // which field on the store?
  foreignField: 'store' // which field on the review?
});

//how to make mongo know about this model now?  We go into start.js, and import all models!

module.exports = mongoose.model('Store', storeSchema);
