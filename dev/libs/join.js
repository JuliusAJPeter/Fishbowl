
let connection = null;
let room = null;
let localTracks = [];
const remoteTracks = {};
const changeList = {};
let frameArray = [1,2,3,4];
let isJoined = false;
let blink = false;
let seats = [];
/*let emptySeat = Array.from(Array(40).keys());*/
let emptySeat = [0,12,20,8,24,16,4,1,13,9,17,5,2,14,22,10,26,18,6,3,15,11,19,7,28,36,34,38,32,21,29,25,30,37,35,39,33,23,31,27];
let avatarLoc = "https://webdialogos.fi/fishbowl/kuvat/";

/**
 * Fill in the empty chairs
 */
refreshSeats();

/**
 * Handles local tracks.
 * @param tracks Array with JitsiTrack objects
 */
function onLocalTracks(tracks) {
    localTracks = tracks;
    for (let i = 0; i < localTracks.length; i++) {
        const participant = localTracks[i].getParticipantId();
        if (!(participant in changeList)){
          changeList[participant] = frameArray.shift();
          console.log('INFO (join.js): Participants: ' + JSON.stringify(changeList));
        }

        var remoteVideo = "#remoteVideo" +changeList[participant];
        var remoteAudio = "#remoteAudio" +changeList[participant];

        if (localTracks[i].getType() === 'video') {
            // $('body').append(`<video autoplay='1' id='localVideo${i}' />`);
            $(remoteVideo).replaceWith(
              `<div id='remoteVideo${changeList[participant]}'><video autoplay='1' id='localVideo${i}' width='308px'/></div>`);
            localTracks[i].attach($(`#localVideo${i}`)[0]);
        } else {
            // $('body').append(
                // `<audio autoplay='1' muted='true' id='localAudio${i}' />`);
            $(remoteAudio).replaceWith(
                `<div id='remoteAudio${changeList[participant]}'><audio autoplay='1' muted='true' id='localAudio${i}' /></div>`);
            localTracks[i].attach($(`#localAudio${i}`)[0]);
        }
        if (isJoined) {
            room.addTrack(localTracks[i]);
        }
    }
}

/**
 * Handles remote tracks
 * @param track JitsiTrack object
 */
function onRemoteTrack(track) {
    console.log('OnRemoteTrack:' +track.toString);
    if (track.isLocal()) {
        return;
    }
    const participant = track.getParticipantId();
    if (!remoteTracks[participant]) {
        remoteTracks[participant] = [];
    }
    const idx = remoteTracks[participant].push(track);
    const id = participant + track.getType() + idx;

    if (!(participant in changeList)){
      changeList[participant] = frameArray.shift();
      console.log('INFO (join.js): Participants: ' + JSON.stringify(changeList));
    }

    var remoteVideo = "#remoteVideo" +changeList[participant];
    var remoteAudio = "#remoteAudio" +changeList[participant];

    if (track.getType() === 'video') {
        /*$('body').append(
            `<video autoplay='1' id='${participant}video${idx}' />`);*/
        $(remoteVideo).replaceWith(
          `<div id='remoteVideo${changeList[participant]}'><video autoplay='1' id='${participant}video${idx}' width='308px'/></div>`);
        for (var i=0; i<40; i++) {
          if (seats[i] != undefined) {
            if (seats[i].userId == participant) {
              seats.splice(i, 1);
              emptySeat.push(i);
            } 
          }
        }
        refreshSeats();
    } else {
        /*$('body').append(
            `<audio autoplay='1' id='${participant}audio${idx}' />`);*/
        $(remoteAudio).replaceWith(
          `<div id='remoteAudio${changeList[participant]}'><audio autoplay='1' id='${participant}audio${idx}' /></div>`);
    }
    track.attach($(`#${id}`)[0]);
    console.log('INFO (join.js): Remote track added!');
}

/**
 * function is called when remote track (audio or video) is removed
 */
