(function() {

  var entityCreator = {};

  entityCreator.createScorer = function(properties) {
    
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

    if (properties.before === undefined) {
      properties.before = '';
    }

    if (properties.after === undefined) {
      properties.after = '';
    }

    scorer.text(properties.before + score + properties.after);

    var ui = {};
    
    ui.updateScore = function(add) {
      score += add;
      return ui;
    };

    ui.updateDisplay = function() {
      scorer.text(properties.before + score + properties.after);
      return ui;
    };

    ui.update = function (add) {
      ui.updateScore(add);
      return ui.updateDisplay();
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

      if (properties.before === undefined) {
      properties.before = '';
    }

    if (properties.after === undefined) {
      properties.after = '';
    }

    timer.text(properties.before + seconds + properties.after);

      var timerInterval = setInterval(function () {
        seconds--;
        timer.text(properties.before + seconds + properties.after);
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