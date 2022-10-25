// ** API routes for posts. */

const db = require("../db");
const express = require("express");
const router = new express.Router();
const { refreshTokenHelper, getSpotifyApiResult, GetArtistInfoHelper } = require('./helpers')
const CLIENT_SECRET = '6946e45af0da4d03bf26de3faf426ac6';
const jwt = require("jsonwebtoken");
const axios = require('axios');




// ** GET / get overview of all reviews

router.get("/", async function (req, res, next){

    try{
       
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        console.log(reviewifyTokenResp);
        if(reviewifyTokenResp){const result = await db.query(`
        SELECT id, review_username, album_id, album_name,title, description, rating FROM reviews`);
        return res.json(result.rows);}
  
    } catch(err){
        return next(err);
    }
})

// ** GET / get latest 20 reviews

router.get("/latest", async function (req, res, next){

    try{
       
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        console.log(reviewifyTokenResp);
        if(reviewifyTokenResp){const result = await db.query(`
        SELECT * FROM reviews ORDER BY review_date DESC limit 20`);
        return res.json(result.rows);}
    } catch(err){
        return next(err);
    }
})

// ** GET / get one sample popular reviews, sample new reviews, featured artists,
// and featured reviewers as data for homepage banners.

router.get("/sample", async function (req, res, next){

    try{
       
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        console.log(reviewifyTokenResp);
        if(reviewifyTokenResp){
        const artistQuery = await db.query(`SELECT COUNT(reviews.album_artist), reviews.album_artist, 
        artists.image FROM reviews JOIN artists ON reviews.artist_id = artists.artist_id 
        GROUP BY reviews.album_artist, 
        artists.image ORDER BY count desc LIMIT 10;`)
        console.log(artistQuery.rows)
        const latestReview = await db.query(`
        SELECT * FROM reviews ORDER BY review_date DESC limit 5`);
        const popularReview = await db.query(`SELECT COUNT(review_comments.comment_id), reviews.id, reviews.title, 
        reviews.review_username, reviews.body, reviews.album_artist, reviews.album_id, reviews.album_name, reviews.album_art, 
        reviews.description, reviews.rating from review_comments join reviews ON 
        review_comments.review_id = reviews.id GROUP BY reviews.id
        ORDER BY COUNT desc LIMIT 5;
        `);
        const featuredReviewers = await db.query(`SELECT * FROM users WHERE stars >0 ORDER BY stars desc LIMIT 5`)
        
        return res.json({latest: latestReview.rows, popular: popularReview.rows, 
            artist: artistQuery.rows, featuredReviewers: featuredReviewers.rows});
    }
    } catch(err){
        return next(err);
    }
})

// ** GET / get the top 20 engaged reviews (most comments)

router.get("/popular", async function (req, res, next){

    try{
       
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        console.log(reviewifyTokenResp);
        if(reviewifyTokenResp){
            const result = await db.query(
        `SELECT COUNT(review_comments.comment_id), reviews.id
from review_comments join reviews ON review_comments.review_id = reviews.id GROUP BY reviews.id
ORDER BY COUNT asc LIMIT 10`);
        let paramStr = '';
        let i = 0;
        while(i < result.rows.length){
            if(i=== result.rows.length-1)paramStr= paramStr+`id=$${i+1}`
            else{paramStr= paramStr+`id=$${i+1} or `}
            i++; }
        let params = result.rows.map(r => +r.id);
        const popularReviews = await db.query(
            `SELECT * from reviews WHERE
            ${paramStr}`, params
        )
        return res.json(popularReviews.rows);
    }
    } catch(err){
        return next(err);
    }
})



// ** POST / Add comment on a review.

router.post("/comments/:reviewId", async function (req, res, next){

    try{
       
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        console.log(reviewifyTokenResp);
        if(reviewifyTokenResp){
            const result = await db.query(`
        INSERT INTO review_comments (review_id, comment_username, comment)
        VALUES($1, $2, $3) RETURNING
         *`, [req.params.reviewId, reviewifyTokenResp.username, req.body.comment]);
        return res.json(result.rows);
    }
  
    } catch(err){
        return next(err);
    }
})

// ** POST / Delete comment on a review.

router.post("/comments/comment/:commentId", async function (req, res, next){

    try{
       
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp){
            const result = await db.query(`
        DELETE FROM review_comments
        WHERE comment_id = $1`, [req.params.commentId]);
        return res.json(result.rows);
    }
  
    } catch(err){
        return next(err);
    }
})




// ** GET / get all artists for which there are reviews.

router.get("/artists", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp){
        const result = await db.query(`
        SELECT * from artists;`);
       
        return res.json(result.rows)};
    } catch(err){
        return next(err);
    }
});

