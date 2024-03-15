const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.deleteReview = async (req,res) => {
    const {id,reviewId} = req.params;   
    await Campground.findByIdAndUpdate(id,{ $pull: {reviews:reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`)
        
}
module.exports.postReview = async (req, res) => {
    const camp = await Campground.findById(req.params.id);
    const newReview = new Review(req.body.review);
    newReview.author = req.user._id; 
    camp.reviews.push(newReview);
    await camp.save();
    await newReview.save();
    req.flash('success','successfully made a review!');
    res.redirect(`/campgrounds/${camp._id}?success=true`);
}