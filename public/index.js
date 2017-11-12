var socket = io();

var myVideo = document.getElementById( 'video' );
var localAudio = document.getElementById( 'localAudio') ;
var remoteAudio = document.getElementById( 'remoteAudio' );

socket.on( 'go', () => {
  console.log( 'going' );
  playPauseActual();
} );

socket.on( 'sdp', data => {
  console.log( 'sdp' );
  gotSdp( data );
} );

socket.on( 'ice', data => {
  console.log( 'ice' );
  gotIce( data );
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

// --------------------------------------

var localStream;
function getUserMediaSuccess( stream ) {
  console.log( 'getUserMediaSuccess' );
  localStream = stream;
  // localAudio.src = window.URL.createObjectURL( stream );
}

function getUserMediaError(error) {
    console.log(error);
}

navigator.getUserMedia(
  { audio: true, video: false },
  getUserMediaSuccess,
  getUserMediaError
);

// --------------------------------------

function gotIceCandidate( event ) {
  console.log( 'gotIceCandidate', event );
  if( event.candidate != null ) {
    socket.emit( 'ice', event.candidate );
  }
}

function gotRemoteStream( event ) {
    console.log( 'gotRemoteStream' );
    remoteAudio.src = window.URL.createObjectURL( event.stream );
}

var peerConnection;
function start( isCaller ) {
  console.log( 'start' );

  const peerConnectionConfig = {
    iceServers: [
      { url: 'stun:stun.services.mozilla.com' },
      { url: 'stun:stun.l.google.com:19302' }
    ]
  };

  peerConnection = new RTCPeerConnection( peerConnectionConfig );
  peerConnection.onicecandidate = gotIceCandidate;
  peerConnection.onaddstream = gotRemoteStream;
  peerConnection.addStream( localStream );

  if( isCaller ) {
    peerConnection.createOffer( gotDescription, createOfferError );
  }
}

function gotDescription(description) {
  console.log( 'gotDescription' );

  peerConnection.setLocalDescription(
    description,
    () => {
      console.log('setLocalDescription')
      socket.emit( 'sdp', description );
    },
    () => {
      console.log('setLocalDescription error')
    }
  );
}

function createOfferError( error ) {
    console.log( 'createOfferError', error );
}

function createAnswerError(error) {
    console.log( 'createAnswerError', error);
}

function gotSdp( data ) {
  console.log( 'gotSdp', data );

  if( !peerConnection ) {
    start( false );
  }

  const description = new RTCSessionDescription( data );

  peerConnection.setRemoteDescription(
    description,
    () => {
      if( data.type == 'offer' ) {
        peerConnection.createAnswer( gotDescription, createAnswerError );
      }
    }
  );
}

function gotIce( data ) {
  console.log( 'gotIce', data );

  if( !peerConnection ) {
    start( false );
  }

  const ice = new RTCIceCandidate( data );
  peerConnection.addIceCandidate( ice );
}
