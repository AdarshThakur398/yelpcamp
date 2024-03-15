const express = require('express');
const router=express.Router();
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../Schemas.js');
const Review = require('../models/review');
const campground = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/errorClass');
const {isLoggedIn,isAuthor,storeReturnTo,validateReview,validateCampground,isReviewAuthor} = require('../middleware')


router.delete('/:id', catchAsync(campground.deleteCampground));


router.route('/') 
  .get(catchAsync(campground.index))
  .post(isLoggedIn, validateCampground, catchAsync(campground.newCampGround));

router.get('/new',isLoggedIn  ,campground.newFormRender);
router.route('/:id')
   .get( catchAsync(campground.showCampground))

   .put(isLoggedIn,isAuthor,catchAsync(campground.updateCampground));




router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campground.renderEditForm));



module.exports = router;
