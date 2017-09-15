//before we can create a store, we gotta describe what the data will look like.
// like if we are making a spreadsheet, we'd first create the headers saying what kinds of data are going to be below.
// mongodb can be a loose database (dont have to specify what the data will look like ahead of time).  but by default, out of the box, mongo is strict
  // only can save data that it knows about beforehand.  if you add any kind of data, it can get out of hand and headaches appear when you scale.
  //so we're doing everything in strict mode! so we define the schema first.

const mongoose = require('mongoose');
const Store = mongoose.model('Store'); //comes from Store.js model, where it's exported

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

exports.createStore = async (req, res) => {
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

exports.editStore = async (req, res) => {
  //find the store witht the given id (this can be done with the url params we route with!)
  const storeID = req.params.id;
  const store = await Store.findOne({ _id: storeID });
  // res.json(store);
  // confirm that the user is the owner of the store
  // render the edit store form so user can make changes and save to database
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
  req.flash('success', `Successfully updated <strong>${store.name}</strong> <a href='/stores/${store.slug}'>See it here</a>`);
  res.redirect(`/stores/${store._id}/edit`);

}
