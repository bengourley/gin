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
 * Create the between-games menu screen
 */

 Game.addScene('game-transition', function (scene, data) {
  scene.context.addClass('game-transition');
  
  // Show score for previous game
  scene.context.append(
    $('<p/>')
      .html('Well done! You scored <strong>' + data.score + '</strong>.')
      .addClass('score')
    );
  
  // Show a button to play the previous game again
  scene.context.append(
    $('<label/>').append(
      $('<button/>')
        .text('Play again')
        .bind('click', function() {
          Game.runScene('soap', 'slideRight');
        })
    )
  );

  // Show a button to go to the tornado scene
  scene.context.append(
    $('<label/>').append(
      $('<button/>')
        .text('Play the next game')
        .bind('click', function() {
          Game.runScene('tornado', 'slideLeft');
        })
    )
  );

 });

/*
 * Create the soap game screen
 */

Game.addScene('soap', function (scene) {
  
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

  var createEnemies = function (scorer) {

    scene.enemyInterval = setInterval(function () {

      var now = Date.now();

      var germ = Game.entity({
        id : 'germ-' + now,
        elementClass : 'germ',
        scene : scene,
        traits : ['collider', 'lifespan', 'animated-sprite']
      });

      germ.life = 30;
      germ.lifespan = 2000;

      germ
        .setPosition({
          x : Math.random() * 748 - 200,
          y : Math.random() * 1004 - 100
        })
        .listen('collision', function (entity) {
          if (entity.id === 'user-controlled-soap-bar') {
            germ.life -= 1;
            if (germ.life === 0) {
              scorer.update(1);
              germ.die();
            }
          }
        })
        .animateSprite({
          frames : 60,
          height: 101,
          fps: 30
        })
        .startLife();
    
    }, 800);
    
  };

  scene.listen('begin', function () {

    // Setup score
    var scorer = Game.entityCreator.createScorer({
      id : 'score',
      scene: scene,
      x : 10,
      y : 10  
    });

    // Setup time limit
    Game.entityCreator.createTimer({
      id : 'game-timer',
      scene : scene,
      x : 730,
      y : 10,
      seconds : 1
    },
      function () {
        Game.runScene('game-transition', 'fade', {
          score : scorer.getScore()
        });
      }
    );

    createEnemies(scorer);

  });

}, function (scene) {
  clearInterval(scene.enemyInterval);
});

/*
 * Create the tornado game screen
 */

Game.addScene('tornado', function (scene) {

  scene.context.addClass('tornado');

  // Create the tornado entity
  scene.tornado = Game.entity({
    id : 'user-controlled-tornado',
    scene : scene,
    traits : ['collider', 'dompuppet', 'followinput']
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

    var createCracks = function(scorer) {

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

                scorer.updateScore(0.25);
                
                // Player wins!
                if (scorer.getScore() >= 100) {
                  Game.runScene('finish', 'fade', {
                    score : scorer.getScore()
                  });  
                }

                if (!(scorer.getScore() % 1)) {
                  scorer.updateDisplay(
                    function(score) {
                      return score + '%';            
                    }
                  );
                }
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
    }

    var createDroplet = function () {
      
      scene.tornado.getPosition();
      
      var drop = Game.entity({
        id : 'moisturiser-' + Date.now(),
        scene : scene,
        traits : ['transition', 'class']
      })
        .setBounds(false, false)
        .setClass('droplet');

      var transition = drop.getTransitionManager();

      tornadoPosition = scene.tornado.getPosition();

      var angle = Math.random() * (2 * Math.PI);

      var deltaX = Math.sin(angle) * 200;
      var deltaY = Math.cos(angle) * 200;
      
      transition
        .start({
          '-webkit-transform' : 'translate3d(' +
            tornadoPosition.x + 'px, ' + tornadoPosition.y + 'px, 0px)'
        })
        .keyframe(900, 'ease-in', {
          '-webkit-transform' : 'translate3d(' +
            (tornadoPosition.x + deltaX / 2) + 'px, ' + (tornadoPosition.y + deltaY / 2) + 'px, 0px)' +
            ' scale(1.5)'
        })
        .keyframe(1400, 'ease-out', {
          '-webkit-transform' : 'translate3d(' +
            (tornadoPosition.x + deltaX) + 'px, ' + (tornadoPosition.y + deltaY) + 'px, 0px)' +
            ' scale(0)'
        })
        .callback(function () {
          drop.die();
        })
        .run();

      scene.moisturiserTimeout = setTimeout(function () {
        createDroplet();
      }, 100 + (Math.random() * 100));

    };

    // Setup score
    var scorer = Game.entityCreator.createScorer({
      id : 'score',
      scene : scene,
      x : 10,
      y : 10
    });

    // Setup time limit
    Game.entityCreator.createTimer({
      id : 'game-timer',
      scene : scene,
      x : 730,
      y : 10,
      seconds : 30
    },
      function () {
        Game.runScene('finish', 'fade', {
          score : scorer.getScore()
        });
      }
    );

    createCracks(scorer);
    createDroplet();

  });

});

/*
 * Show the start screen when ready
 */
Game.listen('ready', function () {

  Game.runScene('start');

});

// Run init method
window.addEventListener('load', function () {
  Game.init({
    height : 1004,
    width : 768
  });
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

