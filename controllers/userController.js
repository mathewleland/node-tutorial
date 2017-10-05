const mongoose = require('mongoose');
const User = mongoose.model('User');
const promisify = require('es6-promisify');

exports.loginForm = (req, res) => {
    res.render('login', {title: 'Log into your account'});
}

exports.registerForm = (req, res) => {
    res.render('register', {title: 'Register a new account'});
}

exports.validateRegister = (req, res, next) => {
    req.sanitizeBody('name'); // from expressValidator, a validation method that lives on top of that, always there for you
    // check the expressValidator github page for a bunch of documentation
    req.checkBody('name', 'You must supply a name!').notEmpty();
    req.checkBody('email', 'that email is not valid!').isEmail();
    req.sanitizeBody('email').normalizeEmail({
        remove_dots: false,
        remove_extension: false,
        gmail_remove_subaddress: false
    }); 
    //above will make mat.leland@gmail and matleland@googlemali.com the same thing: matleland@gmail.com
    //checking email and password will normally be stopped client side by the html5 validation, but this is so if someone disables that in their browser, the server doesnt accept it
    req.checkBody('password', 'Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Confirmed Password cannot be blank').notEmpty();
    req.checkBody('password-confirm', 'Oops! your passwords dont match son!').equals(req.body.password);

    const errors = req.validationErrors();
    if (errors) {
        req.flash('error', errors.map(err => err.msg));
        res.render('register', {
            title: 'Try again!', 
            body: req.body, 
            flashes: req.flash()
         });
    }
    next(); //there were no errors!`
    

}

//if we have hit the register, it means we have passed the validations
exports.register = async (req, res, next) => { //gotta pass next because it is middleware, we are just in the middle of creating the user
  const user = new User( {email: req.body.email, name: req.body.name });

  //we are using an external library that does not use promises,it is callback based.  so we use tha promisify
  // so instead of doing this: User.register(user, req.body.password, function(err, user) {})
  const registerWithPromise = promisify(User.register, User);
  await registerWithPromise(user, req.body.password);
  next();

}