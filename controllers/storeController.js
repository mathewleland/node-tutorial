exports.matsMiddleware = (req, res, next) => {
  req.name = "matty";
  res.cookie('name', req.name, {maxAge: 10000});
  if (req.name === "matty") {
    throw Error('Thats my name too')
  }
  next();
}

exports.homePage = (req, res) => {
  console.log(req.name)
  res.render('tester');
}
