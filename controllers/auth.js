const express = require('express');
const router = express.Router();
const User = require('../models/user.js');
const bcrypt = require("bcrypt");




router.post('/sign-up', async (req,res)=> {
    // check if the user exsits - NO DUPLICATE USERNAMES
    const userInDatabase = await User.findOne({ username: req.body.username })
    if (userInDatabase) {
        return res.send("Username already taken.");
    }
    // check if the password and confirm password are a match.
    if (req.body.password !== req.body.confirmPassword) {
        return res.send("password and confirmed password do not match");
    }
    
    const hashedPassword = bcrypt.hashSync(req.body.password, 10);
    req.body.password = hashedPassword;
    
    const user = await User.create(req.body);
    res.send(`Thanks for signing up ${user.username}`);
});

router.get('/sign-in', (req, res) => {
    res.render('auth/sign-in.ejs');
});

router.post('/sign-in', async (req, res) => {
    const userInDatabase = await User.findOne({
        username: req.body.username
    });

    if(!userInDatabase) {
        return res.send('Login Failed. Please try again!');
    }

    const validPassword = bcrypt.compareSync(
        req.body.password,
        userInDatabase.password
    );

    if(!validPassword) {
        return res.send('login Falied. Please try again!')
    }
    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id
    };

    res.redirect('/');
});

router.get("/sign-out", (req, res) => {
    req.session.destroy();
    res.redirect("/");
  });
  

module.exports = router;
