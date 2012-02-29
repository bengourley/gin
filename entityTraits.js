Game.registerEntityTrait('draggable', function (entity, element, context) {

  var trait = {};

  trait.startDrag = function (e) {

    e.preventDefault();
    trait.handleOffset = {
      x : e.targetTouches ?
            e.targetTouches[0].pageX - element.offset().left :
            e.clientX - element.offset().left,
      y : e.targetTouches ?
            e.targetTouches[0].pageY - element.offset().top :
            e.clientY - element.offset().top
    };
    context.bind('touchmove.drag mousemove.drag', trait.updatePosition);
    context.bind('touchend.drag mouseup.drag', trait.endDrag);
  };

  trait.endDrag = function (e) {
    context.unbind(
      'touchmove.drag touchend.drag mousemove.drag mouseup.drag'
    );
  };

  trait.updatePosition = function (e) {

    var x = e.targetTouches ?
              e.targetTouches[0].pageX - trait.handleOffset.x :
              e.clientX - trait.handleOffset.x,
        y = e.targetTouches ?
              e.targetTouches[0].pageY - trait.handleOffset.y :
              e.clientY - trait.handleOffset.y;

    entity.setPosition({
      y : y,
      x : x
    });

  };

  element.bind('touchstart.drag mousedown.drag', trait.startDrag);

}, ['position']);

Game.registerEntityTrait('text', function (entity, element, context) {
  entity.text = function (text) {
    element.text(text);
  };
});

Game.registerEntityTrait('position', function (entity, element, context) {
  
  var x = 0,
      y = 0,
      bounds = {
        x : 10,
        y : 10
      };

  entity.setPosition = function (pos) {
    x = pos.x || x;
    y = pos.y || y;
    element.css({
      left : 0,
      top : 0,
      '-webkit-transform' : 'translate3d(' +
        (bounds.x || bounds.x === 0
          ? Math.max(bounds.x, Math.min(x, Game.width() - bounds.x - element.width()))
          : x) +
        'px, ' +
        (bounds.y || bounds.y === 0
        ? Math.max(bounds.y, Math.min(y, Game.height() - bounds.y - element.height()))
        : y) +
        'px, 0px)'
    });
    return entity;
  };

  entity.getPosition = function () {
    return {
      x : x,
      y : y
    };
  };

  entity.setBounds = function (x, y) {
    bounds.x = x;
    bounds.y = y;
    return entity;
  };

  element.css({
    position : 'absolute'
  });
  entity.scene.context.append(element);

});

Game.registerEntityTrait('collider', function (entity, element, context) {

  var setPosition = entity.setPosition;
  
  var detectCollisions = function (entity) {

    // Filter out the non colliders and this element
    var colliders = entity.scene.getEntities().filter(function (e) {
      return e.traits.indexOf('collider') !== -1 && entity.id !== e.id;
    });

    colliders.forEach(function (collider) {

      var a1 = collider.getHitArea(),
          a2 = entity.getHitArea();
      
      if (a1.x2 >= a2.x1 && a1.x1 <= a2.x2 &&
              a1.y2 >= a2.y1 && a1.y1 <= a2.y2) {
        Game.emit('collision', {
          entities : { a : collider, b : entity }
        });
      }

    });

  };

  entity.setPosition = function (pos) {
    if (pos) setPosition(pos);
    detectCollisions(entity);
    return entity;
  };

  entity.getHitArea = function () {
    var pos = entity.getPosition();
    return {
      x1 : pos.x,
      x2 : pos.x + element.width(),
      y1 : pos.y,
      y2 : pos.y + element.height()
    };
  };

  var listen = entity.listen;
  entity.listen = function (name, callback) {
    
    var cb = callback;

    if (name === 'collision') {
    
      cb = function (event) {
        if (event.data.entities.a.id === entity.id) {
          callback(event.data.entities.b);
        } else if (event.data.entities.b.id === entity.id) {
          callback(event.data.entities.a);
        }
      };

    }
    
    listen(name, cb);
    return entity;
  };

}, ['position', 'listener']);

