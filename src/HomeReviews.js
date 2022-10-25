import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { getAllReviewsFromApi } from './actionCreators';
import ReviewsList from './ReviewsList';
import { Outlet, Link } from "react-router-dom";


function HomeReviews() {
    const dispatch = useDispatch();
  
    let reviews = useSelector(store => store.reviewList);
    let currUser = useSelector(store => store.currUser);


    useEffect(() =>{
  
    dispatch(getAllReviewsFromApi());

    }, [dispatch] )

    console.log(currUser);

  if(reviews.unauthorized){
    return(
      <div>
        <h1>Reviews</h1>
        <h2>You must be logged in to see reviews.</h2>
      </div>
    )

  }

  return (
    <div className="App">
      <h1>Reviews</h1>
      {reviews && reviews.map((r)=> 
        <Link to={`/reviews/${r.id}`}>{r.album_name} - {r.title}</Link>)}
      {/* {reviews && <ReviewsList reviews = {reviews}></ReviewsList>} */}
    
      
    </div>
  );
}

export default HomeReviews;