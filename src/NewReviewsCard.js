import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { getAllReviewsFromApi } from './actionCreators';
import ReviewsList from './ReviewsList';
import { Outlet, Link } from "react-router-dom";
import axios from 'axios';

function NewReviewsCard({newReviewSample}) {
    
    console.log('new')

  return (
    <div className='trans-box-artist-feature'>
    <div className="carousel-headings">
      <h2>Latest Reviews</h2>
      <h3>Fresh Takes Always Being Added</h3>
      
      <Link className='carousel-link' to ="/new">Check More New Reviews</Link>
      </div>
    </div>
  );
}

export default NewReviewsCard;

