(function () {

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
      context.bind('touchmove.soapdrag mousemove.soapdrag', trait.updatePosition);
      context.bind('touchend.soapdrag mouseup.soapdrag', trait.endDrag);
    };

    trait.endDrag = function (e) {
      context.unbind(
        'touchmove.soapdrag touchend.soapdrag mousemove.soapdrag mouseup.soapdrag'
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

    element.bind('touchstart.soapdrag mousedown.soapdrag', trait.startDrag);


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
          Math.max(bounds.x, Math.min(x, 768 - bounds.x - element.width())) +
          'px, ' +
          Math.max(bounds.y, Math.min(y, 1004 - bounds.y - element.height())) +
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

  Game.registerEntityTrait('collider', function (entity, element, context) {

    var setPosition = entity.setPosition;

    entity.setPosition = function (pos) {
      setPosition(pos);
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
    };

  }, ['position']);

}());
