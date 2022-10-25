import logo from './logo.svg';
import './App.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { checkUser } from './actionCreators';
import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import Test from "./Test.js";
import ReviewSearchAndSelect from "./ReviewSearchAndSelect";
import HomeReviews from "./HomeReviews";
import Review from "./Review";
import Home from "./Home";
import Navbar from "./Navbar";
import Prompt from "./Prompt";
import ArtistReviews from './ArtistReviews';
import ArtistIndex from './ArtistIndex';
import NewReviewsFull from './NewReviewsFull';
import PopularReviewsFull from './PopularReviewsFull';
import PlaybackTest from './PlaybackTest';
import ExistingReviewSearch from './ExistingReviewSearch';
import UserProfile from './UserProfile';



function App() {
  let dispatch = useDispatch();
  let currUser = useSelector(store => store.currUser);

  useEffect(() => {

    if(currUser.noUser) dispatch(checkUser());

  }, [dispatch])


  return (
    <div className="App">
      <BrowserRouter>
      <Navbar></Navbar>
      <Routes>
      <Route path="/" element={<Prompt />}></Route>
      <Route path ="/redirect" element={<Home/>} />
      <Route path ="/test" element={<Test/>}>
      </Route>
      <Route path ="/search" element={<ReviewSearchAndSelect/>}>
      </Route>
      <Route path="/reviews" element={<HomeReviews/>} />
      <Route path="/reviews/:reviewId" element={<Review/>} />
      <Route path="/reviews/artists/:artist" element={<ArtistReviews/>} />
      <Route path="/reviews/artists" element={<ArtistIndex/>} />
      <Route path ="/new" element={<NewReviewsFull/>}/>
      <Route path ="/popular" element={<PopularReviewsFull/>}></Route>
      <Route path ="/playback" element={<PlaybackTest/>}></Route>
      <Route path="/review-search" element={<ExistingReviewSearch/>}></Route>
      <Route path="/users/:userHandle" element={<UserProfile/>}></Route>
      </Routes>
      </BrowserRouter>
      
    </div>
  );
}

export default App;
