const mongoose = require('mongoose');
const { descriptors, places } = require('./seedhelper');
const Campground = require('../models/campground');

const cities = require('./cities');

mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('database connected');
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const seedDB = async () => {
    await Campground.deleteMany({});

    for (let i = 0; i < 50; i++) {
        const price = Math.floor(Math.random() *30) +10;
        const random1000 = Math.floor(Math.random() * 1000);
        const newCampground = new Campground({
            author: '65ed7eeb0e1f2211f57faa2e',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
           
            description:'  Lorem ipsum dolor sit amet consectetur, adipisicing elit. Architecto debitis neque id laudantium delectus laboriosam? Alias dignissimos provident cumque atque dolorum laboriosam quis aspernatur ea. Delectus similique sit voluptates vel.',
            price:price,
            geometry:  {
                type:"Point",
                coordinates:[-113.1331,47.0202]
            },
            images:  [
                {
                  url: 'https://res.cloudinary.com/dewbwfba5/image/upload/v1715834646/YelpCamp/e5s6vs236ytrrs1dztxc.png',
                  filename: 'YelpCamp/e5s6vs236ytrrs1dztxc',
                
                }
              ]
        });

        console.log('Loop iteration:', i);
        console.log('Generated campground:', newCampground);

        await newCampground.save();
    }
};

seedDB().then(() => {
    mongoose.connection.close();
});
