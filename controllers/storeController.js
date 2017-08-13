//before we can create a store, we gotta describe what the data will look like.
// like if we are making a spreadsheet, we'd first create the headers saying what kinds of data are going to be below.
// mongodb can be a loose database (dont have to specify what the data will look like ahead of time).  but by default, out of the box, mongo is strict
  // only can save data that it knows about beforehand.  if you add any kind of data, it can get out of hand and headaches appear when you scale.
  //so we're doing everything in strict mode! so we define the schema first.

const mongoose = require('mongoose');
const Store = mongoose.model('Store'); //comes from Store.js model, where it's exported

exports.homePage = (req, res) => {
  console.log(req.name)
  res.render('index');
}

exports.addStore = (req, res) => {
  res.render('editStore', { title:'Add Store' });
}

exports.createStore = async (req, res) => {
  const store = new Store(req.body);
  //what if someone passes us bad data in that req.body? it doesnt matter, in that store.js file,
  // we are using a strict schema and setting our types there, anything else gets thrown away.
  // you can keep adding fields:
  // store.age = 1;
  // store.cool = true;
  //but nothing is reflected until you call:
  await store.save();

  console.log("that shit was successfully saved, lets go back to the home page");
  res.redirect('/');
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
