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

let picture = null;
let nickname = null;
let localStream = null;

function go(){
  var script = document.createElement('script');
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
  var data = {"username": nickname,
	      "image"   : picture};
  /*
  $.ajax({
         url: "https://fishbowl.aalto.fi/fishbowl_register",
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
  });
  /*
  xhr = new XMLHttpRequest();
  var url = "https://fishbowl.aalto.fi/fishbowl_register";
  xhr.open("POST", url, true);
  xhr.setRequestHeader("Content-type", "application/json");
  xhr.onreadystatechange = function () { 
    if (xhr.readyState == 4 && xhr.status == 200) {
        var json = JSON.parse(xhr.responseText);
        console.log(JSON.stringify(json));
    }
  }
  var data = JSON.stringify({"username":nickname,"image":picture});
  xhr.send(data);*/ 
 
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
     context.drawImage(camera, 0, 0, 300, 150);
     picture = canvas.toDataURL('image/png');
     localStream.getTracks()[0].stop();
     $('#video').replaceWith('<img id="avatar-here" src="'+picture+'"></img>');
     $('#click-snap').attr('onclick', 'snap(0)');
  }
}


