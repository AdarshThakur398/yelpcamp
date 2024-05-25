if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}


const MongoStore = require('connect-mongo');
const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash=require('connect-flash');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const joi = require('joi');
const { campgroundSchema, reviewSchema } = require('./Schemas.js');
const passport=require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const userRoutes = require('./routes/users')
const helmet=require('helmet')
const dbUrl = process.env.DB_URL
if (!campgroundSchema || !reviewSchema) {
    console.error("Schema objects are not properly initialized or imported.");
 
} else {
   
}
const mongoSanitize = require('express-mongo-sanitize');

const ReviewRoutes = require('./routes/reviews');
const CampgroundRoutes= require('./routes/campgrounds');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/errorClass');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static('public'));
app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy:false}));



const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});
store.on("error", function(e) {
    console.log("session store error!")
})
const sessionConfig = {
    store,
    name:"session",
    secret:"thisisasecretboi",
    resave:false,
    saveUninitialized:true,
    cookie: {
    httpOnly:true,
    expires: Date.now() + 1000*60*60*24*7,
    maxAge:1000*60*60*24*7
    }
}
app.use(session(sessionConfig))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(flash())
app.use((req,res,next) => {

    res.locals.success=req.flash('success');
    res.locals.error=req.flash('error');
    res.locals.currentUser = req.user;
    next();
})

mongoose.connect(dbUrl);
//'mongodb://127.0.0.1:27017/yelp-camp'
const db = mongoose.connection;



db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log('database connected');
});
app.use("/", userRoutes)
app.use("/campgrounds",CampgroundRoutes)
app.use("/campgrounds/:id/reviews/",ReviewRoutes)

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.get('/fakeuser', async (req,res) => {
    const user = new User({email:'nutius90@gmail.com',username:'adarsh'})
    const newUser= await User.register(user,'chicken');
    res.send(newUser)
})
app.get('/', (req, res) => {
    res.render('home');
});



app.all('*', (req, res, next) => {
    next(new ExpressError('page not found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'we got an error!!' } = err;
    res.status(statusCode).render('error', { err });
});

app.listen(8080, () => {
    console.log('Server is running on port 8080');
});