function onRemoteTrackRemove(track) {
    console.log(`INFO: Track removed!${track}`);
    const participant = track.getParticipantId();
    if (participant in changeList) {
      var remoteVideo = "#remoteVideo" +changeList[participant];
      var remoteAudio = "#remoteAudio" +changeList[participant];
      switch (changeList[participant]) {
	case 1:
	   $(remoteVideo).replaceWith(
		`<div id='remoteVideo${changeList[participant]}'><img src="resources/top-left.png"/></div>`);
	   break;
	case 2:
	   $(remoteVideo).replaceWith(
		`<div id='remoteVideo${changeList[participant]}'><img src="resources/top-right.png"/></div>`);
	   break;
	case 3:
	   $(remoteVideo).replaceWith(
	        `<div id='remoteVideo${changeList[participant]}'><img src="resources/bottom-left.png"/></div>`);
	   break;
	case 4:
	   $(remoteVideo).replaceWith(
	        `<div id='remoteVideo${changeList[participant]}'><img src="resources/bottom-right.png"/></div>`);
	   break;
	}
      /*
      $(remoteVideo).replaceWith(
          `<div id='remoteVideo${changeList[participant]}'><img src="resources/conference-chair.png"/></div>`);
      */
      $(remoteAudio).replaceWith(
          `<div id='remoteAudio${changeList[participant]}'></div>`);
      frameArray.push(changeList[participant]);
      delete changeList[participant];
    }
    //console.log('INFO (join.js): Participants after track remove: ' + JSON.stringify(changeList));
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined() {
    console.log('INFO (join.js): Conference joined!');
    isJoined = true;
    for (let i = 0; i < localTracks.length; i++) {
        room.addTrack(localTracks[i]);
    }
    /*$('#mainBtn').attr('disabled', false);*/ //No one leaves untill 5th person joins
    $.toast({
        text: 'You have joined the Panel.',
        icon: 'success',
        showHideTransition: 'fade',
        allowToastClose: false,
        hideAfter: 5000,
        stack: 5,
	loader: false,
        position: 'top-right',
        textAlign: 'left',
        bgColor: '#333333',
        textColor: '#ffffff'
    }); 
}

/**
 * function is called when connection is established successfully
 */
function onConnectionSuccess() {
    room = connection.initJitsiConference(details.roomName, interfaceConfig);
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, onRemoteTrackRemove);
    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED,onConferenceJoined);
    /*
    room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
        console.log('INFO (join.js): User join');
        remoteTracks[id] = [];
    });
    */
    room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.setDisplayName(details.nickName + "@" + details.key);
    
    room.on(JitsiMeetJS.events.conference.MESSAGE_RECEIVED, onMessageReceive);
    room.join();
    /* User joined in the panel so no avatar on the chair
    seats[0] = {userId: 0,
                placeHolder: emptySeat.shift(),
                nickname: details.nickName,
                key: details.key,
                fileName: avatarLoc + 
                          details.roomName + "_" + 
                          details.nickName + "_" +
                          details.key + ".png"
               };
    var imgId = '#img' + seats[0].placeHolder;
    $(imgId).replaceWith(
      `<img id="img${seats[0].placeHolder}" src="${seats[0].fileName}"/>`);
    */
}

function onUserJoined(id, user) {
    remoteTracks[id] = [];
    chairIdx = emptySeat.shift();
    var displayName = user._displayName;
    var nameKeyStr = displayName.split("@");    
    seats[chairIdx] = {userId: id,
                       placeHolder: chairIdx,
    		       nickname: nameKeyStr[0],
                       key: nameKeyStr[1],
    		       fileName: avatarLoc + 
                                 details.roomName + "_" + 
                                 nameKeyStr[0] + "_" +
                                 nameKeyStr[1] + ".png"};
    var imgId = '#img' + seats[chairIdx].placeHolder;
    $(imgId).replaceWith(
      `<img id="img${seats[chairIdx].placeHolder}" src="${seats[chairIdx].fileName}"/>`);

}

function onUserLeft(id, user) {
    for (var i=0; i<40; i++) {
      if (seats[i] !== undefined) {
        if (seats[i].userId === id)
	  seats.splice(i, 1);
          emptySeat.push(i);
      }
    }
    refreshSeats();
}

function refreshSeats() {
    var imgId,
        src;
    for (var i=0; i<40; i++) {
      if (seats[i] !== undefined) {
        imgId = '#img' + seats[i].placeHolder;
        $(imgId).replaceWith(
          `<img id="img${seats[i].placeHolder}" src="${seats[i].fileName}"/>`);
      } else {
          if ((i>2 && i<15) ||
              (i>25 && i<34)) {
            src = "resources/chair-right.png";
          }
          else {
            src = "resources/chair-left.png";
          }
          imgId = '#img' + i;
          $(imgId).replaceWith(
            `<img id="img${i}" src="${src}"/>`);
      }
    }
}

