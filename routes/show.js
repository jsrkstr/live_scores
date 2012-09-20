
/*
 * GET home page.
 */

exports.show = function(req, res){
	var match_id = req.params.match_id;
	var match = App.live_matches.filter(function(match){
		return match[':uid'] == match_id;
	});
  	res.render('commentary', { title: 'Live Commantary:' + match[0].title , match : match[0] });
};