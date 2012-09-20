
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Live Commantary: Select a live match', matches : App.live_matches });
};