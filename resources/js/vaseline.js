/*
 * Create the start screen
 */

Game.addScene('start', function (scene, data) {
  scene.context.addClass('start');
  scene.context.append(
    $('<label/>').append(
      $('<button/>')
        .text('Play & win')
        .bind('click', function () {
          Game.runScene('soap', 'slideUp');
        })
    )
  );
});

/*
 * Create the finish screen
 */

Game.addScene('finish', function (scene, data) {
  scene.context.addClass('finish');
  scene.context.append(
    $('<p/>')
      .text('Finished! You scored ' + data.score + '. Again?')
      .click(function () {
        Game.runScene('soap', 'slideRight');
      })
  );
});

/*
 * Create the game screen
 */

Game.addScene('soap', function (scene, data) {
  
  scene.context.addClass('soap');
  
  // Create the soap entity
  var soap = Game.entity({
    id : 'user-controlled-soap-bar',
    scene : scene,
    traits : ['draggable', 'collider']
  }).setPosition({
    y : 800,
    x : 278
  });

  // Append the popover
  scene.context.append(
    $('<div/>')
      .addClass('popover')
      .append(
        $('<p/>')
          .text('Use the soap bar to kill the germs')
      )
      .append(
        $('<button/>')
          .text('Start')
          .bind('click', function () {
            $(this).parent().remove();
            scene.emit('begin');
          })
      )
  );

}, function (scene) {

  var createTimer = function (scorer) {

    var timer = Game.entity({
      id : 'game-timer',
      scene : scene,
      traits : ['text', 'position']
    });

    timer.setPosition({
      x : 730,
      y : 10
    });

    var seconds = 30;

    timer.text(seconds);

    var timerInterval = setInterval(function () {
      seconds--;
      timer.text(seconds);
      if (seconds === 0) {
        clearInterval(timerInterval);
        Game.runScene('finish', 'fade', {
          score : scorer.getScore()
        });
      }
    }, 1000);

  };

  var createScorer = function () {

    var scorer = Game.entity({
      id : 'score',
      scene : scene,
      traits : ['text', 'position']
    });

    scorer.setPosition({
      x : 10,
      y : 10
    });

    var score = 0;

    scorer.text(score);

    var ui = {};

    ui.update = function (add) {
      score += add;
      scorer.text(score);
      return ui;
    };

    ui.getScore = function (add) {
      return score;
    };

    return ui;

  };

  var createEnemies = function (scorer) {

    scene.enemyInterval = setInterval(function () {

      var now = Date.now();

      var germ = Game.entity({
        id : 'germ-' + now,
        elementClass : 'germ',
        scene : scene,
        traits : ['collider']
      });

      germ
        .setPosition({
          x : Math.random() * 748 - 100,
          y : Math.random() * 1004 - 200
        })
        .listen('collision', function (entity) {
          if (entity.id === 'user-controlled-soap-bar') {
            germ.life -= 1;
            if (germ.life === 0) {
              scorer.update(1);
              germ.die();
            }
          }
        });
      
      germ.life = 30;

    }, 2000);
    
  };

  scene.listen('begin', function () {

    var scorer = createScorer();
    createTimer(scorer);
    createEnemies(scorer);

  });

}, function (scene) {
  clearInterval(scene.enemyInterval);
});

/*
 * Show the start screen when ready
 */
Game.listen('ready', function () {

  Game.runScene('start');

});

/*
 * Deal with rotation
 */
$(window).bind('orientationchange', function () {
  switch(window.orientation) {
  case 0:
    break;
  case 90:
    alert('return to portrait mode');
    break;
  case -90:
      alert('return to portrait mode');
    break;
  case 180:
    break;
  }
});

