const express = require('express')
const router = express.Router({mergeParams:true});
const catchAsync = require('../utils/catchAsync');
const campgrounds = require('../routes/campgrounds')
const reviews = require('../routes/reviews')
const Campground = require('../models/campground');
const Review = require('../models/review');
const ExpressError = require('../utils/errorClass');
const {isLoggedIn,validateReview,isReviewAuthor}= require('../middleware')
const review = require('../controllers/reviews')

router.delete('/:reviewId',isLoggedIn,isReviewAuthor,catchAsync(review.deleteReview))
router.post('/',isLoggedIn, validateReview, catchAsync(review.postReview));
module.exports = router;