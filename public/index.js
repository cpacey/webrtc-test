var myVideo = document.getElementById("video");
var socket = io();

socket.on( 'go', () => {
  console.log( 'going' );
  playPauseActual();
} );

function playPauseActual() {
  if( myVideo.paused ) {
    myVideo.play();
  } else {
    myVideo.pause();
  }
}

function playPause() {
  socket.emit( 'start', {} );
}
