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
const {cloudinary} =  require('../cloudinary')


const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding")
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder=mbxGeocoding({accessToken:mapBoxToken})


    
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

module.exports.newCampGround = async (req, res,next) => {
       const geoData = await geocoder.forwardGeocode({
        query:req.body.location,
        limit:1
    }).send()


    const camp = new Campground(req.body);
    camp.geometry = geoData.body.features[0].geometry;
    camp.image = req.files.map( f => ({url:f.path,filename:f.filename}));
    
    camp.author = req.user._id;
    await camp.save();
   
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

 module.exports.showCampground = async (req, res,next) => {
    const camp = await Campground.findById(req.params.id).populate({
        path:'reviews',
        populate: {
            path:'author'
        }}).populate('author');
 
    if (!camp) {
        req.flash('error',"Campground not available!");
        return res.redirect('/campgrounds');
    }
    const random = Math.floor(Math.random() * 20);
    res.render('campgrounds/show', { camp, random });
}

module.exports.updateCampground = async (req, res) => {
    console.log(req.body)
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body });
    const imgs = req.files.map( f => ({url:f.path,filename:f.filename}));
    camp.images.push(...imgs);
    await camp.save();
    for (let filename in req.body.deleteImages) 
    {
        await cloudinary.uploader.destroy(filename)
    }
    if (req.body.deleteImages) { 
       await  camp.updateOne({$pull: {images: {filename: { $in: req.body.deleteImages}}}})
    }
    req.flash('success',"successfuly updated! ")
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}

