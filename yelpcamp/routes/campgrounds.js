const express = require('express');
const router=express.Router();
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../Schemas.js');
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/errorClass');
const {isLoggedIn} = require('../middleware')
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        return res.status(400).send(msg); 
    }
    next();
};
const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        return res.status(400).send(msg); 
    }
    next();
};
router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

router.delete('/:id/reviews/:reviewId',catchAsync(async (req,res) => {
    const {id,reviewId} = req.params;   
    await Campground.findByIdAndUpdate(id,{ $pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
        
}));


router.get('/' , catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', { campgrounds });
    if (req.isAuthenticated()) {
        // User is authenticated, access user ID from req.user._id
        const userId = req.user._id;
        console.log('User ID: ' + userId);
    }
}));
 
router.post('/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));


router.get('/new',isLoggedIn  ,(req, res) => {
   
    res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id).populate('reviews').populate('author');
    if (!camp) {
        req.flash('error',"Campground not available!");
        return res.redirect('/campgrounds');
    }
    const random = Math.floor(Math.random() * 20);
    res.render('campgrounds/show', { camp, random });
}));

router.get('/:id/edit',isLoggedIn, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
 
    res.render('campgrounds/edit', { camp });
}));

router.post('/',isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground(req.body);
    camp.author = req.user._id;
    await camp.save();
   
    req.flash('success',"Successfully made a new campground!!")
    res.redirect(`/campgrounds/${camp.id}`);
}));

router.put('/:id', isLoggedIn,catchAsync(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body });
    req.flash('success',"successfuly updated!")
    res.redirect(`/campgrounds/${camp._id}`);
}));
module.exports = router;