/**
 * function is called when a message is received
 */
function onMessageReceive(id, text, ts) {
    console.log("onMessageReceive" +id);
    console.log("onMessageReceive" +text);
    console.log("onMessageReceive" +ts);
    var split = text.split("@");
    if (split[0] === "REQUEST") {
        $('#mainBtn').attr('disabled', false);
	var diff = new Date().getTime() - new Date(split[1]).getTime();
	console.log("onMessageReceive" +diff);
	if (Math.floor(diff/1000) < 10) {
	  blink = true;
 	  $.toast({
            text: 'Someone wants to join!',
            icon: 'info',
            showHideTransition: 'fade',
            allowToastClose: false,
            hideAfter: 5000,
            stack: 5,
	    loader: false,
            position: 'top-right',
            textAlign: 'left',
            bgColor: '#333333',
            textColor: '#ffffff'
          });
	}	
    } else if (split[0] === "STOP") {
	blink = false;
        $('#mainBtn').attr('disabled', true);
	clearInterval(blinkBtn);
    } else {
	$.toast({
           text: text,
           icon: 'info',
           showHideTransition: 'fade',
           allowToastClose: false,
           hideAfter: 5000,
           stack: 5,
	   loader: false,
           position: 'top-right',
           textAlign: 'left',
           bgColor: '#333333',
           textColor: '#ffffff'
        });
    }
}

/**
 * function is called when the connection fails.
 */
function onConnectionFailed() {
    console.error('WARN (join.js): Connection Failed!');
}

/**
 * function is called when disconnect. NOT FULLY IMPLEMENTED YET.
 */
function disconnect() {
    console.log('INFO (join.js): Connection disconnect!');
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
        onConnectionSuccess);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_FAILED,
        onConnectionFailed);
    connection.removeEventListener(
        JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
        disconnect);
}

/**
 * function called when windiw is closed.
 */
function unload() {
    for(let i = 0; i<localTracks.length; i++) {
      //console.log("INFO: localTrack: " +localTracks[i]);
      //localTracks[i].stop();
      localTracks[i].dispose();
    }	    
    room.leave();
    connection.disconnect();
}

$(window).bind('beforeunload', unload);
$(window).bind('unload', unload);

JitsiMeetJS.init(config)
    .then(() => {
        connection = new JitsiMeetJS.JitsiConnection(null, null, config);
        $.toast({
	     text: 'Rearranging the video a bit...',
	     icon: 'info',
	     showHideTransition: 'fade',
	     allowToastClose: false,
             hideAfter: 2000,
	     stack: 5,
	     loader: false,	
	     position: 'top-right',
	     textAlign: 'left',
	     bgColor: '#333333',
	     textColor: '#ffffff'	
	}); 
        connection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_ESTABLISHED,
            onConnectionSuccess);
        connection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_FAILED,
            onConnectionFailed);
        connection.addEventListener(
            JitsiMeetJS.events.connection.CONNECTION_DISCONNECTED,
            disconnect);

        connection.connect();
        JitsiMeetJS.createLocalTracks({ devices: [ 'audio', 'video' ] })
            .then(onLocalTracks)
            .catch(error => {
                throw error;
            });
    })
    .catch(error => console.log('ERROR (join.js): JitsiMeetJS.init says ' +error));

function btnClick() {
    clearInterval(blinkBtn);
    blink = false;
    unload();
    $('script').each(function() {
	if (this.src == 'https://webdialogos.fi/libs/join.js' ||
	    this.src == 'https://webdialogos.fi/libs/join-config.js')
	    this.parentNode.removeChild(this);
    });
    $('#mainBtn').text('join the panel'); 
    $('#mainBtn').attr('disabled', true);
    $('body').append('<script src="libs/audience-config.js"></script>');
    $('body').append('<script src="libs/audience.js"></script>');
}

var blinkBtn = setInterval(function() {
   if (blink){
     $('#mainBtn').text('');
     setTimeout(function() {
	$('#mainBtn').text('leave the panel');
     }, 500);
   }
}, 1000);

function showAvatar(order) {
  var modalContent;
  if (seats[order] === undefined) {
    modalContent = '<h2>@empty chair</h2>';
  }
  else {
    modalContent = '<h2>@' + seats[order].nickname + '</h2>' +
                       '<img src="' + seats[order].fileName + '"/>';
  }
  modal.open({
     content: modalContent,
     width: "340px",
     heigth: "225px"
  });
}

