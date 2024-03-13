const express = require('express')
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../routes/campgrounds')
const reviews = require('../routes/reviews')
const ExpressError = require('../utils/errorClass');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        return res.status(400).send(msg); 
    }
    next();
};
router.delete('/:reviewId',catchAsync(async (req,res) => {
    const {id,reviewId} = req.params;   
    await Campground.findByIdAndUpdate(id,{ $pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
        
}))
router.post('/', validateReview, catchAsync(async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    req.flash('success','successfully made a review!');
    res.redirect(`/campgrounds/${camp._id}?success=true`);
}));
module.exports = router;