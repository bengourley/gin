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
 * Create the soap game screen
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

    var seconds = 1;

    timer.text(seconds);

    var timerInterval = setInterval(function () {
      seconds--;
      timer.text(seconds);
      if (seconds <= 0) {
        clearInterval(timerInterval);
        Game.runScene('tornado', 'fade', {
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

Game.addScene('tornado', function (scene) {

  scene.context.addClass('tornado');

  // Create the tornado entity
  var tornado = Game.entity({
    id : 'user-controlled-tornado',
    scene : scene,
    traits : ['draggable', 'collider', 'dompuppet']
  }).setPosition({
    y : 800,
    x : 278
  }).puppet($('<div/>').addClass('tornado-graphic'));

  // Append the popover
  scene.context.append(
    $('<div/>')
      .addClass('popover')
      .append(
        $('<p/>')
          .text('Now use the tornado to moisturise the skin')
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
  
  var cracks = [
    { y : 605, x : 432 },
    { y : 482, x : 0 },
    { y : 101, x : 92 },
    { y : 101, x : 540 }
  ];

  scene.listen('begin', function () {

    cracks.forEach(function (c, i) {

      var crack = Game.entity({
        id : 'crack-' + (i + 1),
        scene : scene,
        traits : ['collider', 'opacity']
      })
        .setBounds(0, 0)
        .setPosition({
          y : c.y,
          x : c.x
        }).listen('collision', function (entity) {
          if (entity.id === 'user-controlled-tornado') {
            if (crack.life < 1) {
              crack.life += 0.01;
              crack.setOpacity(crack.life);
            }
          }
        });

      crack.life = 0;
      crack.setOpacity(0);

    });

    var tiles = [];
    for (var i = 0; i < 4; i++) {
      for (var j = 0; j < 4; j++) {
        tiles.push(
          Game.entity({
            id : 'smooth-' + i + '-' + j,
            scene : scene,
            traits : ['collider', 'opacity', 'class']
          })
            .setBounds(-40, -40)
            .setPosition({
              x : (i * 192) - 40,
              y : (j * 256) - 40
            })
            .setClass('smooth-tile')
            .setOpacity(0)
        );
      }
    }

    tiles.forEach(function (tile) {
      tile
        .listen('collision', function (entity) {
          if (entity.id === 'user-controlled-tornado') {
            if (tile.life < 1) {
              tile.life += 0.007;
              tile.setOpacity(tile.life);
            }
          }
        });
        tile.life = 0;
    });

  });

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

