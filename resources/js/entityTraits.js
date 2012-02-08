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
        y = 0;

    entity.setPosition = function (pos) {
      x = pos.x || x;
      y = pos.y || y;
      element.css({
        left : 0,
        top : 0,
        '-webkit-transform' : 'translate3d(' +
          Math.max(10, Math.min(x, 758 - element.width())) +
          'px, ' +
          Math.max(10, Math.min(y, 994 - element.height())) +
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

    entity.scene.context.append(element);

  });


  var detectCollisions = function (scene) {

    var colliders = scene.getEntities().filter(function (entity) {
      return entity.traits.indexOf('collider') !== -1;
    });

    var a1, a2;
    for (var i = 0; i < colliders.length - 1; i++) {
      for (var j = i + 1; j < colliders.length; j++){
        
        a1 = colliders[i].getHitArea();
        a2 = colliders[j].getHitArea();

        if (a1.x2 >= a2.x1 && a1.x1 <= a2.x2 &&
              a1.y2 >= a2.y1 && a1.y1 <= a2.y2) {
          Game.emit('collision', {
            entities : { a : colliders[i], b : colliders[j] }
          });
        }

      }
    }

  };

  Game.registerEntityTrait('collider', function (entity, element, context) {

    var setPosition = entity.setPosition;

    entity.setPosition = function (pos) {
      setPosition(pos);
      detectCollisions(entity.scene);
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
          console.log(event);
          if (event.data.entities.a === entity) {
            callback(event.data.entities.b);
          } else if (event.data.entities.b === entity) {
            callback(event.data.entities.a);
          }
        };

      }
      
      listen(name, cb);

    };

  }, ['position', 'listener']);

  Game.registerEntityTrait('listener', function (entity, element, context){
    
    entity.listen = function (name, callback) {
      Game.listen(name, callback, entity);
    };

  });

}());
