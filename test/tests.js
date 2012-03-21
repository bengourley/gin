window.addEventListener('load', function () {

  mocha.setup({
    ui: 'bdd',
    globals: ['expect']
  });

  var w = window.parent,
      d = window.parent.document;

  describe('sanity checks', function () {

    it('should populate `window.Gin`', function () {
      expect(w.Gin).to.be.ok();
    });

    it('init should add div#stage to the document', function () {
      w.Gin.init({ height : 1004, width : 768 });
      expect(d.getElementById('stage')).to.be.ok();
    });

  });

  mocha.run();

});