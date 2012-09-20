
/**
 * Module dependencies.
 */

var express = require('express')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , http_get = require('http-get')
  , routes = require('./routes')
  , other_routes = require('./routes/commentary')
  , show_route = require("./routes/show")
  , path = require('path');


// app config
app.configure(function(){
  app.set('port', process.env.PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});


// Routes
app.get('/', routes.index);
app.get('/show/:match_id', show_route.show);
app.get('/commentary/:match_id', other_routes.commentary);


// start..
server.listen(3000);



// Socket.io
io.configure('development', function(){
  io.set('log level', 1);   
});

io.sockets.on('connection', function(socket) {
  console.log("WebSocket connected - ", socket.id);
});





App = {

  live_matches : [],
  latest_event : {},

  init : function(){
    App.checkForLiveMatches();
    setInterval(App.checkForLiveMatches, 60*60*1000);
    setInterval(App.checkEventForAllMatches, 60 * 1000);
  },


  checkForLiveMatches : function(){
    console.log("Polling for live matches...");

    var options = {
      url: 'http://api.playup.com/sportsdata/sports/1/sport_live',
      headers : {
        "X-PlayUp-API-Key" : "com.playup.web.extensions-rVrrM4ZyIyzx9v"
      }
    };

    http_get.get(options, function (error, result) {

      if (error) {
        console.error(error);

      } else {

        var data = JSON.parse(result.buffer);

        var live_contests = [], competitions = data.items;

        if(competitions) {
          for (var i = 0; i < competitions.length; i++) {
            for (var j = 0; j < competitions[i].items.length; j++) {
                live_contests.push(competitions[i].items[j]);
            };
          };
        }

        App.live_matches = live_contests;
        App.checkEventForAllMatches();
        console.log("live matches - ", App.live_matches.length);
      }
    });
  },


  checkEventForAllMatches : function(){
    console.log("checking events for all matches...")

    App.live_matches.forEach(function(match){
      App.checkForEvent(match[":uid"]);
    });
  },


  checkForEvent : function(match_id){
    console.log("Polling for events...");

    var matchId = match_id;

    var id = match_id.split("-")[1];

    var options = {
      url:  "http://api.playup.com/sportsdata/contests/" + id + "/events",
      headers : {
        "X-PlayUp-API-Key" : "com.playup.web.extensions-rVrrM4ZyIyzx9v"
      }
    };


    console.log("GET", options.url);

    http_get.get(options, function (error, result) {
      if (error) {

        console.error(error);

      } else {

        var data = JSON.parse(result.buffer);
        var lastItemIndex = data.items.length - 1;

        console.log("uid", data.items[lastItemIndex][":uid"]);

        // check for new event
        if( !App.latest_event[match_id] || App.latest_event[match_id][":uid"] != data.items[lastItemIndex][":uid"]){

          // get tts
          App.saveTTS(match_id, data.items[lastItemIndex].long_message, function(result){
            App.emitNotification({ match_id : match_id, "event" : data.items[lastItemIndex] });
          });

          // save
          App.latest_event[match_id] = data.items[lastItemIndex];
        }

      }
    });
  },


  emitNotification : function(data){

    console.log("emitting notification - ", data.match_id);

    for(var key in io.sockets.sockets){
      console.log("emmited to " + key);
      io.sockets.sockets[key].emit("notification", data);
    }

  },




  saveTTS : function(match_id, text, callback){
    console.log("GET TTS", text);

    var matchId = match_id;

    var key = "UQNC8JQUGB67KY5O2YFSIOUHYI3BW2XJGJANA5Y4";
    text = encodeURI(text);
    
    var options = {
      url:  "http://tts.labs.ericsson.net/read?devkey=" + key + "&text=" + text,
    };

    http_get.get(options, "./audio/" + matchId + '.mp3', function (error, result) {
      if (error) {
        console.error(error);
      } else {
        callback(result);
      }
    });

  }

}


App.init();