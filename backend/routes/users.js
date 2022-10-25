const db = require("../db");
const express = require("express");
const router = new express.Router();

const cookieParser = require("cookie-parser")
router.use(cookieParser());
const axios = require('axios');
const CLIENT_ID = '53ca0767b1094ac688996ae59682e82b';
const CLIENT_SECRET = '6946e45af0da4d03bf26de3faf426ac6';
const jwt = require("jsonwebtoken");

// ** GET / get overview of all users

router.get("/", async function (req, res, next){

    try{
        const result = await db.query(`
        SELECT * FROM users
        ORDER BY stars desc`);
        return res.json(result.rows);
    } catch(err){
        return next(err);
    }
})

// ** GET / get detail on a single user.

router.get("/:username", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp && req.params.username !== req.body.userVoting){
        const result = await db.query(`
        SELECT users.username, users.bio, users.stars, users.avatar,
        reviews.id, reviews.artist_id, reviews.album_artist, reviews.album_id,
        reviews.album_name, reviews.album_art, reviews.title, reviews.description,
        reviews.body, reviews.review_date, reviews.rating
        FROM users JOIN reviews
        ON users.username = reviews.review_username
        WHERE users.username = $1`, [req.params.username]);

        // if no reviews
        if(result.rows.length ===0){
            let noReviewsResult = await db.query(`SELECT 
            username, bio, stars, avatar FROM users WHERE username = $1`, [req.params.username]);
            return res.json(noReviewsResult.rows);

        }
       
        return res.json(result.rows);
    }
    } catch(err){
        return next(err);
    }
});

// ** GET / get a record of all votes a user has made..

router.get("/:username/votes", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp && req.params.username !== req.body.userVoting){
       
        let getStars = await db.query(`SELECT * from star_votes
        WHERE username_doing_rating = $1`,[reviewifyTokenResp.username])
        let responseObj = {};
        getStars.rows.forEach(r => responseObj[r.username_being_rated] = r.rating )
        
        return res.json(responseObj);}
    } catch(err){
        return next(err);
    }
});

// Add a star to a user (as in an up-vote, or sign of kudos displayed on their profile.)
router.post("/:username/add-star", async function (req, res, next){

    try{
        console.log(req.body)
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp && req.params.username !== req.body.userVoting){
        
        
        const checkForPriorVote = await db.query(`SELECT * FROM
        star_votes WHERE username_being_rated = $1 AND username_doing_rating
        = $2`, [req.params.username, req.body.userVoting]);

        if(!checkForPriorVote.rows.length){
        const addRecord = await db.query(`
        INSERT INTO star_votes (username_being_rated, username_doing_rating, rating)
        VALUES ($1, $2, $3)`, [req.params.username, req.body.userVoting, 1])
        }
        else{
        const deletePriorVote = await db.query(`
        DELETE from star_votes where username_being_rated = $1 AND
        username_doing_rating = $2`, [req.params.username, req.body.userVoting])

        }

        const result = await db.query(`
        UPDATE users set stars = stars+1
        WHERE username = $1 RETURNING bio,
        stars, avatar, username`
        , [req.params.username]);
        return res.json(result.rows);
    } }catch(err){
        return next(err);
    }
});

// Remove a star to a user (as in an up-vote, or sign of kudos displayed on their profile.)
router.post("/:username/remove-star", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp && req.params.username !== req.body.userVoting){
        
        const checkForPriorVote = await db.query(`SELECT * FROM
        star_votes WHERE username_being_rated = $1 AND username_doing_rating
        = $2`, [req.params.username, req.body.userVoting]);

        if(!checkForPriorVote.rows.length){
            const addRecord = await db.query(`
            INSERT INTO star_votes (username_being_rated, username_doing_rating, rating)
            VALUES ($1, $2, $3)`, [req.params.username, req.body.userVoting, -1]);
        }
        else{
        const deletePriorVote = await db.query(`
        DELETE from star_votes where username_being_rated = $1 AND
        username_doing_rating = $2`, [req.params.username, req.body.userVoting])
        }
        const result = await db.query(`
        UPDATE users set stars = stars-1
        WHERE username = $1 RETURNING bio,
        stars, avatar, username`
        , [req.params.username]);
        return res.json(result.rows);}
    } catch(err){
        return next(err);
    }
});

router.patch("/:username/bio", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp && req.params.username !== reviewifyTokenResp.username) return res.json({unauthorized: 'You cannot update this user.'})
        console.log(req.body.newBio)
        const result = await db.query(`
        UPDATE users set bio = $1
        WHERE username = $2 RETURNING bio,
        stars, avatar, username`
        , [req.body.newBio, req.params.username]);
        return res.json(result.rows);}
    catch(err){
        return next(err);
    }
});

router.patch("/:username/avatar", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp && req.params.username !== reviewifyTokenResp.username) return res.json({unauthorized: 'You cannot update this user.'})
        console.log(req.body.newAvatar)
        const result = await db.query(`
        UPDATE users set avatar = $1
        WHERE username = $2 RETURNING bio,
        stars, avatar, username`
        , [req.body.newAvatar, req.params.username]);
        return res.json(result.rows);}
    catch(err){
        return next(err);
    }
});

module.exports = router;