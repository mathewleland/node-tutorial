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
  photo: String
});

//before we save the new store, we wanna presupply a slug for it. but first check if the store's name has been modified
storeSchema.pre('save', function(next) {
  if (!this.isModified('name')) {
    next(); //just skip
    return;
  }
  this.slug = slug(this.name); //this uses the slug library above, then just sets the name to be whatever that output is
  next(); //kind of like middleware.  just says to move along. save doesnt happen until the work inside the function is done

  //TODO make more reseliant so that slugs are unique-212 (no two stores can have same slug!)
});

//how to make mongo know about this model now?  We go into start.js, and import all models!

module.exports = mongoose.model('Store', storeSchema);
