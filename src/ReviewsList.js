import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { getAlbumFromApi } from './actionCreators';
import { Link } from "react-router-dom";



function ReviewsList({reviews}) {
 


  return (
    <div className="App">
     <h1>Test Album Page</h1>
     {reviews && reviews.map((r)=> <Link to={`/reviews/${r.id}`}>{r.title}</Link>)}
     
      
    </div>
  );
}

export default ReviewsList;