// ** GET / get all artists beginning with a selected letter.

router.get("/artists/lookup/:letter", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp){
        const result = await db.query(`
        SELECT * from artists
        WHERE LOWER(name) LIKE $1`, [`${letter}%`]);
       
        return res.json(result.rows)};
    } catch(err){
        return next(err);
    }
});

// ** GET / get reviews on a single artist.

router.get("/artists/:artist", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp){
        const result = await db.query(`
        SELECT * FROM reviews
        WHERE lower(album_artist) = $1`, [req.params.artist]);
        console.log(result)
        return res.json(result.rows)};
    } catch(err){
        return next(err);
    }
});

// ** GET / get detail on a single review.

router.get("/:id", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp){
        const result = await db.query(`
        SELECT * FROM reviews
        WHERE id = $1`, [req.params.id]);
        const commentQuery = await db.query(`
        SELECT * FROM review_comments WHERE
        review_id = $1`, [req.params.id]);

        return res.json({review: result.rows[0], comments: commentQuery.rows})};
    } catch(err){
        return next(err);
    }
});

// ** GET / Get a list of reviews by search term.

router.get("/search/:searchTerm", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp){
        let searchTerm = req.params.searchTerm;
        let searchQuery = await db.query(`SELECT * FROM
        reviews WHERE LOWER(album_name) 
        LIKE $1 OR LOWER(title) LIKE $1`,[`%${searchTerm}%`]);

        return res.json(searchQuery.rows)};
    } catch(err){
        return next(err);
    }
});

// ** POST / Add a review to the database.

router.post("/", async function (req, res, next){

    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'Please login to see reviews.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        if(reviewifyTokenResp){
        const {title, description, body, rating, album_id, artist_id, album_art, album_name, album_artist} = req.body;
        let username = reviewifyTokenResp.username;
        const artistsSearchQuery = await db.query(`SELECT * FROM artists WHERE artist_id = $1`,[artist_id])
        if(!artistsSearchQuery.rows.length){

        let artistDetails = await GetArtistInfoHelper(artist_id, req.cookies.sessionId);
        console.log(artistDetails)


        let artistsInsertQuery = await db.query(`INSERT INTO artists (artist_id,
            name, image, genre) VALUES($1,$2,$3,$4)`,[artistDetails.id,
            artistDetails.name,artistDetails.images[1].url,artistDetails.genres[0]])
        }

        const result = await db.query(`
        INSERT INTO reviews (review_username, album_id, title, description, body, rating, album_name, album_art, album_artist, artist_id)
        VALUES ($1, $2, $3,$4,$5,$6,$7,$8, $9,$10) RETURNING id`, [username, album_id, title, description, body, rating, 
            album_name, album_art, album_artist, artist_id]);
        return res.json(result.rows)};
    } catch(err){
        return next(err);
    }
});

// ** DELETE / Delete a review from the database.

router.delete("/:reviewId", async function (req, res, next){


    try{
        if(!req.cookies.sessionId) return res.json({unauthorized: 'You must be logged in to delete.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        console.log(reviewifyTokenResp);
        let userCheck = await db.query(`SELECT review_username FROM reviews
        WHERE review_username = $1 AND id = $2`,[reviewifyTokenResp.username, req.params.reviewId]);
        if(!userCheck.rows.length) return res.json({unauthorized:`You do not have permission to delete this review.`})
        else{
            const result = await db.query(`
        DELETE FROM reviews
        WHERE id = $1`, [req.params.reviewId]);
        return res.json(result.rows);
    }
    } catch(err){
        return next(err);
    }
});

router.put("/:reviewId", async function (req, res, next){


    try{
        console.log(req.body)
        if(!req.cookies.sessionId) return res.json({unauthorized: 'You must be logged in to edit.'})
        let reviewifyTokenResp = jwt.verify(req.cookies.sessionId, CLIENT_SECRET);
        console.log(reviewifyTokenResp);
        let userCheck = await db.query(`SELECT review_username FROM reviews
        WHERE review_username = $1 AND id = $2`,[reviewifyTokenResp.username, req.params.reviewId]);
        if(!userCheck.rows.length) return res.json({unauthorized:`You do not have permission to edit this review.`})
        else{
            let {title, description, body, rating} = req.body;
            const result = await db.query(`
        UPDATE reviews SET title = $2, description = $3, body = $4, rating = $5
        WHERE id = $1 RETURNING *`, [req.params.reviewId, title, description, body, rating]);
        return res.json(result.rows);
    }
    } catch(err){
        return next(err);
    }
});

module.exports = router;