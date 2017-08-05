//before we can create a store, we gotta describe what the data will look like.
// like if we are making a spreadsheet, we'd first create the headers saying what kinds of data are going to be below.
// mongodb can be a loose database (dont have to specify what the data will look like ahead of time).  but by default, out of the box, mongo is strict
  // only can save data that it knows about beforehand.  if you add any kind of data, it can get out of hand and headaches appear when you scale.
  //so we're doing everything in strict mode! so we define the schema first.

exports.homePage = (req, res) => {
  console.log(req.name)
  res.render('tester');
}

exports.addStore = (req, res) => {
  res.render('editStore', { title: Add Store });
}
