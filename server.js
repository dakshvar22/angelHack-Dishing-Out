#!/bin/env node
//  OpenShift sample Node application
var express = require('express');
var session = require('express-session');
var fs      = require('fs');
var MongoClient = require('mongodb').MongoClient;
var db; 
var url = require('url');
var request = require('request');
//var PythonShell = require('python-shell');
/**
 *  Define the sample application.
 */
var SampleApp = function() {

    //  Scope.
    var self = this;


    /*  ================================================================  */
    /*  Helper functions.                                                 */
    /*  ================================================================  */

    /**
     *  Set up server IP address and port # using env variables/defaults.
     */
    self.setupVariables = function() {
        //  Set the environment variables we need.
        self.ipaddress = process.env.OPENSHIFT_NODEJS_IP;
        self.mongo = process.env.VCAP_SERVICES;
        self.port      = process.env.OPENSHIFT_NODEJS_PORT || 3000;
		self.mongodb_connection_string="";
		var sess = "";
		self.db = "";
        if (typeof self.ipaddress === "undefined") {
            //  Log errors on OpenShift but continue w/ 127.0.0.1 - this
            //  allows us to run/test the app locally.
            console.warn('No OPENSHIFT_NODEJS_IP var, using 127.0.0.1');
            //self.ipaddress = "127.0.0.1";
        };
        if (self.mongo) {
		  var env = JSON.parse(self.mongo);
		  if (env['mongodb-2.4']) {
			self.mongo = env['mongodb-2.4'][0]['credentials'];
			if (self.mongo.url) {
			  self.mongodb_connection_string = self.mongo.url;
			} else {
			  console.log("No mongo found");
			}  
		  } else {
			self.mongodb_connection_string = 'mongodb://localhost:27017';
		  }
		} else {
		  self.mongodb_connection_string = 'mongodb://localhost:27017/angelHack';
		}
        /*if(mongo){
			self.mongodb_connection_string = process.env.OPENSHIFT_MONGODB_DB_URL + db_name;
		}
		else
		{
			self.mongodb_connection_string = 'mongodb://localhost:27017/angelHack';
		}*/
		self.mongodb_connection_string = 'mongodb://dakshvar22:thanks123@ds031551.mongolab.com:31551/angelhack'
		MongoClient.connect(self.mongodb_connection_string, function(err, database) {
			if(err) throw err;
			else
			self.db = database;
		});
		self.headerZomato = {
			'User-Agent':       'Super Agent/0.0.1',
			'Content-Type':     'application/x-www-form-urlencoded',
			'X-Zomato-API-Key':	'7749b19667964b87a3efc739e254ada2'
		}
		
		
    };


    /**
     *  Populate the cache.
     */
    self.populateCache = function() {
        if (typeof self.zcache === "undefined") {
            self.zcache = { 'index.html': '' ,'dashboard.html':''};
        }

        //  Local cache for static content.
        self.zcache['index.html'] = fs.readFileSync('./views/index.html');
        self.zcache['dashboard.html'] = fs.readFileSync('./views/dashboard.html');
    };


    /**
     *  Retrieve entry (content) from cache.
     *  @param {string} key  Key identifying content to retrieve from cache.
     */
    self.cache_get = function(key) { return self.zcache[key]; };


    /**
     *  terminator === the termination handler
     *  Terminate server on receipt of the specified signal.
     *  @param {string} sig  Signal to terminate on.
     */
    self.terminator = function(sig){
        if (typeof sig === "string") {
           console.log('%s: Received %s - terminating sample app ...',
                       Date(Date.now()), sig);
           process.exit(1);
        }
        console.log('%s: Node server stopped.', Date(Date.now()) );
    };


    /**
     *  Setup termination handlers (for exit and a list of signals).
     */
    self.setupTerminationHandlers = function(){
        //  Process on exit and signals.
        process.on('exit', function() { self.terminator(); });

        // Removed 'SIGPIPE' from the list - bugz 852598.
        ['SIGHUP', 'SIGINT', 'SIGQUIT', 'SIGILL', 'SIGTRAP', 'SIGABRT',
         'SIGBUS', 'SIGFPE', 'SIGUSR1', 'SIGSEGV', 'SIGUSR2', 'SIGTERM'
        ].forEach(function(element, index, array) {
            process.on(element, function() { self.terminator(element); });
        });
    };


    /*  ================================================================  */
    /*  App server functions (main app logic here).                       */
    /*  ================================================================  */

    /**
     *  Create the routing table entries + handlers for the application.
     */
    self.createRoutes = function() {
        self.routes = { };

        self.routes['/asciimo'] = function(req, res) {
            var link = "http://i.imgur.com/kmbjB.png";
            res.send("<html><body><img src='" + link + "'></body></html>");
        };

        self.routes['/'] = function(req, res) {
			self.sess = req.session;
			/*if(self.sess.email)
			{
				res.redirect('/dashboard');
			}
			else
			{*/
				res.setHeader('Content-Type', 'text/html');
				res.send(self.cache_get('index.html') );
            //res.sendFile('index.html');
            //res.render('index');
			//}
        };
        self.routes['/addCustomer'] = function(req,res) {
			//res.setHeader('Content-Type', 'text/html');
			//res.send(self.mongodb_connection_string);
			var url_parts = url.parse(req.url, true);
			var name = url_parts.query.name;
			var number = url_parts.query.num;
			//console.log(FirstName);
			//var reportsTo = url_parts.query.report;
			var emailId = url_parts.query.email;
			var pwd = url_parts.query.pwd;
			var collection = self.db.collection('users');

			collection.insert({
				"Name" : name,
				//"ReportsTo" : reportsTo,
				"EmailId" : emailId,
				"Number" : number,
				"Password" : pwd
			}, function (err, doc) {
				if (err) {
					res.send("There was a problem adding the information to the database.");
				}
				else {
					//res.location("userlist");
					//res.redirect("userlist");
					res.header('Access-Control-Allow-Origin', '*');
					res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
					res.header('Access-Control-Allow-Headers', 'Content-Type');
					res.send('added');
				}
			});
		};
		self.routes['/getCustomer'] = function(req,res){
			self.db.collection('users').find().toArray(function (err, items) {
			res.header('Access-Control-Allow-Origin', '*');
			res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
			res.header('Access-Control-Allow-Headers', 'Content-Type');
			res.json({'user':items});
			});
		};
		self.routes['/login'] = function(req,res){
		var url_parts = url.parse(req.url, true);
		var emailId = url_parts.query.email;
		var pwd = url_parts.query.pwd;
		self.db.collection('users').find({EmailId:emailId,Password:pwd}).toArray(function(err,items){
			self.sess = req.session;
			self.sess.email = emailId;
			self.sess.admin = true;
			res.json({'user':items});
			});
		};
		self.routes['/dashboard'] = function(req,res){
			self.sess = req.session;
			console.log(self.sess.email);
			res.setHeader('Content-Type', 'text/html');
            res.send(self.cache_get('dashboard.html') );
		}
		self.routes['/getRestaurants'] = function(req,res){
			self.db.collection('restaurants').find().toArray(function (err, items) {
				res.header('Access-Control-Allow-Origin', '*');
				res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
				res.header('Access-Control-Allow-Headers', 'Content-Type');
				//console.log(items['location']['locality']);
				for(var i = 0;i<items.length;i++)
				{
					console.log(items[i]['location']['locality']);
				}
				res.json({'restaurants':items});
			});
		}
		self.routes['/addRestaurants'] = function(req,res){
			var url_parts = url.parse(req.url, true);
			var name = url_parts.query.name;
			var client = url_parts.query.client;
			var start = url_parts.query.start;
			var location = url_parts.query.loc;
			var collection = self.db.collection('projects');

			collection.insert({
				"Name" : name,
				//"ReportsTo" : reportsTo,
				"Client" : client,
				"Starting Date" : start,
				"Location" : location
			}, function (err, doc) {
				if (err) {
					res.send("There was a problem adding the information to the database.");
				}
				else {
					//res.location("userlist");
					//res.redirect("userlist");
					res.header('Access-Control-Allow-Origin', '*');
					res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
					res.header('Access-Control-Allow-Headers', 'Content-Type');
					res.send('added');
				}
			});
		};
		self.routes['/getRestaurantsByDish'] = function(req,res){
			var url_parts = url.parse(req.url, true);
			//var long = url_parts.query.long;
			//var lat = url_parts.query.lat;
			var dish = url_parts.query.dish;
			var locality = url_parts.query.local;
			//var hit = 'https://api.zomato.com/v1/search.json/near?lat='+lat+'&lon='+long+'&count=50';
			/*request({url:hit,method:'GET',headers:self.headerZomato},function(error,response,body){
				if(!error && response.statusCode == 200)
				{
					console.log(response);
					var rests = JSON.parse(body);
					res.json(rests);
				}
			});*/
			if(locality == 'Nearby')
			{
				self.db.collection('nearby').find().toArray(function (err, items) {
				res.header('Access-Control-Allow-Origin', '*');
				res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
				res.header('Access-Control-Allow-Headers', 'Content-Type');
				//res.json({'restaurants':items});
				var rests = [];
				//console.log(items.length);
				for(var i =0;i<items.length;i++)
				{
					var current = items[i];
					var loc = current['location']['locality'];
					var menu = current['menu'];
					
						for(var j =0;j<menu.length;j++)
						{
							var item = menu[j];
							if(item.search(dish)!=-1)
							{
								rests.push(current);
								break;
							}
						}
					
				}
				//rests = JSON.parse(rests);
				console.log(rests.length);
				res.json({'restaurants':rests});
			});
		}
		else
		{
				
			self.db.collection('restaurants').find().toArray(function (err, items) {
				res.header('Access-Control-Allow-Origin', '*');
				res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
				res.header('Access-Control-Allow-Headers', 'Content-Type');
				//res.json({'restaurants':items});
				var rests = [];
				for(var i =0;i<items.length;i++)
				{
					var current = items[i];
					var loc = current['location']['locality'];
					var menu = current['menu'];
					if(loc == locality)
					{
						for(var j =0;j<menu.length;j++)
						{
							var item = menu[j];
							if(item.search(dish)!=-1)
							{
								rests.push(current);
								break;
							}
						}
					}
				}
				//rests = JSON.parse(rests);
				console.log(rests.length);
				res.json({'restaurants':rests});
			});
		}	
		};
			
		self.routes['/getRestaurantByName'] = function(req,res){
			var url_parts = url.parse(req.url, true);
			var name = url_parts.query.name;
			self.db.collection('restaurants').find({'name':name}).toArray(function (err, items) {
				res.header('Access-Control-Allow-Origin', '*');
				res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
				res.header('Access-Control-Allow-Headers', 'Content-Type');
				res.json({'restaurant':items});
			});
		};
			
    };


    /**
     *  Initialize the server (express) and create the routes and register
     *  the handlers.
     */
    self.initializeServer = function() {
        self.createRoutes();
        self.app = express();
        self.app.use(session({secret: 'ssshhhhh'}));
		self.app.use(express.static(__dirname + '/public'));
		self.app.set('view engine', 'html');
		self.app.set('views', __dirname + '/views'); //optional since express defaults to CWD/views
        //  Add handlers for the app (from the routes).
        for (var r in self.routes) {
            self.app.get(r, self.routes[r]);
        }
    };


    /**
     *  Initializes the sample application.
     */
    self.initialize = function() {
        self.setupVariables();
        self.populateCache();
        self.setupTerminationHandlers();

        // Create the express server and routes.
        self.initializeServer();
    };


    /**
     *  Start the server (starts up the sample application).
     */
    self.start = function() {
        //  Start the app on the specific interface (and port).
        self.app.listen(self.port,self.ipaddress,function() {
            console.log('%s: Node server started on %s:%d ...',
                        Date(Date.now() ), self.ipaddress, self.port);
        });
    };

};   /*  Sample Application.  */



/**
 *  main():  Main code.
 */
var zapp = new SampleApp();
zapp.initialize();
zapp.start();

