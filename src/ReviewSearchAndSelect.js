import './App.css';
import './Form.css';
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { checkUser } from './actionCreators';
import axios from "axios";
import AddReviewForm from './AddReviewForm';
import SearchResultCard from './SearchResultCard';


function ReviewSearchAndSelect() {
  let dispatch = useDispatch();
  let reviews = useSelector(store => store.reviewList);
  let currUser = useSelector(store => store.currUser);

  // useEffect(() => {

  //   if(currUser.noUser) dispatch(checkUser());

  // }, [dispatch])
 
  
    let navigate= useNavigate();
    let user = useSelector(store => store.user);
    let INIT_STATE={title:'', description: '', body: '', rating:1, album_id:'', album_name:'', 
    album_art:'', artist_id:''};
   const [searchFormData, setSearchFormData] = useState({search: ''});
   const [searchResults, setSearchResults] = useState([]);
   const [reviewBeingWritten, setReviewBeingWritten] = useState(false);
   const [reviewFormData, setReviewFormData] = useState(INIT_STATE);

   async function doLogout(){
    let result = await axios.post('/auth/logout');
    dispatch({
      type: "LOGOUT-CURR-USER"
    })
    navigate("/");
  }

   const handleChange = evt => {
    const { name, value } = evt.target;
    setSearchFormData(fData => ({
        ...fData,
        [name]: value
    }))
}

const handleReviewChange = evt => {
  const { name, value } = evt.target;
  setReviewFormData(fData => ({
      ...fData,
      [name]: value
  }))
}

function handleStarsChange(numStars){

  setReviewFormData(fData => ({
    ...fData,
    rating: numStars
  }))
  
}

 

    async function handleSearchSubmit(evt){
      evt.preventDefault();
      
      let data = await axios.get(`/auth/search/${searchFormData.search}`)
      
      if(data.data.message) {
        await doLogout();
        window.location.replace('http://localhost:5000/auth/login')
      }
      else{
      setSearchFormData({search: ''});
      setSearchResults(data.data);}
      
    }

    async function handleReviewSubmit(evt){
      evt.preventDefault();
      let {title, artist_id, description, body, rating, 
        album_id, album_name, album_art, album_artist} = reviewFormData;
      
      let newReviewResp = await axios.post(`/reviews`, {title, description, body, rating, album_id, 
      artist_id, album_name, album_art, album_artist});
      if(newReviewResp.data.message) {
        await doLogout();
        window.location.replace('http://localhost:5000/auth/login')
      }
      let newId = newReviewResp.data[0].id
      navigate(`/reviews/${newId}`);

    }

    function selectAlbumNameForReview(data){
    
      let {name, art, albumId, artist, artistId} = data;
     
      setReviewFormData(fData => ({
        ...fData,
        album_name: name,
        album_art: art,
        album_id: albumId,
        artist_id: artistId,
        album_artist: artist
    }));
    setReviewBeingWritten(true);
    }

    
  
  if(currUser && currUser.noUser){
    return(
      <div>
        <h1>Please login</h1>
      </div>

    )


  }

  return (
    <div className="review-search-and-select-container">
     <h1>Find an Album and Let The World Know Your Thoughts! </h1>
     {reviewBeingWritten &&
    <AddReviewForm handleStarsChange={handleStarsChange} handleReviewSubmit={handleReviewSubmit} handleReviewChange={handleReviewChange} reviewFormData={reviewFormData} />
     }
     <form onSubmit = {handleSearchSubmit}>
      <input type ="text" placeholder="Search Term" name="search" value={searchFormData.search} onChange={handleChange}></input><br></br>
      <button className='add-review-form-button'>Find Albums</button>
     </form>
     {searchResults && 
     <div className='search-results-container'>{
     searchResults.map(r=>
      <SearchResultCard albumName ={r.name} artistName ={r.artists[0].name
      } artwork={r.images[1].url} selectAlbumNameForReview={selectAlbumNameForReview}
      artistId ={r.artists[0].id} albumId ={r.id}
      ></SearchResultCard>
      
      )}</div>}
     
      
    </div>
  );
}

export default ReviewSearchAndSelect;