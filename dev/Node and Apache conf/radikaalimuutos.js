var http = require('http');
var fs = require('fs');
var url = require( "url" );
var querystring = require( "querystring" );

// var jsonObject = JSON.parse(data);

http.createServer(function (req, res) {
	console.dir(req.param);
	console.log(req);

	if (req.method == 'POST') {
		console.log("POST");
		var body = '';
		req.on('data', function (data) {
			body += data;
			console.log("Partial body: " + body);
		});
		req.on('end', function () {
			console.log("Body: " + body);
		
			
		});

		var post = querystring.parse(body);
		console.log("body: " + body);
		var kala;
		if (!body) {
			console.log("body empty");
		} else {
			console.log("body not empty");
		}
		var kala = JSON.parse(body);
		console.log(kala);
		console.log(type(body));
	

		pic_dst = "~bgran/fishbowl_pics";
		console.log("destination: " + pic_dst);
		
		if (!/^[a-z0-9]+$/.test(pic_dst)) {
			console.log("HAXXOR detected");
		}
		//pic_dst += "/" + pc

		//res.writeHead(200, {'Content-Type': 'text/html'});
		//res.end('post received');

		res.writeHead(200, {'Content-Type': 'application/json'});
		foo = {'picurl': 'http://fishbowl.aalto.fi/fisbowl/kuvat/'+pic_dst };
		const resBody = foo;
		resJSON = JSON.stringify(resBody);
		res.write(resJSON);
		res.end();
	} else {
		console.log("GET");
		//var html = '<html><body><form method="post" action="http://localhost:3000">Name: <input type="text" name="name" /><input type="submit" value="Submit" /></form></body>';
		var html = fs.readFileSync('index.html');
		res.writeHead(200, {'Content-Type': 'text/html'});
		res.end(html);
	}

}).listen(8080);
