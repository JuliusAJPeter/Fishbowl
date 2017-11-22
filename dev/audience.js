
let connection = null;
let room = null;
const remoteTracks = {};
const changeList = {};
let speakerCount = 1;
let speakerRemoved = 0;
let lastParticipant = null;

/**
 * Handles remote tracks
 * @param track JitsiTrack object
 */
function onRemoteTrack(track) {
    if (track.isLocal()) {
        return;
    }
    const participant = track.getParticipantId();
    if (lastParticipant == null) {
        lastParticipant = participant;
        changeList[participant] = speakerCount;
    }

    if (!remoteTracks[participant]) {
        remoteTracks[participant] = [];
    }
    const idx = remoteTracks[participant].push(track);
    const id = participant + track.getType() + idx;

    if (!(participant in changeList)){
      if (speakerRemoved != 0) {
        speakerCount = speakerRemoved;
	      speakerRemoved = 0;
      }
      else {
        speakerCount = speakerCount+1;
      }
      changeList[participant] = speakerCount;
      console.log('INFO: Participants: ' + JSON.stringify(changeList));
      // lastParticipant = participant;
    }

    //var remoteVideo = "#remoteVideo" +speakerCount;
    //var remoteAudio = "#remoteAudio" +speakerCount;
    var remoteVideo = "#remoteVideo" +changeList[participant];
    var remoteAudio = "#remoteAudio" +changeList[participant];

    if (track.getType() === 'video') {
        /*$('body').append(
            `<video autoplay='1' id='${participant}video${idx}' />`);*/
        $(remoteVideo).replaceWith(
          `<div id='remoteVideo${speakerCount}'><video autoplay='1' id='${participant}video${idx}' width='300px'/></div>`);
    } else {
        /*$('body').append(
            `<audio autoplay='1' id='${participant}audio${idx}' />`);*/
        $(remoteAudio).replaceWith(
          `<div id='remoteAudio${speakerCount}'><audio autoplay='1' id='${participant}audio${idx}' /></div>`);
    }
    track.attach($(`#${id}`)[0]);
    console.log('INFO: Remote track added!');
}

function onRemoteTrackRemove(track) {
    console.log(`INFO: Track removed!${track}`);
    const participant = track.getParticipantId();
    if (participant in changeList) {
      speakerRemoved = changeList[participant];
      delete changeList[participant];
    }
    //speakerRemoved = changeList[participant];
    delete changeList[participant];
    console.log('INFO: Participants after track remove: ' + JSON.stringify(changeList));
}

/**
 * That function is executed when the conference is joined
 */
function onConferenceJoined() {
    console.log('INFO: Conference joined in silence!');
}

/**
 * That function is called when connection is established successfully
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
 * This function is called when the connection fail.
 */
function onConnectionFailed() {
    console.error('WARN: Connection Failed!');
}

/**
 * This function is called when we disconnect.
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
 *
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
    })
    .catch(error => console.log('ERROR: JitsiMeetJS.init says ' +error));
