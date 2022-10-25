const db = require("../db");
const express = require("express");
const router = new express.Router();
const cookieParser = require("cookie-parser")
router.use(cookieParser());
const axios = require('axios');
const CLIENT_ID = '53ca0767b1094ac688996ae59682e82b';
const CLIENT_SECRET = '6946e45af0da4d03bf26de3faf426ac6';
const jwt = require("jsonwebtoken");
const { refreshTokenHelper, getSpotifyApiResult } = require('./helpers')
// let REDIRECT_URI = 'http://localhost:3000/test';
let REDIRECT_URI = 'http://localhost:5000/auth/callback';
const crypto = require("crypto");
const algorithm = "aes-256-cbc"; 
const initVector = crypto.randomBytes(16);
const securityKey = crypto.randomBytes(32);


const Url = require('url');
const userCache = {};



// ** GET / get overview of user associated with session ID


router.get("/whoami", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({noUser: 'User not detected'});
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp) return res.json({isUser: reviewifyTokenResp.username});

        
    } catch(err){
        return next(err);
    }
})

// Clear the session ID from the client

router.post("/logout", async function (req, res, next){

    try{
       
        res.clearCookie('sessionId');
        res.end();
        }

        catch(err){
        return next(err);
    }
})

// Initial login route redirecting to Spotify authorization.

router.get("/login", async function (req, res, next){

    try{
        res.redirect(`https://accounts.spotify.com/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`)
        }
     catch(err){
        return next(err);
    }
})


// Route that takes query string from 'login' route and produces access token and refresh token.

router.get("/callback", async function (req, res, next){

    try{
    let buffer = new Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`);
    let base64 = buffer.toString('base64');
    let code = req.query.code;
    let params = new Url.URLSearchParams({grant_type: "authorization_code", code: `${code}`, redirect_uri: `${REDIRECT_URI}`})
    let result = await axios.post('https://accounts.spotify.com/api/token', params.toString(), {
        headers: {
         'Authorization': 'Basic ' + base64,
         'Content-Type': 'application/x-www-form-urlencoded' 
        }
    });
    let userReq = await axios.get('https://api.spotify.com/v1/me', {headers: {'Authorization': 'Bearer '+ result.data.access_token }});
    let userDetails = userReq.data;
    let reviewifyTokenPayload = {username: userDetails.display_name};
    let reviewifyToken = jwt.sign(reviewifyTokenPayload, CLIENT_SECRET);
    res.cookie("sessionId", reviewifyToken, {
        expire: 1/24,
        path: '/',  
        httpOnly: true
    });
    let userSearch = await db.query(`
        SELECT * FROM users WHERE
        username = $1`, [userDetails.display_name]);
    if(!userSearch.rows.length){
        let addUserDbQuery = await db.query(`INSERT INTO users (username,
            spotify_access_token, spotify_refresh_token, reviewify_session_id) values($1, $2, $3, $4)`, 
            [userDetails.display_name, result.data.access_token, result.data_refresh_token, reviewifyToken]);
        }
    else if(userSearch.rows.length){
        let updateUserDbQuery = await db.query(`UPDATE users
        SET spotify_access_token = $1, spotify_refresh_token = $2, reviewify_session_id = $3
        WHERE username = $4 `, 
        [result.data.access_token, result.data.refresh_token, reviewifyToken, userDetails.display_name]);
        }
    
   

 res.redirect('http://localhost:3000')
    
    }catch(err){
        console.log(err);
        return next(err);
    }
})



router.get("/search/:searchTerm", async function (req, res, next){

        if(!req.cookies.sessionId) {
            return res.json({message: 'no token found'})
            }
        else if(req.cookies.sessionId){
        let tokenQuery = await db.query(`SELECT
        spotify_access_token FROM users WHERE reviewify_session_id = $1`, [req.cookies.sessionId]);
        let retrievedToken = tokenQuery.rows[0].spotify_access_token;
        let searchTerm = req.params.searchTerm;
      
        let result = await getSpotifyApiResult(`search?type=album&q=${searchTerm}`, retrievedToken);
        
        if(result === 401){
            console.log('ATTEMPTING REFRESH TOKEN - INSIDE 401')
            let newTokenCall = await refreshTokenHelper(req.cookies.sessionId);
            if(!newTokenCall) return res.json({message:'No refresh token available.'})
            console.log('REFRESH TOKEN FOUND', newTokenCall)
            let newResult = await getSpotifyApiResult(`search?type=album&q=${searchTerm}`, newTokenCall.token.spotify_access_token)
       
            return res.json(newResult.albums.items);
        } 
        return res.json(result.albums.items);
        }
       
})





module.exports = {
    router: router}