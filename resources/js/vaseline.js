/*
 * Create the start screen
 */

Game.addScene('start', function (scene, data) {
  scene.context.addClass('start');
  scene.context.append(
    $('<label/>').append(
      $('<button/>')
        .addClass('large')
        .text('Cleanse and Nourish to Win')
        .bind('click', function () {
          Game.runScene('soap', 'slideUp');
        })
    )
  );
});

/*
 * Create the between-games menu screen
 */

 Game.addScene('game-transition', function (scene, data) {
  scene.context.addClass('game-transition');
  scene.context.append(
    $('<div/>')
      .addClass('popover popover-light')
      .append(
        $('<p/>')
          .addClass('centered')
          .text('Well done!')
      )
      .append(
        $('<p/>')
          .addClass('centered')
          .html('You scored: <span>' + data.score + '</span>')
      )
      .append(
        $('<p/>')
          .addClass('centered')
          .text('Your skin is cleansed, now it\'s time to nourish it too!')
      )
      .append(
        $('<p/>')
          .addClass('centered big-margin')
          .text('Use the fresh, cleansing effect of Vaseline 2-in-1 to')
      )
  )
  .append(
    $('<div/>')
      .addClass('popover popover-light popover-bottom')
      .append(
        $('<div/>')
          .addClass('controls')
          .append(
            $('<button/>')
              .addClass('large')
              .text('Nourish your skin')
              .bind('click', function() {
                Game.runScene('tornado', 'slideLeft');
              })
          )
      )
  );
 });

/*
 * Create the finish screen
 */

Game.addScene('finish', function (scene, data) {
  scene.context.addClass('finish');
  scene.context.append(
    $('<div/>')
      .addClass('popover popover-light')
      .append(
        $('<p/>')
          .addClass('centered')
          .html('Your final score: <span>' + Math.round(data.score) + '%</span>')
      )
      .append(
        $('<p/>')
          .addClass('centered')
          .text('Well done! You’ve qualified to enter our free competition to win an iPad3')
      )
      .append(
        $('<p/>')
          .addClass('centered small')
          .text('Name: --------------')
      )
      .append(
        $('<p/>')
          .addClass('centered small')
          .text('Cell number: --------------')
      )
      .append(
        $('<p/>')
          .addClass('centered small')
          .text('Email address: --------------')
      )
      .append(
        $('<div/>')
          .addClass('controls')
          .append(
            $('<button/>')
              .addClass('large')
              .text('Vaseline 2-in-1')
              .bind('click', function() {
                Game.runScene('mother', 'fade')
              })
          )
      )
  );
});

/*
 * Create the mother and child screen
 */
Game.addScene('mother', function (scene) {
  scene.context.addClass('mother');
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
      .addClass('popover popover-light')
      .append(
        $('<p/>')
          .addClass('centered')
          .text('Use the Vaseline 2-in-1 soap to cleanse the germs')
      )
      .append(
        $('<div/>')
        .addClass('controls')
        .append(
        $('<button/>')
          .addClass('large')
          .text('Start')
          .bind('click', function () {
            $(this).parent().parent().remove();
            scene.emit('begin');
          })
        )
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
      y : 10,
      before : 'score: '
    });

    // Setup time limit
    Game.entityCreator.createTimer({
      id : 'game-timer',
      scene : scene,
      x : 570,
      y : 10,
      seconds : 20,
      before : 'time: '
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
      .addClass('popover popover-light')
      .append(
        $('<p/>')
          .addClass('centered')
          .text('Use the fresh, cleansing effect of Vaseline 2-in-1 to')
      )
      .append(
        $('<div/>')
          .addClass('controls')
          .append(
            $('<button/>')
              .addClass('large')
              .text('Nourish your Skin')
              .bind('click', function () {
                $(this).parent().parent().remove();
                scene.emit('begin');
            })
        )
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
                  scorer.updateDisplay();
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
      y : 10,
      before : 'score: ',
      after : '%'
    });

    // Setup time limit
    Game.entityCreator.createTimer({
      id : 'game-timer',
      scene : scene,
      x : 570,
      y : 10,
      seconds : 30,
      before : 'time: '
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

// Run init method
window.addEventListener('load', function () {
  Game.init({
    height : 1004,
    width : 768,
    options : 'portrait',
    preload : [
      '/resources/images/germ-sprite.png',
      '/resources/images/cracked-skin.jpg',
      '/resources/images/less-cracked-skin.jpg',
      '/resources/images/smooth-skin.jpg',
      '/resources/images/mother.jpg',
      '/resources/images/soap.png'
    ]
  });
});

/*
 * Show the start screen when ready
 */
Game.listen('ready', function () {
  Game.runScene('start');
});