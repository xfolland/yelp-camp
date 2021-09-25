const ExpressError = require("./utils/ExpressError");
const LocalStrategy = require("passport-local");
const User = require("./models/User");
const campgroundsRoutes = require("./routes/campgrounds");
const ejsMate = require("ejs-mate");
const express = require("express");
const flash = require("connect-flash");
const helmet = require("helmet");
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const mongoSanitize = require("express-mongo-sanitize");
const MongoStore = require("connect-mongo");
const morgan = require("morgan");
const passport = require("passport");
const path = require("path");
const reviewsRoutes = require("./routes/reviews");
const session = require("express-session");
const usersRoutes = require("./routes/users");
if (process.env.NODE_ENV !== "production") require("dotenv").config();

// express-session setup
sessionCookie = {
    httpOnly: true,
    // secure: true,
    maxAge: (1000 * 60 * 60 * 24 * 7 * 4),
};
sessionConfig = {
    name: "exsesscookie",
    cookie: sessionCookie,
    resave: false,
    saveUninitialized: true,
    secret: process.env.SESSION_SECRET,
    session: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
        touchAfter: 24 * 3600,
        ttl: (60 * 60 * 24 * 7 * 4),
        secret: process.env.SESSION_SECRET
    })
};

// express setup
const app = express();
const port = process.env.PORT;
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(flash());
app.use(methodOverride("_method"));
app.use(mongoSanitize({ replaceWith: "-" }));
if (process.env.NODE_ENV !== "production") app.use(morgan("tiny"));
app.use(session(sessionConfig));

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dlri0ladq/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// mongoose setup
// const dbName = "yelp-camp";
const dbOptions = {
    useCreateIndex: true,
    useFindAndModify: false,
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

// routes
app.use((req, res, next) => {
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.user = req.user;
    return next();
});
app.get("/", (req, res) => {
    res.redirect("/campgrounds");
	// res.render("home");
});
app.use("/campgrounds", campgroundsRoutes);
app.use("/campgrounds/:cid/reviews", reviewsRoutes);
app.use("/", usersRoutes);
app.all("*", (req, res, next) => {
    return next(new ExpressError("Page not found", 404));
})
app.use((err, req, res, next) => {
    const { message = "Something went wrong", status = 500, stack = null } = err;
    res.status(status).render("error", { message, status, stack });
});

// connect to mongo
mongoose.connect(process.env.MONGODB_URL, dbOptions);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
    console.log(`Connected to database`)
});

// start express
app.listen(port, () => {
    console.log("Server started on port " + port);
});
