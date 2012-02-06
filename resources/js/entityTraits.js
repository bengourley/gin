Game.registerEntityTrait('draggable', function (entity, element, context) {

	var trait = {};

	trait.startDrag = function (e) {
    trait.handleOffset = {
      x : e.targetTouches[0].pageX - element.offset().left,
      y : e.targetTouches[0].pageY - element.offset().top
    };
    context.bind('touchmove.soapdrag', trait.updatePosition);
    context.bind('touchend.soapdrag', trait.endDrag);
  };

  trait.endDrag = function (e) {
    context.unbind('touchmove.soapdrag touchend.soapdrag');
  };

  trait.updatePosition = function (e) {

    var x = e.targetTouches[0].pageX - trait.handleOffset.x,
        y = e.targetTouches[0].pageY - trait.handleOffset.y;

    entity.setPosition({
      y : y,
      x : x
    });

  };

  element.bind('touchstart.soapdrag', trait.startDrag);


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
			left : Math.max(10, Math.min(x, 758 - element.width())),
			top : Math.max(10, Math.min(y, 994 - element.height()))
		});
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

	// TODO filter by elements with the collider trait
	console.log(scene.getEntities());

};

Game.registerEntityTrait('collider', function (entity, element, context) {

	var setPosition = entity.setPosition;

	entity.setPosition = function (pos) {
		setPosition(pos);
		detectCollisions(entity.scene);
	};

}, ['position']);
