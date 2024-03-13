const mongoose= require('mongoose');
const Schema = mongoose.Schema;

const campgroundSchema = new Schema({
    title: String,
    price: Number,
    image:String,
    description:String,
    location:String,
    author: {
        type:Schema.Types.ObjectId,
        ref:"User"
    },
    reviews: [{
        type: Schema.Types.ObjectId,
        ref:'Review'
    }]
});

module.exports = mongoose.model('Campground', campgroundSchema);