Game.registerEntityTrait('listener', function (entity, element, context) {
  
  entity.listen = function (name, callback) {
    Game.listen(name, callback, entity);
  };

});

Game.registerEntityTrait('opacity', function (entity, element, context) {

  var opacity = 1;
  
  entity.setOpacity = function (o) {
    opacity = o;
    element.css({
      opacity : o
    });
    return entity;
  };

  entity.getOpactiy = function () {
    return opacity;
  };

});

Game.registerEntityTrait('class', function (entity, element, context) {
  
  entity.setClass = function (cn) {
    element.addClass(cn);
    return entity;
  };

});

Game.registerEntityTrait('dompuppet', function (entity, element, context) {

  var puppet;
  
  entity.puppet = function (el) {
    puppet = el;
    element.append(puppet);
    return entity;
  };

}, ['position']);

Game.registerEntityTrait('transition', function (entity, element, context) {
  
  entity.getTransitionManager = function () {

    var transition = {},
        start,
        keyframes = [],
        callback;

    transition.start = function (css) {
      start = css;
      return transition;
    };

    transition.callback = function (cb) {
      callback = cb;
      return transition;
    };

    transition.keyframe = function (time, easing, css, cb, start) {
      keyframes.push({
        time : time,
        css : css,
        easing : easing,
        cb : cb,
        start : start
      });
      return transition;
    };

    transition.run = function () {

      element.css(start);

      (function runone (keyframe) {
        
        if (!keyframe) {

          return callback;

        } else {
          
          var after = function () {
            var next = runone(keyframes.shift());
            return function () {
              if (keyframe.cb !== undefined) {
                keyframe.cb();
              }
              next();
            };
          };

          return function () {
            if (keyframe.start !== undefined) {
              keyframe.start();
            }
            element.animate(keyframe.css, keyframe.time, keyframe.easing, after());
          };

        }

      }(keyframes.shift())());

      return transition;

    };

    return transition;

  };

}, ['position']);

Game.registerEntityTrait('velocity', function (entity, element, context) {
  
  var velocity = { x : 0, y : 0 };

  entity.setVelocity = function (vel) {
    velocity = vel;
    return entity;
  };

  entity.changeVelocity = function (delta) {
    velocity.x += delta.x;
    velocity.y += delta.y;
    return entity;
  };

}, ['position']);

Game.registerEntityTrait('lifespan', function (entity, element, context) {
  
  entity.lifespan = 0;

  entity.startLife = function (callback) {
    if (entity.lifespan > 0) {
      setTimeout(function () {
        if (callback !== undefined) {
          callback();
        }
        else {
          entity.die();
        }
      },
      entity.lifespan);
    }
    else {
      throw new Error('An entity\'s life can\'t start without a ' +
                      'lifespan greater than 0!');
    }

    return entity;
  };

});

Game.registerEntityTrait('animated-sprite', function (entity, element, context) {

  var frameTimeout;

  var die = entity.die;

  entity.die = function () {
    clearTimeout(frameTimeout);
    die();
  };
  
  // Run a single frame
  entity.animateSprite = function (animationData) {
      
      // Set initial sprite position
      if (animationData.currentPos === undefined) {
        animationData.currentPos = 0;
        animationData.initialFrames = animationData.frames;
      }

      // Update parameters
      animationData.frames -= 1;
      animationData.currentPos += animationData.height;

      // Update sprite position
      element.css({
        backgroundPosition : '0px -' + animationData.currentPos + 'px'
      });
      
      // If there are still frames left, recurse
      if (animationData.frames > 1) {
        frameTimeout = setTimeout(function () {
          entity.animateSprite(animationData);
        },
        1000 / animationData.fps);
      }
      else if (animationData.repeat) {
        // Reset animation
        animationData.currentPos = 0;
        animationData.frames = animationData.initialFrames;
        
        frameTimeout = setTimeout(function () {
          entity.animateSprite(animationData);
        },
        1000 / animationData.fps);
      }

      return entity;
  };

}, ['position']);


Game.registerEntityTrait('element', function (entity, element, context) {

  entity.getElement = function () {
    return element;
  };

});
