const passport = require('passport');
const crypto = require('crypto');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');
const mail = require('../handlers/mail');

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
};

exports.forgot = async (req, res) => {
    // 1. see if user with email exists
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
        req.flash('error', 'No user with that email');
        return res.redirect('/login');
    }
    // 2.if there is a user, need to make a reset token and expiry on account
    user.resetPasswordToken = crypto.randomBytes(20).toString('hex');
    user.resetPasswordExpires = Date.now() + 3600000; // 1hr from now
    await user.save();
    //3. send them an email with the token
    const resetURL = `http://${req.headers.host}.account/reset/${user.resetPasswordToken}`;
    mail.send({
        user: user,
        subject: 'Password reset link',
        resetURL: resetURL
    })
    req.flash('success', `You have been emailed a password reset link.`);

    //4. redirect to the login page
    res.redirect('/login');
}

exports.reset = async (req, res) => {
     const user = await User.findOne({
         resetPasswordToken: req.params.token,
         resetPasswordExpires: { $gt: Date.now() }
     });
     if (!user) {
         req.flash('error', 'Password reset is invalid or has expired');
         return res.redirect('/login');
     }
     // if ther eis a user, show the reset password form!
     res.render('reset', {title: 'Reset your password'});
}

exports.confirmedPasswords = (req, res, next) => {
    if(req.body.password === req.body['password-confirm']) {
        next(); //keep it going!
        return; //passes to update controller
    }
    req.flash('error', 'Passwords do not match');
    res.redirect('back');
}

exports.update = async (req, res) => {
    const user = await User.findOne({
        resetPasswordToken: req.params.token,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        req.flash('error', 'Password reset is invalid or has expired');
        return res.redirect('/login');
    }
    
    const setPassword = promisify(user.setPassword, user); //binds promisify to the user
    await setPassword(req.body.password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    const updatedUser = await user.save();
    await req.login(updatedUser); //nice feature from passportjs
    req.flash('success', 'password has been reset');
    res.redirect('/');
}