import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { getArtistReviewsFromApi } from './actionCreators';
import ReviewsList from './ReviewsList';
import { Outlet, Link, useParams } from "react-router-dom";
import ReviewPreviewCard from './ReviewPreviewCard';


function ArtistReviews() {
    const dispatch = useDispatch();
    let { artist } = useParams();
    let artistReviews = useSelector(store => store.artistReviews);
    let currUser = useSelector(store => store.currUser);


    useEffect(() =>{
  
    dispatch(getArtistReviewsFromApi(artist.toLowerCase()));

    }, [dispatch] )

    console.log(artistReviews);

  if(artistReviews.unauthorized){
    return(
      <div>
        <h1>Reviews</h1>
        <h2>You must be logged in to see reviews.</h2>
      </div>
    )
  }
  return (
    <div className="new-reviews-full-container">
      <h1>Reviews</h1>
      <div className='new-reviews-full-flex'>
      {artistReviews && artistReviews.map((r) => 
        <ReviewPreviewCard title={r.title} album_art={r.album_art} description={r.description}
        album_artist ={r.album_artist} id={r.id} review_username={r.review_username}
        body={r.body} review_date={r.review_date} rating={r.rating}
        album_name={r.album_name}/> )}
      </div>
    
      
    </div>
  );
}

export default ArtistReviews;