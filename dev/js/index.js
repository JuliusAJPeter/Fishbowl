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
