/*
 * Create the start screen
 */

Game.addScene('start', function (scene, data, run) {
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
    $('<p/>').text('Finished! Again?').click(function () {
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

  var createTimer = function () {

    var timer = Game.entity({
      id : 'game-timer',
      scene : scene,
      traits : ['text', 'position']
    });

    timer.setPosition({
      x : 740,
      y : 10
    });

    var seconds = 60;

    timer.text(seconds);

    var timerInterval = setInterval(function () {
      seconds--;
      timer.text(seconds);
      if (seconds === 0) {
        Game.runScene('finish', 'fade');
        clearInterval(timerInterval);
      }
    }, 1000);

  };

  var createEnemies = function () {

    enemyInterval = setInterval(function () {

      var now = Date.now();

      var germ = Game.entity({
        id : 'germ-' + now,
        elementClass : 'germ',
        scene : scene,
        traits : ['collider']
      });

      germ.setPosition({
        x : Math.random() * 748 - 10,
        y : Math.random() * 1004 - 10
      });


    }, 2000);
    
  };

  scene.listen('begin', function () {

    createTimer();
    createEnemies();

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

