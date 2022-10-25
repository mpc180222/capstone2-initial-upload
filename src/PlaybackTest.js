import React, { useState, useEffect } from 'react';

function PlaybackTest() {

    const [player, setPlayer] = useState(undefined);

    useEffect(() => {

        const script = document.createElement("script");
        script.src = "https://sdk.scdn.co/spotify-player.js";
        script.async = true;
    
        document.body.appendChild(script);
    
        window.onSpotifyWebPlaybackSDKReady = () => {
    
            const SpotifyPlayer = new window.Spotify.Player({
                name: 'Web Playback SDK',
                getOAuthToken: cb => { cb('BQDawM0w2IJ-GgZt_jYrgiZKnw58CCxvhCbirPti_PJfvFydoXCCZQOpieSYjzcn2o1ThLLpFMNkNomTIpYdLvlI7s3Sq-yRu4Qum5WZPlXxiHt_OSSlEOduzc08GtbGrUqAshC8QW5fPkSbh7LcrwFC99VmotsLMS3VtAop8HJTx7E'); },
                volume: 0.5
            });
    
            setPlayer(SpotifyPlayer);
    
            SpotifyPlayer.addListener('ready', ({ device_id }) => {
                console.log('Ready with Device ID', device_id);
            });
    
            SpotifyPlayer.addListener('not_ready', ({ device_id }) => {
                console.log('Device ID has gone offline', device_id);
            });
    
    
            SpotifyPlayer.connect();
    
        };
    }, []);

   return (
      <>
        <div className="container">
           <div className="main-wrapper">

            </div>
        </div>
      </>
    );
}

export default PlaybackTest;