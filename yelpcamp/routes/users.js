const express = require('express')
const router = express.Router();
const catchAsync=require('../utils/catchAsync')
const User = require('../models/user');
const passport = require('passport')
const { storeReturnTo } = require('../middleware'); 


const user = require('../controllers/users')
router.route('/register')
     .get( user.renderRegister) 
     .post(catchAsync(user.postRegisterForm)) 

router.route('/login')
     .get(user.renderLoginForm)
     .post(passport.authenticate('local',{failureFlash:true,failureRedirect:'/login'}),user.postLogin) 

router.get('/logout', user.logout); 

module.exports=router;
