/*
 * Game.js
 *
 * A Framework for iPad targetted HTML5 games. Exposes
 * a public interface at window#Game.
 *
 * Author: Ben Gourley - 2012
 */

(function () {

  // Require zepto
  if (!$)
    throw new Error('Zepto.js is required to run Game.js');

  // Game context
  var game = {};

  // Utils context
  var util = {};

  // Private vars
  var stage,
      scenes = {},
      listeners = [],
      currentScene,
      sceneTransitions = {},
      entityTraits = {};

  /*
   * Initialise the game.
   */
  game.init = function () {
    stage = $('<div/>')
              .attr('id', 'stage')
              .height(1004)
              .width(768);
    $('body')
      .append(stage)
      .bind('touchmove', function (e) {
        e.preventDefault();
      });

    game.emit('ready');
    return game;

  };

  /*
   * Add a scene to the game
   */
  game.addScene = function (name, init, run, destroy) {
    if (scenes[name]) {
      throw new Error('A scene named \'' + name + '\' already exists');
    }
    scenes[name] = util.sceneCreator(name, init, run, destroy);
    return game;
  };

  /*
   * Run a scene
   */
  game.runScene = function (name, transition, data) {

    if (!scenes[name])
      throw new Error('A scene named \'' + name + '\' does not exist');

    // Keep a reference to the previous scene
    var previousScene = currentScene;

    // Store the new current scene
    currentScene = scenes[name](data);

    // Deal with transitions
    if (previousScene && transition) {

      // Make the transition
      util.sceneTransition(previousScene, currentScene, transition);

    } else {
      // No previous scene or no transition specified
      currentScene.context.show();
    }

    if (previousScene && previousScene.destroy) {
      previousScene.destroy(previousScene);
    }

    return game;

  };

  /*
   * Binds a callback to a game event
   */
  game.listen = function (event, callback) {
    listeners.push({
      event : event,
      callback : callback
    });
    return game;
  };

  /*
   * Executes all callbacks listening
   * for the given event
   */
  game.emit = function (event) {
    listeners.forEach(function (listener) {
      if (event === listener.event) {
        listener.callback({
          name : event
        });
      }
    });
    return game;
  };

  /*
   * Creates a game entity. Properties must be an object in
   * the form:
   *
   *    {
   *      id : '' // a unique for the entity's DOM element
   *      scene : // the scene that the entity belongs to
   *      ... plus optional properties
   *    }
   */
  game.entity = function (properties) {
    
    if (!properties || !properties.id || !properties.scene) {
      throw new Error(
        'Entity properties must consist of at least `id` and `scene`'
      );
    }

    // Create the entity object with its properties
    // and create a DOM element for it
    var entity = properties,
        element = $('<div/>')
                    .attr('id', properties.id)
                    .addClass(properties.elementClass || '');

    var appliedTraits = [];
    // Recursively apply trait dependencies
    entity.traits.forEach(function applyTraits(traitName) {
      var trait = util.getEntityTrait(traitName);
      var deps = trait.dependencies || [];
      deps.forEach(function (dep) {
        applyTraits(dep);
      });

      // Check if trait has already been applied
      if (appliedTraits.indexOf(traitName) === -1) {
        util.getEntityTrait(traitName).applyTrait(
          entity,
          element,
          properties.scene.context
        );
        appliedTraits.push(traitName);
      }

    });

    properties.scene.addEntity(entity, element);

    return entity;

  };

  /*
   * Expose `registerSceneTransition()` to Game interface, so
   * transitions can be extended.
   */
  game.registerSceneTransition = function (from, to, transition) {
    util.registerSceneTransition(from, to, transition);
    return game;
  };

  /*
   * Make a transition between scenese with the
   * given options.
   */
  util.sceneTransition = function (from, to, transition) {

    // Get the transition properties
    var transitionProps = util.getSceneTransition(transition);
    
    // Annotate the transitioning elements
    // with the animation properties
    to.transitionProps = transitionProps.to;
    from.transitionProps = transitionProps.from;

    // Animate the `to` element
    to.context
      .css(to.transitionProps.start)
      .animate(
        to.transitionProps.end,
        {
          duration : 300,
          easing : 'ease-in-out',
          complete : function () {
            to.transitionProps.callback &&
              to.transitionProps.callback(from.context, to.context);
            from.context.remove();
          }
        }
      );
    
    // Animate the `from` element
    from.context
      .css(from.transitionProps.start)
      .animate(
        from.transitionProps.end,
        {
          duration : 300,
          easing : 'ease-in-out',
          complete : function () {
            from.transitionProps.callback &&
              from.transitionProps.callback(from.context, to.context);
              from.context.remove();
          }
        }
      );

  };

  /*
   * Registers a scene transition
   */
  util.registerSceneTransition = function (name, transition) {
    sceneTransitions[name] = transition;
  };

  /*
   * Retrieves a scene transition
   */
  util.getSceneTransition = function (name) {
    if (!sceneTransitions[name])
      throw new Error('The transition \'' + name + '\' is not defined');
    return sceneTransitions[name]();
  };

  /*
   * Expose `registerEntityTrait()` to Game interface, so
   * traits can be extended.
   */
  game.registerEntityTrait = function (name, applyTrait, dependencies) {
    util.registerEntityTrait(name, applyTrait, dependencies);
    return game;
  };

  /*
   * Registers an entity trait
   */
  util.registerEntityTrait = function (name, applyTrait, dependencies) {
    entityTraits[name] = {
      applyTrait : applyTrait,
      dependencies : dependencies
    };
  };

  /*
   * Retrieves an entity trait
   */
  util.getEntityTrait = function (name) {
    if (!entityTraits[name])
      throw new Error('The entity trait \'' + name + '\' is not defined');
    return entityTraits[name];
  };

  /*
   * Returns a scene creator
   */
  util.sceneCreator = function (name, init, run, destroy) {

    return function (data) {
      
      var scene = {},
          entities = [];

      scene.name = name;
      scene.destroy = destroy;

      scene.listen = function (event, callback) {
        game.listen('scene-' + name + '.' + event, callback);
      };

      scene.emit = function (event) {
        game.emit('scene-' + name + '.' + event);
      };

      scene.addEntity = function (entity, element) {
        entities.push(entity);
      };

      scene.getEntities = function () {
        return entities;
      };

      // TODO Need a removeEntity method??

      scene.context = $('<div/>')
                        .attr('id', 'scene-' + name)
                        .addClass('scene')
                        .hide();

      stage.append(scene.context);

      init(scene, data);
      if (run) run(scene);

      return scene;

    };

  };

  // Expose the game object globally
  window.Game = game;

  // Run the init method on window#load
  window.addEventListener('load', Game.init);

}());