const express = require('express')
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../routes/campgrounds')
const reviews = require('../routes/reviews')
const ExpressError = require('../utils/errorClass');
const {isLoggedIn,validateReview,isReviewAuthor}= require('../middleware')

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(async (req,res) => {
    const {id,reviewId} = req.params;   
    await Campground.findByIdAndUpdate(id,{ $pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
        
}))
router.post('/',isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id; 
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    req.flash('success','successfully made a review!');
    res.redirect(`/campgrounds/${camp._id}?success=true`);
}));
module.exports = router;