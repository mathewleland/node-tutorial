const passport = require('passport');

exports.login = passport.authenticate('local', {
  failureRedirect: '/login',
  failureFlash: 'Failed Login!',
  successRedirect: '/',
  successFlash: 'You are now logged in bro! that\'s dope!'
});

exports.logout = (req, res) => {
  req.logout();
  req.flash('success', 'You are now logged out. Not dope.');
  res.redirect('/');
}

exports.isLoggedIn = (req, res, next) => {
  //first check if user is authenticated
  if(req.isAuthenticated()) {
    next(); // carry on! they are already logged in
    return;
  }
  req.flash('error', 'you must be logged in to add stores');
  res.redirect('/login');
}