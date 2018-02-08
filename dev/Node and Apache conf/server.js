var DEST_DIR="/srv/fishbowl_pics";
var URL = "http://fishbowl.havoc.fi/fishbowl/kuvat/";

var http = require('http');
var fs = require('fs');
var url = require( "url" );
var querystring = require( "querystring" );

http.createServer(function (req, res) {
	console.dir(req.param);

	if (req.method == 'POST') {
		console.log("POST");
		var body = '';
		req.on('data', function (data) {
			body += data;
		});
		req.on('end', function () {
			var post = querystring.parse(body);
			var kala;
			console.log("post: " + post["username"]);

			var kala = undefined;




			fs.writeFile("/tmp/kalaa", body, function (err) {
				console.log("tmppi kiroitettu");	
			});





			try {
				kala = JSON.parse(body);
    			} catch(e) {
				console.log("NOT JSON DATA");
        			//alert(e); // error in the above string (in this case, yes)!
				var html = '<html><body>JSON parse failed.</body>';
				res.writeHead(200, {'Content-Type': 'text/html'});
				res.end(html);
				return(1);
    			}
	
			var username = "pekka";
			var base64_data = "dataaa";
			var roomname = "";

			var obj = JSON.parse(body, function (key, val) {
				if (key == "username") {
					username = val;
				} else if (key == "image") {
					//base64,
					val = val.substring(22, val.length);
					base64_data = val;
				} else if (key == "roomname") {
					roomname = val;
				}
			});

			console.log("USERNAME: " + username);
			
			if (!/^[a-zA-Z0-9]+$/.test(username)) {
				 console.log("HAXXOR detected");
				 res.writeHead(500, {'Content-Type': 'text/html'});
				res.end("<b>No haxxing please</b>");
				return (1);
			}
			if (!/^[a-zA-Z0-9]+$/.test(roomname)) {
				console.log("HAXXOR detected");
				res.writeHead(500, {'Content-Type': 'text/html'});
				res.end("<b>No haxxing please</b>");
				return (1);
			}
			console.log("DEST_DIR: " + DEST_DIR);
			pic_dst = DEST_DIR + "/" + roomname + "_" + username + ".png";

			// concert base64 to binary
			var uncoded = Buffer.from(base64_data, 'base64');
			//uncoded = base64_data;
			
			console.log("Writing pic to " + pic_dst);
			fs.writeFile(pic_dst, uncoded, function (err) {
				if (err)
                        		console.log("virhe: " + err);
                		else 
                        		console.log("kirjoitus onnistui tiedostoon " + pic_dst);
        		});

			res.writeHead(200, {'Content-Type': 'application/json'});
			foo = {'picurl': URL+username+".png" };
			const resBody = foo;
			resJSON = JSON.stringify(resBody);
			res.write(resJSON);
			res.end();
		});

	} else {
		console.log("GET");
		var html = '<html><body>Nothing to see here.</body>';
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	}

}).listen(8080, "0.0.0.0");
