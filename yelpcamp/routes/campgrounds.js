const express = require('express');
const router=express.Router();
const Campground = require('../models/campground');
const { campgroundSchema, reviewSchema } = require('../Schemas.js');
const Review = require('../models/review');
const campground = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/errorClass');
const {isLoggedIn,isAuthor,storeReturnTo,validateReview,validateCampground,isReviewAuthor} = require('../middleware')
const {storage} = require('../cloudinary')
const multer  = require('multer')
const upload = multer({ storage: storage, limits: { fieldSize: 10 * 1024 * 1024 } });

uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
      console.error('Multer error:', err);
      return res.status(400).send('Multer error: ' + err.message);
  } else {
      console.error('Other error:', err);
      return res.status(500).send('Internal Server Error');
  }
};

router.delete('/:id', catchAsync(campground.deleteCampground));


router.route('/') 
  .get(catchAsync(campground.index))
  .post(upload.array('file'),isLoggedIn, validateCampground, catchAsync(campground.newCampGround));
 // .post(upload.array("file",{name:"file"}),(req,res) => {
  

router.get('/new',isLoggedIn  ,campground.newFormRender);
router.route('/:id')
   .get( catchAsync(campground.showCampground))

   .put(isLoggedIn,isAuthor,catchAsync(campground.updateCampground));

router.get('/:id/edit',isLoggedIn,isAuthor, catchAsync(campground.renderEditForm));

module.exports = router;
