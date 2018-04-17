

let connection = null;
let room = null;
var chairIdx = null;
const remoteTracks = {};
const changeList = {};
let frameArray = [1,2,3,4];
let count = 20;
let triggerJoin = false;
let audienceSeats = [];
let audienceEmptySeat = [0,12,20,8,24,16,4,1,13,9,17,5,2,14,22,10,26,18,6,3,15,11,19,7,28,36,34,38,32,21,29,25,30,37,35,39,33,23,31,27];
let avatarLoc = "https://webdialogos.fi/fishbowl/kuvat/";

var proxyAudienceSeats = new Proxy(audienceSeats, {
  set: function(target, property, value, receiver) {
	 target[property] = value;
         var imgId,
             src;
         for (var i=0; i<40; i++) {
           if (target[i] !== undefined) {
             imgId = '#img' + target[i].placeHolder;
             $(imgId).replaceWith(
               `<img id="img${target[i].placeHolder}" src="${target[i].fileName}"/>`);
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
         return true;
  }
});

/*
$('#mainBtn').text('join the panel');
$('#mainBtn').attr('disabled', true);*/
/*$('#mainBtn').attr('cursor', 'pointer');*/
$('#mainBtn').replaceWith(`<img id="mainBtn" src="resources/joinBtn.png" onClick="btnClick()"/>`);
$('#mainBtn').attr('disabled', true);

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
      for (var i=0; i<40; i++) {
          if (proxyAudienceSeats[i] !== undefined) {
            if (proxyAudienceSeats[i].userId === participant) {
              proxyAudienceSeats[i] = undefined;
              audienceEmptySeat.push(i);
              break;
            }
          }
      }
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
    //console.log('INFO (audience.js): Conference joined in silence!');
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
    room.setDisplayName(details.nickName + "@" + details.key);
    room.join();
    chairIdx = audienceEmptySeat.shift();
    proxyAudienceSeats[chairIdx] = {userId: 0,
               placeHolder: chairIdx,
               nickname: details.nickName,
               key: details.key,
               fileName: avatarLoc +
                          details.roomName + "_" +
                          details.nickName + "_" +
                          details.key + ".png"};
}

function onUserJoined(id, user) {
    remoteTracks[id] = [];
    chairIdx = audienceEmptySeat.shift();
    var displayName = user._displayName;
    var nameKeyStr = displayName.split("@");
    proxyAudienceSeats[chairIdx] = {userId: id,
                placeHolder: chairIdx,
    		        nickname: nameKeyStr[0],
                key: nameKeyStr[1],
    		        fileName: avatarLoc +
                          details.roomName + "_" +
                          nameKeyStr[0] + "_" +
                          nameKeyStr[1] + ".png"};
}

function onUserLeft(id, user) {
    for (var i=0; i<40; i++) {
      if (proxyAudienceSeats[i] !== undefined) {
        if (proxyAudienceSeats[i].userId === id) {
          proxyAudienceSeats[i] = undefined;
          audienceEmptySeat.push(i);
          break;
        }
      }
    }
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
 * function called when window is closed.
 */
function unload() {
    room.leave();
    connection.disconnect();
}

function beforeUnload() {
    unload();
    $('script').each(function() {
      if (this.src == 'https://webdialogos.fi/libs/audience.js' ||
	        this.src == 'https://webdialogos.fi/libs/audience-config.js' ||
          this.src == 'https://webdialogos.fi/libs/interface_config.js' ||
          this.src == 'https://webdialogos.fi/libs/strophe/strophe.js' ||
          this.src == 'https://webdialogos.fi/libs/strophe/strophe.disco.min.js?v=1')
	        this.parentNode.removeChild(this);
    });
    $('.container').css('display', 'none');
    $('.form-module').css('display', 'block');
    $('.banner').css('display', 'block');
}

$(window).bind('beforeunload', beforeUnload);
$(window).bind('unload', unload);
$(window).on('popstate', beforeUnload);

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
     var txtMessage = "REQUEST@" +new Date().toISOString();
     room.sendTextMessage(txtMessage);
     triggerJoin = true;
   }
}

function join() {
   unload();
   $('script').each(function() {
	if (this.src == 'https://webdialogos.fi/libs/audience.js' ||
	    this.src == 'https://webdialogos.fi/libs/audience-config.js')
		this.parentNode.removeChild(this);
   });
   /*$('#mainBtn').text('leave the panel');
   $('#mainBtn').text('');*/
   $('#mainBtn').replaceWith(`<img id="mainBtn"/>`);
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
  	/*count==0 ? count=20 : count;*/
   } else if (triggerJoin && frameArray.length > 0) {
        $.toast().reset('all');
	      room.sendTextMessage("STOP@nothing");
	      triggerJoin = false;
	      clearInterval(queue);
	      join();
   }

   if (count == 0) {
    	$.toast().reset('all');
      room.sendTextMessage("STOP@nothing");
      triggerJoin = false;
      count = 20;
      $('#mainBtn').attr('disabled', false);
      $.toast({
               text: 'Joining request failed! Please click Join again.',
               icon: 'error',
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
   }
}, 1000);

function showAvatar(order) {
  var modalContent;
  if (audienceSeats[order] === undefined) {
    modalContent = '<h2>@empty chair</h2>';
  }
  else {
    modalContent = '<h2>@' + audienceSeats[order].nickname + '</h2>' +
		   '<img src="' + audienceSeats[order].fileName + '"/>';
  }
  modal.open({
     content: modalContent,
     width: "340px",
     heigth: "225px"
  });
}
