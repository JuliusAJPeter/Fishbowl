var fs = require('fs');
var path = "/usr/share/jitsi-meet/dev/fishbowl_pics";
var schedule = require('node-schedule');

var rule = new schedule.RecurrenceRule();
rule.hour = 0;

console.log("Clean-up on /usr/share/jitsi-meet/dev/fishbowl_pics scheduled.");
var cleanup = schedule.scheduleJob(rule, cleanUp);

function cleanUp() {
  var date = new Date();
  console.log("========== Run date: " + date + " ==========");
  fs.readdir(path, function(err, items) {
    if (items.length == 0) {
      console.log("========== Dry run! Nothing to delete ==========");
      return;
    }

    items.forEach(function(filename){
      var file = path + '/' + filename;
      //console.log("Start: " + file);
      fs.unlink(file, function (err) {
        if (err) {
          console.error(err);
        }
        console.log('Deleted file: ' +file);
      });
    });
  });
}
