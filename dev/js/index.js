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

//modal Function
var modal = (function(){
  var
  method = {},
  $overlay,
  $modal,
  $content,
  $close;

  // Append the HTML

  $overlay = $('<div id="overlay"></div>');
  $modal = $('<div id="modal"></div>');
  $content = $('<div id="content"></div>');
  $close = $('<a id="close" href="#">close</a>');
  /*
  $overlay = $(document.getElementById('overlay'));
  $modal = $(document.getElementById('modal'));
  $content = $(document.getElementById('content'));
  $close = $(document.getElementById('close'));
  */
  $modal.hide();
  $overlay.hide();
  $modal.append($content, $close);

  $(document).ready(function(){
    $('body').append($overlay, $modal);
  });

  // Center the modal in the viewport
  method.center = function () {
    var top, left;
    top = Math.max($(window).height() - $modal.outerHeight(), 0) / 2;
    left = Math.max($(window).width() - $modal.outerWidth(), 0) / 2;
    $modal.css({
      top: top + $(window).scrollTop(),
      left: left + $(window).scrollLeft()
    });
  };

  // Open the modal
  method.open = function (settings) {
    $content.empty().append(settings.content);
    $modal.css({
      width: settings.width || 'auto',
      height: settings.height || 'auto'
    })
    method.center();
    $(window).bind('resize.modal', method.center);
    $modal.show();
    $overlay.show();
  };

  // Close the modal
  method.close = function () {
    $modal.hide();
    $overlay.hide();
    $content.empty();
    $(window).unbind('resize.modal');
  };

  $close.click(function(e){
    e.preventDefault();
    method.close();
  });
  return method;
}());

let image = null;
let nickname = null;
let roomname = null;
let localStream = null;
let key = null;

function go(){
  if (image == null) {
    $.toast({
        text: 'Please take a picture before entering the room!',
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
    return;
  }
  var script = document.createElement('script');
  roomname = document.getElementById('form-details').elements.item(0).value;
  nickname = document.getElementById('form-details').elements.item(1).value;
  key = new Date().getTime();
  script.text = "var details = {roomName:'" +
                document.getElementById('form-details').elements.item(0).value +
                "',nickName:'" + nickname +
                "',key:'" + key.toString() + "'};";
  console.log(script.text);
  document.body.appendChild(script);
  var data = JSON.stringify({"roomname": roomname,
  "username": nickname,
  "key": key.toString(),
  "image"   : image});
  $.ajax({
  url: "https://webdialogos.fi/fishbowl_register",
  type: "POST",
  data: data,
  dataType: "application/json",
  success: function(response){
             alert("Success:" +response);
           },
  error: function(xhr, ajaxOptions, thrownError) {
	 if (xhr.status == '200') {
           $('.container').css('display', 'block');
           $('.form-module').css('display', 'none');
           $('.banner').css('display', 'none');
	   $('body').append('<script src="libs/strophe/strophe.js"></script>');
	   $('body').append('<script src="libs/strophe/strophe.disco.min.js?v=1"></script>');
           $('body').append('<script src="libs/audience-config.js"></script>');
	   $('body').append('<script src="libs/interface_config.js"></script>');
	   $('body').append('<script src="libs/audience.js"></script>');
	 } else if (xhr.status == '503') {
           $.toast({
               text: 'Server is broken.. please notify admin.',
               icon: 'error',
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
         } else {
	   $.toast({
	       text: 'Something went wrong unexpectedly.. please try again.',
	       icon: 'error',
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
           /*alert("Error:" +xhr.status);
           alert("Error:" +thrownError);*/
         }
  });
  /*
  $('body').append('<script src="libs/strophe/strophe.js"></script>');
  $('body').append('<script src="libs/strophe/strophe.disco.min.js?v=1"></script>');
  $('body').append('<script src="libs/audience-config.js"></script>');
  $('body').append('<script src="libs/interface_config.js"></script>');
  $('body').append('<script src="libs/audience.js"></script>');*/
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
    $.toast({
	text: 'Click the camera icon again to capture your photo..',
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

function readme() {
  modal.open({
    content: '<h2>Dialogos: A tool for online fishbowl discussions</h2>' +
        '<ul>' +
        '<li>Fishbowl is a way to have a discussion with a large group of participants.</li>' +
        '<li>The aim of the discussion is to increase all participants understanding on a topic under discussion, to be a dialogue.</li>' +
        '<li>In the center, there are four chairs.</li>' +
        '<li>People on the chairs are the panel having a discussion.</li>' +
        '<li>The people in the center are the “fishbowl”.</li>' +
        '<li>Anyone in the audience may join the discussion at any time.</li>' +
        '<li>When someone joins the discussion, one of the people in the center must go to the audience.</li>' +
        '<li>Encourage and give space for all to visit the “fishbowl” so that every participant\'s point of view is heard.</li>' +
        '<li>Listen to everyone – equally and non-judgementally.</li>' +
        '<li>But, we hope that you are nice for the other.</li>' +
        '<li>If you really want to be an ass, go somewhere else. There are plenty of places for that on the Internet.</li>' +
        '</ul>',
    width: "450px",
    height: "422px"
  });
}
/*
function showAvatar(order) {
  modal.open({
    content: '<h2>@' + seats[order].nickName + '</h2>' +
        '<img src="' + seats[order].fileName + '"/>',
    width: "340px",
    heigth: "225px"
  });
}
*/
