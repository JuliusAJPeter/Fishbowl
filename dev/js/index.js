// Toggle Function
$('.toggle').click(function(){
  // Switches the Icon
  $(this).children('i').toggleClass('fa-exclamation');
  // Switches the forms
  $('.form').animate({
    height: "toggle",
    'padding-top': 'toggle',
    'padding-bottom': 'toggle',
    opacity: "toggle"
  }, "slow");
});


function go(){
  var script = document.createElement('script');
  script.text = "var details = {roomName:'" +
                document.getElementById('form-details').elements.item(0).value +
                "',nickName:'" +
                document.getElementById('form-details').elements.item(1).value +
                "'};";
  document.body.appendChild(script);
  $('.conference').css('display', 'block');
  $('.form-module').css('display', 'none');
  $('.banner').css('height', '5px');
  //$('body').append('<script src="libs/jquery-2.1.1.min.js"></script>');
  $('body').append('<script src="libs/strophe/strophe.js"></script>');
  $('body').append('<script src="libs/strophe/strophe.disco.min.js?v=1"></script>');
  $('body').append('<script src="libs/audience-config.js"></script>');
  $('body').append('<script src="libs/interface_config.js"></script>');
  //$('body').append('<script src="https://cdn.jitsi.net/2367/libs/lib-jitsi-meet.min.js?v=2367"></script>');
  $('body').append('<script src="libs/audience.js"></script>');
}

function snap(value) {
  if(value == 0){
     var video = document.createElement('video'),
                 vendorURL = window.URL || window.webkitURL;
     navigator.getMedia = navigator.getUserMedia ||
                          navigator.webkitGetUserMedia;
     navigator.getMedia({
       video: true,
       audio: false
     }, function(stream) {
       //video.src = vendorURL.createObjectURL(stream);
       //console.log(video);
       $('#avatar-here').replaceWith('<video id="video" src="'+vendorURL.createObjectURL(stream)+'"></video>');
       $('#click-snap').attr('onclick', 'snap(1)');
       video.play();
     }, function(error){
        console.log("ERROR: " +error);
     });
  }
  if(value == 1) {
     var camera = document.getElementById('video'),
	 canvas = document.createElement('canvas'),
         //photo = document.createElement('img'),
	 context = canvas.getContext('2d');
     context.drawImage(camera, 0, 0, 300, 150);
     //photo.setAttribute('src', canvas.toDataURL('image/png'));
     //photo.setAtrribute('id', 'avatar-here');
     $('#video').replaceWith('<img id="avatar-here" src="'+canvas.toDataURL('image/png')+'"></img>');
     $('#click-snap').attr('onclick', 'snap(0)');
  }
}


