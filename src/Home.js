import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { getAllReviewsFromApi } from './actionCreators';
import ReviewsList from './ReviewsList';
import { Outlet } from "react-router-dom";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


function Home() {

    // function SpotifyAccountLogin(){
    
    //     window.location.replace('https://accounts.spotify.com/authorize?response_type=code&client_id=53ca0767b1094ac688996ae59682e82b&redirect_uri=http://localhost:3000/test');
    //     return;
    //   }
    
    let navigate = useNavigate();
    const dispatch = useDispatch();
    let user = useSelector(store => store.user);
   
    useEffect(() => {
      function spotifyAuth(){
        window.location.replace('http://localhost:5000/auth/login');}
        let userRetrieve = localStorage.getItem("currUser");
        if(userRetrieve) {
          dispatch({
            action: "USER-LOGIN",
            payload: userRetrieve
          })

          navigate("reviews");}
        else{spotifyAuth()};

    }, [])

    

  return (
    <div className="App">
    
    </div>
  );
}

export default Home;