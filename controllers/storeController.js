//before we can create a store, we gotta describe what the data will look like.
// like if we are making a spreadsheet, we'd first create the headers saying what kinds of data are going to be below.
// mongodb can be a loose database (dont have to specify what the data will look like ahead of time).  but by default, out of the box, mongo is strict
  // only can save data that it knows about beforehand.  if you add any kind of data, it can get out of hand and headaches appear when you scale.
  //so we're doing everything in strict mode! so we define the schema first.

const mongoose = require('mongoose');
const Store = mongoose.model('Store'); //comes from Store.js model, where it's exported
const User = mongoose.model('User');
const multer = require('multer'); //multer handles upload requests
const multerOptions = { //tell it what kinds of files to possibly require
  storage: multer.memoryStorage(),
  fileFilter: function(req, file, next) { //next is the callback value in the docs
    //have to say this is ok or not allowed
    const isPhoto = file.mimetype.startsWith('image/');
    if (isPhoto) {
      next(null, true); //passing next a first value, that means its an error.  passing null and then a value, that means it worked, and the second value is what needs to passed along
    } else {
      next({ message: 'that filetype isn\'t allowed, son!'}, false); //makes sure someone doesnt upload a pdf or mp4 or some crazy shit
    }
  }
}
const jimp = require('jimp');
const uuid = require('uuid'); //helps make file names unique.  in case kitten.png is taken, this will create uniq identifiers


exports.homePage = (req, res) => {
  console.log(req.name);
  req.flash('info', 'did you just refresh the page?');
  req.flash('success', 'this is the success flash');
  req. flash('error', 'this is the error flash');
  //these are all from the "locals" in our app.js file we incorporate it around 55.  locals are all the variables available to you in your template
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', { title:'Add Store' });
}

exports.upload = multer(multerOptions).single('photo');

exports.resize = async (req, res, next) => {
  //we dont need to upload a new file every time we edit the store.
  //first check if there's no new file to resize, if there's not file, dont do anything
  if (!req.file) {
    next(); //skip to next middleware, skips down to createstore
    return;
  }
  const extension = req.file.mimetype.split('/')[1];
  //set it up so that createstore has the info when it stores
  req.body.photo = `${uuid.v4()}.${extension}`;
  const photo = await jimp.read(req.file.buffer);
  await photo.resize(800, jimp.AUTO);
  await photo.write(`./public/uploads/${req.body.photo}`);
  //once we have written a photo to the file system, keep going :)
  //whole point of this is to resize and save to disk. and then just save reference to what photo is called so createStore has path to that spot
  next();

};

exports.createStore = async (req, res) => {
  req.body.author = req.user._id;
  const store = await (new Store(req.body)).save();
  //what if someone passes us bad data in that req.body? it doesnt matter, in that store.js file,
  // we are using a strict schema and setting our types there, anything else gets thrown away.
  // you can keep adding fields:
  // store.age = 1;
  // store.cool = true;
  //but nothing is reflected until you call:
  req.flash('success', `flash worked! you just created a store named ${store.name}`);
  res.redirect(`/store/${store.slug}`);
  //javascript on its own will not wait to see if it saved, it will just go straight to redirecting you
  // so we could put save on its own line, then chain some then(do this)
  //.then(do that) .then(store => {
  //   res.json(store);
  // })
  // .catch(err => {
  //   throw Error(err);
  // })
  // in ES8, we can use async await instead
}


exports.getStores = async (req, res) => {
  const stores = await Store.find();
  res.render('stores', {title: "Stores", stores})
}

const confirmOwner = (store, user) => {
  if (!store.author.equals(user._id)) { // have to use equals since store.author is an Object Id, cant use ===
    throw Error('you must own a store in order to edit it');
  }
}

