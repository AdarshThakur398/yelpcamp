const express = require('express');
const router=express.Router();

const { campgroundSchema, reviewSchema } = require('../Schemas.js');
const Review = require('../models/review');
const campground = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/errorClass');
const {isLoggedIn,isAuthor,storeReturnTo,validateReview,validateCampground,isReviewAuthor} = require('../middleware')
const {storage} = require('../cloudinary')
const multer  = require('multer')
const upload = multer({storage})




    
const Campground = require('../models/campground');
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', { campgrounds }); 
    if (req.isAuthenticated()) {
     
        const userId = req.user._id;
      
    }
}

module.exports.newFormRender = (req, res) => {
   
    res.render('campgrounds/new');
}

module.exports.newCampGround = async (req, res) => {
    
    const camp = new Campground(req.body);
    camp.images = req.files.map( f => ({url:f.path,filename:f.filename}));
    
    camp.author = req.user._id;
    await camp.save();
    console.log(req.body);
    req.flash('success',"Successfully made a new campground!!")
    res.redirect(`/campgrounds/${camp.id}`); 

 
}

module.exports.renderEditForm = async (req, res) => {
    const {id} = req.params;
     const camp = await Campground.findById(id);
     if (!camp) {
         req.flash('error',"NO SUCH CAMPGROUND EXIST!!")
         return res.redirect('/campgrounds')
     }
   
     res.render('campgrounds/edit', { camp });
 }

 module.exports.showCampground = async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path:'author'
        }}).populate('author');
    console.log(camp);
    if (!camp) {
        req.flash('error',"Campground not available!");
        return res.redirect('/campgrounds');
    }
    const random = Math.floor(Math.random() * 20);
    res.render('campgrounds/show', { camp, random });
}

module.exports.updateCampground = async (req, res) => {
    const { id } = req.params;
   
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body });
    req.flash('success',"successfuly updated!")
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}

