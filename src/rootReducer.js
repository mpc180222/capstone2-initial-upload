const INIT_STATE = { currAlbum: {}, reviewList: [], currReview: {}, 
currUser: {noUser: 'User not detected'}, artistReviews: [], artistList: []}

function rootReducer(state = INIT_STATE, action){

    switch(action.type) {

    

        case "LOAD-REVIEW-LIST":
          
            return {...state, reviewList: action.payload}
        
        case "LOAD-CURR-USER":

            return {...state, currUser: action.payload}
        case "LOGOUT-CURR-USER":
            return {...state, currUser: {noUser: 'User not detected'}};
        case "LOAD-ARTIST-REVIEW-LIST":
            return {...state, artistReviews: action.payload}
        case "LOAD-ARTISTS-LIST":
           
            return {...state, artistList: action.payload}

        default:
            return state;

    }

}



export default rootReducer;