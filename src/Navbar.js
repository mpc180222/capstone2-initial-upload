import './navbar.css';
import spotify_logo from './spotify_logo.png'
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { getAllReviewsFromApi } from './actionCreators';
import ReviewsList from './ReviewsList';
import { Outlet } from "react-router-dom";
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';



function Navbar() {
  let navigate = useNavigate();
  let dispatch = useDispatch();
  let currUser = useSelector(store => store.currUser);
  

    async function doLogout(){

      let result = await axios.post('/auth/logout');
      dispatch({
        type: "LOGOUT-CURR-USER"
      })
      navigate("/");
    }
   
    

  return (
    <div className="nav-container">
    <div className='logo-div'>
    <img className='spotify-logo' src={spotify_logo}></img>
    </div>
    <div className='nav-flex'>
    <Link className='link' to ="/">Home</Link>
    <Link className='link' to ="/search">Add A Review</Link>
    <Link className='link' to ="/reviews/artists">All Reviews</Link>
    {/* <Link className='link' to ="/reviews">Reviews</Link> */}
    <Link className='link' to ="/review-search">Reviews Search</Link>
    {currUser.isUser && <Link className='link' to={`/users/${currUser.isUser}`}>My Profile</Link>}
    {currUser.isUser && <button className='link-btn' onClick={doLogout}>Logout</button>}
    </div>
    </div>
  );
}

export default Navbar;