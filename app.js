
/**
 * Module dependencies.
 */

var app = require('express')()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server)
  , http_get = require('http-get')
  , routes = require('./routes');


// setup caching
var Cache2File = require('cache2file')
  , cachePath = './cache'
  , timeout = 60 * 60 * 1000
  , cache = new Cache2File(cachePath, timeout);


// Routes
app.get('/', routes.index);

app.get('/commentary/:match_id', function(req, res){
  var match_id = req.params.match_id;
  console.log("GET - ", match_id);

  cache.get(match_id, function (err, data) {
    
    if (!err) {
      res.set('Content-Type', 'audio/mpeg');
      res.set("Connection", "close");
      res.set("Content-Description", "File Transfer");
      res.set("Content-Transfer-Encoding", "binary");
      res.set("Pragma","public")
      // res.set("Content-Length", 60000);
      res.send(data);
      // res.send(data);
    }
    else {
      res.send("error");
      // Cache timed out, or removed, so store it again.
    }

  });

});


// start..
server.listen(3000);



// Socket.io
io.sockets.on('connection', function(socket) {
  console.log(socket.id);
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

        // mock /////
        result.buffer = '{":self":"http://staging.sports-api.playupdev.com/sports/1/sport_live",":type":"application/vnd.playup.sport.live+json",":uid":"sport-1-sport_live","live_contests":2,"name":"Cricket","items":[{":self":"http://staging.sports-api.playupdev.com/competitions/95/live",":type":"application/vnd.playup.sport.competition.summary+json",":uid":"competition-95-live","name":"Test Cricket","short_name":"Test Cricket","region":"International","logos":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/league-logos/cricket/competition-95_1333435881_70x70.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/league-logos/cricket/competition-95_1333435881_105x105.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/league-logos/cricket/competition-95_1333435881_140x140.png"}],"items":[{":self":"http://staging.sports-api.playupdev.com/contests/20110159559",":type":"application/vnd.playup.sport.contest.cricket.test+json",":uid":"contest-20110159559","contest_details":{":self":"http://staging.sports-api.playupdev.com/contest_details/20110159559",":type":"application/vnd.playup.sport.contest_detail.cricket.test+json",":uid":"contest_details-20110159559"},"scheduled_start_time":"2012-08-02T10:00:00Z","start_time":"2012-08-02T10:00:00Z","last_modified":"2012-08-05T16:44:06Z","has_live_updates":true,"title":"3rd","short_title":"3","name":"3rd","round_label":"Month","round_name":"AUG","competition_name":"Test Cricket","region":"International","stadium_name":"Headingley","sport_name":"Cricket","events":{":self":"http://staging.sports-api.playupdev.com/contests/20110159559/events",":type":"application/vnd.playup.collection+json",":uid":"contest-20110159559-events"},"ancestors":[{":self":"http://staging.sports-api.playupdev.com/rounds/2182",":type":"application/vnd.playup.sport.round+json",":uid":"round-2182"},{":self":"http://staging.sports-api.playupdev.com/competitions/95",":type":"application/vnd.playup.sport.competition+json",":uid":"competition-95"},{":self":"http://staging.sports-api.playupdev.com/sports/1",":type":"application/vnd.playup.sport.sport.cricket+json",":uid":"sport-1"},{":self":"http://staging.sports-api.playupdev.com/sports",":type":"application/vnd.playup.sport.sports+json",":uid":"sports"}],"associated_contests":{":self":"http://staging.sports-api.playupdev.com/contests/20110159559/associated_contests",":type":"application/vnd.playup.collection+json",":uid":"contest-20110159559-associated_contests"},"scores":[{"total":425,"summary":"425","wickets":10,"team":{":self":"http://staging.sports-api.playupdev.com/teams/13",":type":"application/vnd.playup.sport.team+json",":uid":"team-13","display_name":"England","name":"England","short_name":"ENG","logos":{"header":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_england_eng_1333418053_70x46.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_england_eng_1333418053_105x69.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_england_eng_1333418053_140x92.png"}],"calendar":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_england_eng_1333418053_35x23.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_england_eng_1333418053_53x35.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_england_eng_1333418053_70x46.png"}]}}},{"total":39,"summary":"39/0","wickets":0,"player":{"firstName":"Jacques","lastName":"Rudolph","role":"batsman","stats":"21(53)"},"striker":{"first_name":"Jacques","last_name":"Rudolph","stats":"21(53)"},"non_striker":{"first_name":"Graeme","last_name":"Smith","stats":"17(49)"},"team":{":self":"http://staging.sports-api.playupdev.com/teams/20",":type":"application/vnd.playup.sport.team+json",":uid":"team-20","display_name":"South Africa","name":"South Africa","short_name":"SA","logos":{"header":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_south_africa_sa_1333418063_70x46.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_south_africa_sa_1333418063_105x69.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_south_africa_sa_1333418063_140x92.png"}],"calendar":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_south_africa_sa_1333418063_35x23.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_south_africa_sa_1333418063_53x35.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/cricket/cricket_south_africa_sa_1333418063_70x46.png"}]}}}],"clock":{"overs":"17.0","run_rate":"2.29","last_ball":"0","summary":"Ov:17.0   RR:2.29   LastBall:0","annotation":"Stumps"},"rating":0}]},{":self":"http://staging.sports-api.playupdev.com/competitions/140/live",":type":"application/vnd.playup.sport.competition.summary+json",":uid":"competition-140-live","name":"Clydesdale Bank 40","short_name":"Clydesdale Bank 40","region":"England","logos":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/league-logos/cricket/competition-140_1339465214_70x70.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/league-logos/cricket/competition-140_1339465214_105x105.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/league-logos/cricket/competition-140_1339465214_140x140.png"}],"items":[{":self":"http://staging.sports-api.playupdev.com/contests/20110185872",":type":"application/vnd.playup.sport.contest.cricket+json",":uid":"contest-20110185872","contest_details":{":self":"http://staging.sports-api.playupdev.com/contest_details/20110185872",":type":"application/vnd.playup.sport.contest_detail.cricket+json",":uid":"contest_details-20110185872"},"scheduled_start_time":"2012-08-05T12:45:00Z","start_time":"2012-08-05T12:45:00Z","last_modified":"2012-08-05T20:51:01Z","has_live_updates":false,"title":"Middlesex vs Worcestershire","short_title":"MID vs WOR","round_label":"Week","round_name":"6","competition_name":"Clydesdale Bank 40","region":"England","sport_name":"Cricket","events":{":self":"http://staging.sports-api.playupdev.com/contests/20110185872/events",":type":"application/vnd.playup.collection+json",":uid":"contest-20110185872-events"},"ancestors":[{":self":"http://staging.sports-api.playupdev.com/rounds/4589",":type":"application/vnd.playup.sport.round+json",":uid":"round-4589"},{":self":"http://staging.sports-api.playupdev.com/competitions/140",":type":"application/vnd.playup.sport.competition+json",":uid":"competition-140"},{":self":"http://staging.sports-api.playupdev.com/sports/1",":type":"application/vnd.playup.sport.sport.cricket+json",":uid":"sport-1"},{":self":"http://staging.sports-api.playupdev.com/sports",":type":"application/vnd.playup.sport.sports+json",":uid":"sports"}],"associated_contests":{":self":"http://staging.sports-api.playupdev.com/contests/20110185872/associated_contests",":type":"application/vnd.playup.collection+json",":uid":"contest-20110185872-associated_contests"},"scores":[{"total":0,"summary":"0/0","wickets":0,"team":{":self":"http://staging.sports-api.playupdev.com/teams/12393",":type":"application/vnd.playup.sport.team+json",":uid":"team-12393","display_name":"Middlesex","name":"Middlesex","short_name":"MID","logos":{"header":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/70x46.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/105x69.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/140x92.png"}],"calendar":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/35x23.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/53x35.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/70x46.png"}]}}},{"total":0,"summary":"","wickets":0,"team":{":self":"http://staging.sports-api.playupdev.com/teams/12397",":type":"application/vnd.playup.sport.team+json",":uid":"team-12397","display_name":"Worcestershire","name":"Worcestershire","short_name":"WOR","logos":{"header":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/70x46.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/105x69.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/140x92.png"}],"calendar":[{"density":"low","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/35x23.png"},{"density":"medium","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/53x35.png"},{"density":"high","href":"http://sportsdata-staging.s3.amazonaws.com/team-logos/defaults/70x46.png"}]}}}],"clock":{"overs":"0.0","run_rate":"0.0","last_ball":"0","summary":"Ov:0.0   RR:0.0   LastBall:0"},"rating":0}]}]}';

        var data = JSON.parse(result.buffer);

        var live_contests = [], competitions = data.items;

        if(competitions) {
          for (var i = 0; i < competitions.length; i++) {
            for (var j = 0; j < competitions[i].items.length; j++) {
                live_contests.push(competitions[i].items[j]);
            };
          };
        }

        App.live_sports = live_contests;
        App.checkEventForAllMatches();
        console.log("live matches - ", App.live_sports.length);
      }
    });
  },


  checkEventForAllMatches : function(){
    console.log("checking events for all matches...")
    // hack 
    App.checkForEvent(App.live_sports[0][":uid"]);

    // App.live_sports.forEach(function(match){
    //   App.checkForEvent(match[":uid"]);
    // });
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
          App.getTTS(data.items[lastItemIndex].long_message, function(result){
            // result.code/buffer/headers/url
            // for(var key in result){
            //   console.log(key);
            //   if(key != "buffer")
            //     console.log(result[key]);
            //   else
            //     console.log("length", result[key].length);
            // }

            console.log("headers " , result.headers);

            cache.set(matchId, result.buffer);
            App.emitNotification(match_id);
          });

          // save
          App.latest_event[match_id] = data.items[lastItemIndex];
        }

      }
    });
  },


  emitNotification : function(match_id){

    console.log("emitting notification - ", match_id);

    // console.log(io.sockets.sockets)
    // io.sockets.sockets.forEach(function(socket){
    //   socket.emit(match_id);
    // });

  },


  getTTS : function(text, callback){
    console.log("GET TTS", text);

    var key = "UQNC8JQUGB67KY5O2YFSIOUHYI3BW2XJGJANA5Y4";
    text = encodeURI(text);
    
    var options = {
      url:  "http://tts.labs.ericsson.net/read?devkey=" + key + "&text=" + text,
    };

    http_get.get(options, function (error, result) {
      if (error) {
        console.error(error);
      } else {
        callback(result);
      }
    });

  }

}


// App.init();

// cache.set("sachin", "saluja");

// cache.get("contest-20110159559", function(err, data){

//   if(!err){
//     console.log("cache working");
//     console.log("type", typeof(data));
//   }
//   else {
//     console.log("error", err);
//   }

// });