

let connection = null;
let room = null;
var chairIdx = null;
const remoteTracks = {};
const changeList = {};
let frameArray = [1,2,3,4];
let count = 20;
let triggerJoin = false;
let seats = [];
let emptySeat = Array.from(Array(40).keys());
let avatarLoc = "https://fishbowl.havoc.fi/fishbowl/kuvat/";

/**
 * Handles remote tracks
 * @param track JitsiTrack object
 */
function onRemoteTrack(track) {
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
      console.log('INFO (audience.js): Participants: ' + JSON.stringify(changeList));
    }

    var remoteVideo = "#remoteVideo" +changeList[participant];
    var remoteAudio = "#remoteAudio" +changeList[participant];

    if (track.getType() === 'video') {
        /*$('body').append(
            `<video autoplay='1' id='${participant}video${idx}' />`);*/
        $(remoteVideo).replaceWith(
          `<div id='remoteVideo${changeList[participant]}'><video autoplay='1' id='${participant}video${idx}' width='308px'/></div>`);
    } else {
        /*$('body').append(
            `<audio autoplay='1' id='${participant}audio${idx}' />`);*/
        $(remoteAudio).replaceWith(
          `<div id='remoteAudio${changeList[participant]}'><audio autoplay='1' id='${participant}audio${idx}' /></div>`);
    }
    track.attach($(`#${id}`)[0]);
    console.log('INFO (audience.js): Remote track added!');
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
    //console.log('INFO (audience.js): Participants after track remove: ' + JSON.stringify(changeList));
}

/**
 * function is executed when the conference is joined
 */
function onConferenceJoined() {
    console.log('INFO (audience.js): Conference joined in silence!');
    $('#mainBtn').attr('disabled', false);
    /*room.sendTextMessage(details.nickName+" joined the room..");*/
    $.toast({
        text: 'You have joined the room as an audience.',
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
        console.log('INFO (audience.js): User join' +id);
        remoteTracks[id] = [];
    });
    */
    room.on(JitsiMeetJS.events.conference.USER_JOINED, onUserJoined);
    room.on(JitsiMeetJS.events.conference.USER_LEFT, onUserLeft);
    room.setDisplayName(details.nickName);	
    room.join();
    seats.push({placeHolder: emptySeat.shift(),
	        nickname: details.nickName,
	        fileName: avatarLoc + details.roomName + "_" + details.nickName + ".png"
	       });
    var imgId = '#img' + seats[0].placeHolder;
    $(imgId).replaceWith(
      `<img id="img${seats[0].placeHolder}" src="${seats[0].fileName}"/>`);
}

function onUserJoined(id, user) {
    console.log('onUserJoined id:' +id);
    console.log('onUserJoined user:' +user._displayName);
    remoteTracks[id] = [];
    chairIdx = emptySeat.shift();
    seats.push({placeHolder: chairIdx,
    		nickname: user._displayName,
    		fileName: avatarLoc + details.roomName + "_" + user._displayName + ".png"
    	       });
    var imgId = '#img' + seats[chairIdx].placeHolder;
    $(imgId).replaceWith(
	`<img id="img${seats[chairIdx].placeHolder}" src="${seats[chairIdx].fileName}"/>`);
}

function onUserLeft(id, user) {
    var removeIdx;
    for (var i=0; i<seats.length; i++) {
      if (seats[i].nickname == user._displayName) {
	removeIdx = i;
      }
    }
    seats.splice(removeIdx, 1);
    emptySeat.push(removeIdx);
    if ((removeIdx>2 && removeIdx<15) ||
	(removeIdx>25 && removeIdx<34)) {
      var src = "resources/chair-right.png";
    }
    else {
      var src = "resources/chair-left.png";
    }
    var imgId = '#img' + removeIdx;
    $(imgId).replaceWith(
	`<img id="img${removeIdx}" src="${src}"/>`);
}
/**
 * function is called when the connection fails.
 */
function onConnectionFailed() {
    console.error('WARN (audience.js): Connection Failed!');
}

/**
 * function is called when disconnect. NOT FULLY IMPLEMENTED YET.
 */
function disconnect() {
    console.log('INFO (audience.js): Connection disconnect!');
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
    room.leave();
    connection.disconnect();
}

$(window).bind('beforeunload', unload);
$(window).bind('unload', unload);

JitsiMeetJS.init(config)
    .then(() => {
        connection = new JitsiMeetJS.JitsiConnection(null, null, config);
        $.toast({
	     text: 'Connecting to room {'+details.roomName+'} ...',
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
    })
    .catch(error => console.log('ERROR (audience.js): JitsiMeetJS.init says ' +error));

function btnClick() {
   $('#mainBtn').attr('disabled', true);
   if (frameArray.length > 0) {
     join();
   } 
   else {
     room.sendTextMessage("REQUEST");
     triggerJoin = true;
   }
}

function join() {
   unload();
   $('script').each(function() {
	if (this.src == 'https://fishbowl.havoc.fi/dev/libs/audience.js' ||
	    this.src == 'https://fishbowl.havoc.fi/dev/libs/audience-config.js')
		this.parentNode.removeChild(this);
   });
   $('#mainBtn').text('leave the panel');
   $('body').append('<script src="libs/join-config.js"></script>');
   $('body').append('<script src="libs/join.js"></script>');
}

var queue = setInterval(function() {
   if (triggerJoin && frameArray.length == 0){
	$.toast({
           text: 'Moving you to the Panel in '+count+'s...',
	   icon: 'info',
	   showHideTransition: 'fade',
	   allowToastClose: false,
	   hideAfter: 2000,
	   stack: 1,
	   loader: false,
           position: 'top-right',
	   textAlign: 'left',
           bgColor: '#333333',
	   textColor: '#ffffff'
	});
	count--;
	count==0 ? count=20 : count;
   } else if (triggerJoin && frameArray.length > 0) {
        $.toast().reset('all');	   
	room.sendTextMessage("STOP");
	triggerJoin = false;
	clearInterval(queue);
	join();
   } 
}, 1000);

function showAvatar(order) {
  if (order >= seats.length) {
    var modalContent = '<h2>@empty chair</h2>';
  }
  else {
    var modalContent = '<h2>@' + seats[order].nickname + '</h2>' +
		       '<img src="' + seats[order].fileName + '"/>';
  }
  modal.open({
     content: modalContent,
     width: "340px",
     heigth: "225px"
  });
}
