(function(exports){

//This file contains profanity (swear words).
//I have to include them here so the program can block them in chat.
//Please don't read this if you want to avoid reading offensive words.



















































	var baseSwears = [
		"ass",
		"asshole",
		"cock",
		"cunt",
		"dick", /*could be someone's name though*/
		"fag",
		"faggot",
		"fuck",
		"fucked",
		"fucker",
		"fucking",
		"midget",
		"motherfucker",
		"piss",
		"pussy",
		"shit",
		"suck my balls",
		"suck my dick",
		"suck ur dick",
		"tits",
		"vag"
	];

	var swears = [];
	baseSwears.forEach(function (swear) {
		swears.push(swear);
		swears.push(swear + "s");
		swears.push(swear + "z");
	});

	var filter = new RegExp("\\b(" + swears.join("|") + ")\\b", "gi");
	exports.filter = function (rawText) {
		return rawText.replace(filter, "***");
	}

})(typeof exports === 'undefined'? this['shared']={}: exports);
