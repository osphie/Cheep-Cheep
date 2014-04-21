//dependencies for each module used
var express = require('express');
var http = require('http');
var path = require('path');
var handlebars = require('express3-handlebars');
var app = express();

var dotenv = require('dotenv');
dotenv.load();

//fb graph
var graph = require('fbgraph')
var conf = {
	client_id: process.env.facebook_client_id,
	client_secret: process.env.facebook_client_secret,
	scope: 'email',
	redirect_uri: 'http://localhost:3000/auth/facebook'
};

//twit. whenever I make a new var something = require, that means I have to add it into my package.json as well
//the things following, are just inputting the .env keys stuff

var Twit = require('twit')
var T = new Twit({
	consumer_key: process.env.twitter_client_id,
	consumer_secret: process.env.twitter_client_secret,
	access_token: process.env.twitter_access_token,
	access_token_secret: process.env.twitter_access_secret
});


//route files to load
var index = require('./routes/index');

//database setup - uncomment to set up your database
//var mongoose = require('mongoose');
//mongoose.connect(process.env.MONGOHQ_URL || 'mongodb://localhost/DATABASE1);

//Configures the Template engine
app.engine('handlebars', handlebars());
app.set('view engine', 'handlebars');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.bodyParser());

//routes
app.get('/', function(req, res) {
	res.render('index');
});

//twitter route

app.get('/auth/twitter', function(req, res){

	T.get ('followers/list', function(err, reply){
		console.log (err);
		var data = {};
		//console.log (reply);
		data.followerlist = {twitdata: reply};
		T.get ('statuses/user_timeline', function(erro, response){
			console.log (erro);
			//console.log (response);
			data.status = {twitdata: response};
			console.log(data.status.twitdata);
			res.render ("index", data);
		})
	})






});


//facebook route

app.get('/auth/facebook', function(req, res) {

  // we don't have a code yet
  // so we'll redirect to the oauth dialog
  if (!req.query.code) {
  	var authUrl = graph.getOauthUrl({
  		"client_id":     conf.client_id
  		, "redirect_uri":  conf.redirect_uri
  		, "scope":         conf.scope
  	});

    if (!req.query.error) { //checks whether a user denied the app facebook login/permissions
    	res.redirect(authUrl);
    } else {  //req.query.error == 'access_denied'
    res.send('access denied');
}
return;
}

  // code is set
  // we'll send that and get the access token
  graph.authorize({
  	"client_id":      conf.client_id
  	, "redirect_uri":   conf.redirect_uri
  	, "client_secret":  conf.client_secret
  	, "code":           req.query.code
  }, function (err, facebookRes) {
  	res.redirect('/UserHasLoggedIn');
  });


});


// user gets sent here after being authorized
app.get('/UserHasLoggedIn', function(req, res) {

	graph.get("me", function(err, response) {
 	 console.log(response); // { id: '4', name: 'Mark Zuckerberg'... }

//json object is data, it contains an object called fbdata whichis response

data = {fbdata: response}
res.render("facebook", data);
});
});



//set environment ports and start application
app.set('port', process.env.PORT || 3000);
http.createServer(app).listen(app.get('port'), function(){
	console.log('Express server listening on port ' + app.get('port'));
});









