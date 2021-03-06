/*
 * Game.js
 *
 * A Framework for iPad targetted HTML5 games. Exposes
 * a public interface at window#Game.
 *
 * Author: Ben Gourley - 2012
 *
 * Collaborators:
 *  - Ben Constable (GitHub: BenConstable)
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
  game.init = function (options) {

    stage = $('<div/>')
              .attr('id', 'stage')
              .height(options.height)
              .width(options.width);

    $('body')
      .append(stage)
      .bind('touchmove', function (e) {
        e.preventDefault();
      });
    
    // Deal with orientation
    util.handleOrientation(options.orientation);

    game.emit('ready');

    return game;

  };

  /*
   * Expose canvas width.
   */
  game.width = function() {
    return stage.width();
  };

  /*
   * Expose canvas height.
   */
  game.height = function() {
    return stage.height();
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

    if (previousScene) {
      if (!transition) previousScene.context.remove();
      previousScene.destroy();
    }

    return game;

  };

  /*
   * Binds a callback to a game event
   */
  game.listen = function (event, callback, listener) {
    listeners.push({
      event : event,
      callback : callback,
      obj : listener
    });
    return game;
  };

  /*
   * Remove all events from the event stack that are bound
   * to the given object.
   */
  game.unlisten = function (obj) {

    var newListeners = [];
    listeners.forEach(function (listener) {
      if (typeof obj === 'string') {
        if (obj !== listener.event) {
          newListeners.push(listener);
        }
      }
      else {
        if (obj !== listener.obj) {
          newListeners.push(listener);
        }
      }
    });
    listeners = newListeners;
    return game;

  };

  /*
   * Executes all callbacks listening
   * for the given event
   */
  game.emit = function (event, data) {
    listeners.forEach(function (listener) {
      if (event === listener.event) {
        listener.callback({
          name : event,
          data : data
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


    entity.die = function () {
      Game.unlisten(entity);
      properties.scene.removeEntity(entity, element);
    };
    
    entity.traits = entity.traits || [];

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
   * Make a transition between scenes with the
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
            to.emit('transitionend');
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
      scene.destroy = function () {
        if (destroy) destroy(scene);
        scene.getEntities().forEach(function (entity) {
          entity.die();
        });
        game.unlisten(scene);
      };

      scene.listen = function (event, callback) {
        game.listen('scene-' + name + '.' + event, callback, scene);
        return scene;
      };

      scene.emit = function (event) {
        game.emit('scene-' + name + '.' + event);
        return scene;
      };

      scene.addEntity = function (entity, element) {
        entities.push(entity);
        return scene;
      };

      scene.getEntities = function () {
        return entities;
      };

      scene.removeEntity = function (toRemove, element) {
        entities = entities.filter(function (entity) {
          return entity.id !== toRemove.id;
        });
        element.remove();
        return scene;
      };

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

  /*
   * Handle orientation changes. Binds a function to the
   * `window.orientationchange`, which generates
   * game events depending on the orientationSetting parameter.
   * This can either be `landscape` or `portrait`.
   *
   * Provides some default behaviour in the form of alert boxes
   * when the orientation is changed to an angle which is unsupported.
   * This can be removed by calling game.unlistenEventType on
   * `orientationnotsupported`.
   */
  util.handleOrientation = function (orientationSetting) {
    
    // Emit correct game events when orientation changes
    $(window).bind('orientationchange', function () {

      if (orientationSetting === 'landscape' &&
            (window.orientation === 0 || window.orientation === 180)) {
        game.emit('orientationnotsupported', {
          orientation : window.orientation
        });
      }
      else if (orientationSetting === 'portrait' &&
            (window.orientation === 90 || window.orientation === -90)) {
        game.emit('orientationnotsupported', {
          orientation : window.orientation
        });
      }
      
      game.emit('orientationchange', {
        orientation : window.orientation
      });

    });

    // Setup default behaviour for orientation not supported events
    game.listen('orientationnotsupported', function() {
      alert('return to ' + orientationSetting + ' mode');
    });

  };
  
  /*
   * Load some assets. `progress` is a callback to fire
   * after each asset has loaded. Recieves one value between
   * indicating progress (total assets/assets loaded). `callback`
   * is a function to execute when all assets have been loaded.
   *
   * If a load error occurs (i.e. an asset 404s) this function
   * throws.
   */
  game.assetLoader = function (assets, progress, callback) {

    if (!Array.isArray(assets))
      throw new Error('Asset loader requires an array of assets');

    if (assets.length === 0)
      callback();

    var loader = {};

    var onProgress;

    var loaded = 0,
        total = assets.length;

    assets.forEach(function (asset) {

      if (!/\.(jpg|png|jpeg|gif|svg)$/.test(asset))
        throw new Error('Asset loader currently only supports preloading of images');
        
      var img = new Image();
    
      $(img).bind('load', function () {
        loaded += 1;
        progress(loaded / total);
        if (loaded === assets.length) callback();
      });

      $(img).bind('error', function (e) {
        throw new Error('Failed to load asset `' + asset + '`');
      });

      img.src = asset;

    });

    return game;

  };

  // Expose the game object globally
  window.Game = game;

}());