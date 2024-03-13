const express = require('express');
const router=express.Router();
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../Schemas.js');
const Review = require('../models/review');

const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/errorClass');
const {isLoggedIn,isAuthor,storeReturnTo,validateReview,validateCampground,isReviewAuthor} = require('../middleware')


router.delete('/:id', catchAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
}));

router.delete('/:id/reviews/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async (req,res) => {
    const {id,reviewId} = req.params;   
    await Campground.findByIdAndUpdate(id,{ $pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
        
}));


router.get('/' , catchAsync(async (req, res) => {
    const campgrounds = await Campground.find({}); 
    res.render('campgrounds/index', { campgrounds });
    if (req.isAuthenticated()) {
     
        const userId = req.user._id;
        console.log('User ID: ' + userId);
    }
}));
 
router.post('/:id/reviews', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id; 
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));



router.get('/new',isLoggedIn  ,(req, res) => {
   
    res.render('campgrounds/new');
});

router.get('/:id', catchAsync(async (req, res) => {
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
}));

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(async (req, res) => {
   const {id} = req.params;
    const camp = await Campground.findById(id);
    if (!camp) {
        req.flash('error',"NO SUCH CAMPGROUND EXIST!!")
        return res.redirect('/campgrounds')
    }
  
    res.render('campgrounds/edit', { camp });
}));

router.post('/',isLoggedIn, validateCampground, catchAsync(async (req, res) => {
    const camp = new Campground(req.body);
    
    camp.author = req.user._id;
    await camp.save();
    
    req.flash('success',"Successfully made a new campground!!")
    res.redirect(`/campgrounds/${camp.id}`);
}));

router.put('/:id', isLoggedIn,isAuthor,catchAsync(async (req, res) => {
    const { id } = req.params;
   
    const camp = await Campground.findByIdAndUpdate(id, { ...req.body });
    req.flash('success',"successfuly updated!")
    res.redirect(`/campgrounds/${camp._id}`);
}));

module.exports = router;
