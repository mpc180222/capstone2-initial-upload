import logo from './logo.svg';
import './App.css';
import './Form.css'
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useLocation } from "react-router-dom";
import { getSearchResultFromApi } from './actionCreators';
import axios from "axios";
import StarRange from "./StarRange";


function AddReviewForm({handleReviewChange, handleReviewSubmit, reviewFormData, handleStarsChange}) {

  return (
    <div className='add-review-form-container'>
     <h2>Reviewing {reviewFormData.album_name} by {reviewFormData.album_artist}</h2>
     <form onSubmit = {handleReviewSubmit}>
      <input type="text" placeholder="Review Title" name="title" value={reviewFormData.title} onChange={handleReviewChange}></input>
      <input type="text" placeholder="Review Description" name="description" value={reviewFormData.description} onChange={handleReviewChange}></input>
      <textarea placeholder="Review Body" name="body" value={reviewFormData.body} onChange={handleReviewChange}></textarea><br></br>
      <label>
      Rating:
      <StarRange handleStarsChange={handleStarsChange}></StarRange>
      {/* <input placeholder="Rating" type="range" min="1" max="5" step="1" name="rating" value={reviewFormData.rating} onChange={handleReviewChange}></input><br></br> */}
      </label><br></br>
      <button className='add-review-form-button'>Submit Review</button>
     </form>
     
    </div>
  );
}

export default AddReviewForm;