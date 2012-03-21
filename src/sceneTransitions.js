(function () {

  /*
   * Registers the defualt scene transitions:
   * fade, slideLeft, slideRight, slideUp, slideDown
   */

  Gin.registerSceneTransition('fade', function () {

    var to = {}, from = {};
    to.start = { display : 'block', opacity : 0 };
    to.end = { opacity : 1 };
    return { to : to, from : from };

  });

  Gin.registerSceneTransition('slideLeft', function () {
    
    var to = {}, from = {};

    to.start = {
      display : 'block',
      left : '100%',
      right : 'auto',
      top : 'auto',
      bottom : 'auto'
    };

    from.start = {
      display : 'block',
      left : '0%',
      right : 'auto',
      top : 'auto',
      bottom : 'auto'
    };

    to.end = {
      left : '0%'
    };

    from.end = {
      left : '-100%'
    };

    return { to : to, from : from };

  });

  Gin.registerSceneTransition('slideRight', function () {
    
    var to = {}, from = {};

    to.start = {
      display : 'block',
      right : '100%',
      left : 'auto',
      top : 'auto',
      bottom : 'auto'
    };

    from.start = {
      display : 'block',
      right : '0%',
      left : 'auto',
      top : 'auto',
      bottom : 'auto'
    };

    to.end = {
      right : '0%'
    };

    from.end = {
      right : '-100%'
    };

    return { to : to, from : from };

  });

  Gin.registerSceneTransition('slideUp', function () {
    
    var to = {}, from = {};

    to.start = {
      display : 'block',
      top : '100%',
      left : 'auto',
      right : 'auto',
      bottom : 'auto'
    };

    from.start = {
      display : 'block',
      top : '0%',
      left : 'auto',
      right : 'auto',
      bottom : 'auto'
    };

    to.end = {
      top : '0%'
    };

    from.end = {
      top : '-100%'
    };

    return { to : to, from : from };

  });

  Gin.registerSceneTransition('slideDown', function () {
    
    var to = {}, from = {};

    to.start = {
      display : 'block',
      bottom : '100%',
      left : 'auto',
      right : 'auto',
      top : 'auto'
    };

    from.start = {
      display : 'block',
      bottom : '0%',
      left : 'auto',
      right : 'auto',
      top : 'auto'
    };

    to.end = {
      bottom : '0%'
    };

    from.end = {
      bottom : '-100%'
    };

    return { to : to, from : from };

  });


}());