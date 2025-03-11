const dotenv = require( "dotenv" );
dotenv.config();
const express = require( "express" );
const app = express();
const mongoose = require( "mongoose" );
const methodOverride = require( "method-override" );
const morgan = require( "morgan" );
const authController = require('./controllers/auth');
const session = require('express-session');


// const port = process.env.PORT ? process.env.PORT: (this is a terniary function that )
const port = process.env.PORT || "3000";

//connect to mongoDB
mongoose.connect( process.env.MONGODB_URI );
mongoose.connection.on("connected", () => {
    console.log(`Connected to MongoDB ${ mongoose.connection.name }`)
});

//Middleware to parse URL-encoded data from forms
app.use(express.urlencoded({ extended: false }));
//Middleware for using HTTPverbs such as PUT or DELETE
app.use (methodOverride("_method"));

app.use(morgan('dev'));

app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
}));

app.use('/auth', authController);

app.get('/', async (req, res) => {
    res.render('index.ejs', {
        user: req.session.user
    })
});

app.get("/vip-lounge", (req, res) => {
    if (req.session.user) {
      res.send(`Welcome to the party ${req.session.user.username}.`);
    } else {
      res.send("Sorry, no guests allowed.");
    }
  });
  

//tell the app to listen for HTTP Requests
app.listen(port, () => {
    console.log(`The express app is ready on port ${port}`)
});
