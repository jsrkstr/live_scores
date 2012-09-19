
/*
 * GET commentary.
 */

exports.commentary = function(req, res){
  
  var match_id = req.params.match_id;
  console.log("GET - ", match_id);

  res.set('Content-Type', 'audio/mpeg');
  res.set("Connection", "close");
  res.sendfile("./audio/" + match_id + ".mp3");

};