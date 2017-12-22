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

let image = null;
let nickname = null;
let roomname = null;
let localStream = null;

function go(){
  var script = document.createElement('script');
  roomname = document.getElementById('form-details').elements.item(0).value;
  nickname = document.getElementById('form-details').elements.item(1).value;
  script.text = "var details = {roomName:'" +
                document.getElementById('form-details').elements.item(0).value +
                "',nickName:'" +
                nickname +
                "'};";
  document.body.appendChild(script);
  $('.container').css('display', 'block');
  $('.form-module').css('display', 'none');
  $('.banner').css('display', 'none');
  var data = JSON.stringify({"roomname": roomname,
	  		     "username": nickname,
	                     "image"   : image});
  /*$.ajax({
         url: "https://fishbowl.havoc.fi/fishbowl_register",
	 type: "POST",
	 data: data,
	 dataType: "application/json",
         success: function(response){
	   	     console.log(response);
	          },
	 error: function(xhr, ajaxOptions, thrownError) {
	           alert(xhr.status);
		   alert(thrownError);
	          }
  });*/
 
  $('body').append('<script src="libs/strophe/strophe.js"></script>');
  $('body').append('<script src="libs/strophe/strophe.disco.min.js?v=1"></script>');
  $('body').append('<script src="libs/audience-config.js"></script>');
  $('body').append('<script src="libs/interface_config.js"></script>');
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
       localStream = stream;
       $('#avatar-here').replaceWith('<video id="video" src="'+vendorURL.createObjectURL(stream)+'" autoplay></video>');
       $('#click-snap').attr('onclick', 'snap(1)');
       video.play();
     }, function(error){
        console.log("ERROR: " +error);
     });
  }
  if(value == 1) {
     var camera = document.getElementById('video'),
	 canvas = document.createElement('canvas'),
         context = canvas.getContext('2d');
     canvas.width = 300;
     canvas.height = 225;
     context.drawImage(camera, 0, 0, 300, 225);
     image = canvas.toDataURL('image/png');
     $('#video').replaceWith('<img id="avatar-here" src="'+image+'"></img>');
     $('#click-snap').attr('onclick', 'snap(0)');
     localStream.getTracks()[0].stop();
  }
}


