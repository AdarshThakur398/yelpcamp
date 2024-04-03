const User = require('../models/user');

module.exports.postRegisterForm = async (req,res) => {
    try { 
     const {email,username,password} = req.body;
     const user = new User({email,username});
     const registeredUser= await User.register(user,password);
     req.login(registeredUser, err => {
         if(err) {
             return next(err);
         }
           req.flash('success','welcome to yelpcamp!!')
           res.redirect('/campgrounds') }
     )
    }
   
     catch(e) {
         req.flash('error',e.message);
         res.redirect('/register')
     }
 }

 module.exports.renderLoginForm = (req,res) => { 
    res.render('./users/login') 
}


module.exports.postLogin =(req,res) => {
    req.flash('success','successfully logged in!') 
   
    const  redirectUrl = res.locals.returnTo  || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.renderRegister = (req,res) => {
    res.render('./users/register')
}

module.exports.logout = (req, res, next) => { 
    req.logout(function (err) { 
        if (err) { 
            return next(err);
        } 
        req.flash('success', 'Goodbye!'); 
        res.redirect('/login'); 
    });  
}