exports.editStore = async (req, res) => {
  //1.find the store witht the given id (this can be done with the url params we route with!)
  const storeID = req.params.id;
  const store = await Store.findOne({ _id: storeID });
  // 2.confirm that the user is the owner of the store
  confirmOwner(store, req.user); 
  // 3.render the edit store form so user can make changes and save to database
  res.render('editStore', { title: `Edit ${store.name}`, store}); //dont need store: store since in ES6  we can omit duplicates if the name is exactly the same
}

exports.updateStore = async (req, res) => {
  //find and update the store
  //findOneAndUpdate is a mongoDB method that takes 3 params: a query, data, and options
  //first set the lcoation data to be a point (mongodb wont use the point attribute after updating anymore by default)
  req.body.location.type = 'Point';
  const store = await Store.findOneAndUpdate({ _id: req.params.id}, req.body, {
    new: true, // returns the new store, not the old one; we need updated data to redirect to a specific page
    runValidators: true, // so someone doesn't take out the description (our schema checks for empty strings only on creation)

  }).exec();
  //redirect them to the store and tell them it worked
  req.flash('success', `Successfully updated <strong>${store.name}</strong> <a href='/store/${store.slug}'>See it here</a>`);
  res.redirect(`/stores/${store._id}/edit`);

}

exports.getStoreBySlug = async (req, res) => {
  
  const store = await Store.findOne({ slug: req.params.slug }).populate('author reviews'); //populate method here gives us access to the author document if we h.dump it on the store.pug template
  //if mongodb doens't fnid anything, its just a query that returns null. so we need to handle that as a 404
  if(!store) return next();  //next will assume this is a middleware, and pass to the next step => goes to line 72 of app.js, which is the errorHandlers.notFound

  res.render('store', {store, title: store.name });
}

exports.getStoresByTag = async (req, res) => {
  const tagname = req.params.tag;
  const tagQuery = tagname || { $exists: true };
  const tagsPromise = Store.getTagsList();
  const storesPromise = Store.find({ tags: tagQuery});

  //dont await multiple lines, they will run one after the other.  for things that can run at the same time, put them into a Promise.all
  //use destructuring language to assign to multiple variables in one statement
  const [tags, stores] = await Promise.all([tagsPromise, storesPromise]);

  // res.json(stores);
  res.render('tags', {tags: tags, title: 'Tags', tagname, stores: stores});
}

exports.searchStores = async (req, res) => {
  const stores = await Store
  //first find the stores
  .find({
    $text: {
      $search: req.query.q
    }
  }, { // project/add a field
    score: { $meta: 'textScore' }//a listing with 2 instances of a word outscores 1
  })
  //then sort the stores by textscore
  .sort({
    score: { $meta: 'textScore'}
  })
  //limit to 5 results
  .limit(5)
  res.json(stores);
}

exports.mapStores = async (req, res) => {
  const coordinates = [req.query.lng, req.query.lat].map(parseFloat);
  const q = {
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates
        },
        $maxDistance: 10000 // 10,000 meters or 10km
      }
    }
  }
  const stores = await Store.find(q).select('slug name description location photo').limit(10);
  res.json(stores);
}

exports.mapPage = (req, res) => {
  res.render('map', { title: "map"});
}

exports.heartStore = async (req, res) => {
  const hearts = req.user.hearts.map(obj => obj.toString());
  const operator = hearts.includes(req.params.id) ? '$pull' : '$addToSet';
  const user = await User
    .findByIdAndUpdate(req.user._id,
      // { $addToSet: {hearts: req.params.id }} can use this, but since we have it in a variable, we can do this instead
      { [operator]: { hearts: req.params.id }},
      { new: true }
  );

  res.json(user);
}

exports.showHearts = async (req, res) => {
  const hearts = req.user.hearts;
  const stores = await Store.find( {
    _id: { $in: hearts}
  });
  res.render('stores', {title: "favorite stores", stores});
}

exports.showTopStores = async (req, res) => {
  //when we have complex queries of liek 5 - 7 things going on, we wanna stick that as close to the model as we can
  const stores = await Store.getTopStores();
  res.render('topStores', { stores, title: 'top stores'});
}