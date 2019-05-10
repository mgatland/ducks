(function(exports){

//This file contains profanity (swear words).
//I have to include them here so the program can block them in chat.
//Please don't read this if you want to avoid reading offensive words.
















































	//These swears are removed even if they are part of a longer word
	//They should not be part of common English words
	const fragmentSwears = [
		"fag",
		"bitch",
		"cunt",
		"dick", //in a few words
		"fuck",
		"midget",
		"nigg", //in snigger, niggles, etc but worth it!
		"piss", //in a few words
		"pussy", //in pussycat
		"shit", //in mishit
		"tits", //singular 'tit' is very common
	]

	//These swears are only removed if a word on their own
	//i.e. 'ass' is removed but 'assets' is not
	var baseSwears = [
		"ass",
		"cock",
		"suck my balls",
		"suck my dick",
		"suck ur dick",
		"tit",
		"vag"
	];

	var wholeSwears = [];
	baseSwears.forEach(function (swear) {
		wholeSwears.push(swear);
		wholeSwears.push(swear + "s");
		wholeSwears.push(swear + "z");
	});

	var baseFilter = new RegExp("\\b(" + wholeSwears.join("|") + ")\\b", "gi");
	const fragFilter = new RegExp("(" + fragmentSwears.join("|") + ")", "gi");
	exports.filter = function (rawText) {
		return rawText.replace(baseFilter, "***").replace(fragFilter, "***");
	}

})(typeof exports === 'undefined'? this['shared']={}: exports);
