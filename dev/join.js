
let connection = null;
let room = null;
let localTracks = [];
const remoteTracks = {};
const changeList = {};
let frameArray = [1,2,3,4];
let isJoined = false;

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
          console.log('INFO: Participants: ' + JSON.stringify(changeList));
        }

        var remoteVideo = "#remoteVideo" +changeList[participant];
        var remoteAudio = "#remoteAudio" +changeList[participant];

        if (localTracks[i].getType() === 'video') {
            // $('body').append(`<video autoplay='1' id='localVideo${i}' />`);
            $(remoteVideo).replaceWith(
              `<div id='remoteVideo${changeList[participant]}'><video autoplay='1' id='localVideo${i}' width='300px'/></div>`);
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
      console.log('INFO: Participants: ' + JSON.stringify(changeList));
    }

    var remoteVideo = "#remoteVideo" +changeList[participant];
    var remoteAudio = "#remoteAudio" +changeList[participant];

    if (track.getType() === 'video') {
        /*$('body').append(
            `<video autoplay='1' id='${participant}video${idx}' />`);*/
        $(remoteVideo).replaceWith(
          `<div id='remoteVideo${changeList[participant]}'><video autoplay='1' id='${participant}video${idx}' width='300px'/></div>`);
    } else {
        /*$('body').append(
            `<audio autoplay='1' id='${participant}audio${idx}' />`);*/
        $(remoteAudio).replaceWith(
          `<div id='remoteAudio${changeList[participant]}'><audio autoplay='1' id='${participant}audio${idx}' /></div>`);
    }
    track.attach($(`#${id}`)[0]);
    console.log('INFO: Remote track added!');
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
      $(remoteVideo).replaceWith(
          `<div id='remoteVideo${changeList[participant]}'><img src="resources/user.png" width="200px" height="175px"/></div>`);
      $(remoteAudio).replaceWith(
          `<div id='remoteAudio${changeList[participant]}'></div>`);
      frameArray.push(changeList[participant]);
      delete changeList[participant];
    }
    console.log('INFO: Participants after track remove: ' + JSON.stringify(changeList));
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined() {
    console.log('INFO: Conference joined!');
    isJoined = true;
    for (let i = 0; i < localTracks.length; i++) {
        room.addTrack(localTracks[i]);
    }
}

/**
 * function is called when connection is established successfully
 */
function onConnectionSuccess() {
    room = connection.initJitsiConference('aaltofishbowlconference', interfaceConfig);
    room.on(JitsiMeetJS.events.conference.TRACK_ADDED, onRemoteTrack);
    room.on(JitsiMeetJS.events.conference.TRACK_REMOVED, onRemoteTrackRemove);
    room.on(JitsiMeetJS.events.conference.CONFERENCE_JOINED,onConferenceJoined);
    room.on(JitsiMeetJS.events.conference.USER_JOINED, id => {
        console.log('INFO: User join');
        remoteTracks[id] = [];
    });
    room.join();
}

/**
 * function is called when the connection fails.
 */
function onConnectionFailed() {
    console.error('WARN: Connection Failed!');
}

/**
 * function is called when disconnect. NOT FULLY IMPLEMENTED YET.
 */
function disconnect() {
    console.log('INFO: Connection disconnect!');
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
    .catch(error => console.log('ERROR: JitsiMeetJS.init says ' +error));

function btnClick() {
    alert('INFO: Leave functionality not implemented yet!');
}

