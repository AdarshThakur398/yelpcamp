const ExpressError = require('./utils/errorClass');
const { campgroundSchema, reviewSchema } = require('./Schemas.js');

const Campground = require('./models/campground');
module.exports.isLoggedIn = (req,res,next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo=req.originalUrl;
        req.flash('error','you must sign in!!')
        return res.redirect('/login')
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        return res.status(400).send(msg); 
    }
    next();
};
module.exports.isAuthor = async (req,res,next) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);
    if (!camp.author.equals(req.user._id)) {
           
        req.flash('error','You do not have permission to do that!')
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        return res.status(400).send(msg); 
    }
    next();
};
