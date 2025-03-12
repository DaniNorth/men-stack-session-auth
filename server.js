const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const morgan = require('morgan');
const session = require('express-session');
const methodOverride = require('method-override');


const authController = require('./controllers/auth.js');
const fruitsController = require('./controllers/fruits.js');  

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

app.use((req, res, next) => {
    if (req.session.message) {
      res.locals.message = req.session.message;
      req.session.message = null;
    }
    next();
  });
  

//routes 

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
  
app.use('/auth', authController);
app.use('/fruits', fruitsController);


app.get("*", function (req, res) {
    res.status(404).render("error.ejs", { msg: "Page not found!" });
  });

  const handleServerError = (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Warning! Port ${port} is already in use!`);
    } else {
      console.log('Error:', err);
    }
  }
  
//tell the app to listen for HTTP Requests
app.listen(port, () => {
    console.log(`The express app is ready on port ${port}!`);
  }).on('error', handleServerError);
