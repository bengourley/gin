(function() {

	var entityCreator = {};

	entityCreator.createScorer = function(properties) {
		
		console.log("helloo");

		var scorer = Game.entity({
			id : properties.id,
			scene: properties.scene,
			traits: ['text', 'position']
		});

		scorer.setPosition({
			x : properties.x,
			y : properties.y
		});

		var score = 0;

		scorer.text(score);

		var ui = {};

		ui.update = function (add) {
			console.log("Score: " + score);
    		score += add;
      		scorer.text(score);
      		return ui;
    	};

    	ui.getScore = function (add) {
      		return score;
    	};

    	return ui;
	};

	entityCreator.createTimer = function(properties, callback) {
		
		var timer = Game.entity({
	    	id : properties.id,
	    	scene : properties.scene,
	    	traits : ['text', 'position']
	    });

	    timer.setPosition({
	    	x : properties.x,
	    	y : properties.y
	    });

	    var seconds = properties.seconds;

	    timer.text(seconds);

	    var timerInterval = setInterval(function () {
	    	seconds--;
	    	timer.text(seconds);
	    	if (seconds <= 0) {
	    		clearInterval(timerInterval);
	    		if (callback !== undefined) {
	    			callback();
		    	}
	      	}
	    }, 1000);
	};

	Game.entityCreator = entityCreator;

}());