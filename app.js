if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const path = require('path');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const MongoStore = require('connect-mongo');
const { campgroundSchema, reviewSchema } = require('./Schemas.js');
const User = require('./models/user');
const userRoutes = require('./routes/users');
const reviewRoutes = require('./routes/reviews');
const campgroundRoutes = require('./routes/campgrounds');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/errorClass');

const app = express();

// Database Connection
const dbUrl ='mongodb://127.0.0.1:27017/yelp-camp';

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 30000, // 30 seconds
    socketTimeoutMS: 45000 // 45 seconds
}).then(() => {
    console.log('Database connected');
}).catch(err => {
    console.error('Connection error:', err);
});

// Middleware
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
app.use(helmet({ contentSecurityPolicy: false }));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SESSION_SECRET || 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (e) {
    console.log("Session store error:", e);
});

const sessionConfig = {
    store,
    name: "session",
    secret: process.env.SESSION_SECRET || "thisisasecretboi",
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    res.locals.currentUser = req.user;
    next();
});

// Routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.get('/fakeuser', async (req, res) => {
    try {
        const user = new User({ email: 'nutius90@gmail.com', username: 'adarsh' });
        const newUser = await User.register(user, 'chicken');
        res.send(newUser);
    } catch (e) {
        res.status(500).send(e.message);
    }
});

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (req, res, next) => {
    next(new ExpressError('Page not found', 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = 'We got an error!!' } = err;
    res.status(statusCode).render('error', { err });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
