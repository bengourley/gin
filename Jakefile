desc('Concats and minfies source files');
task('build', function() {

  var fs = require('fs'),
      uglify = require('uglify-js');

  var jsp = uglify.parser;
  var pro = uglify.uglify;

  console.log('Removing old build');
  try {
    fs.unlinkSync(__dirname + '/gin.js');
    fs.unlinkSync(__dirname + '/gin.min.js');
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    console.log('(Old build didn\'t exist)');
  }

  console.log('Concatenating source files')
  var src = fs.readFileSync(__dirname + '/vendor/zepto.modified.js');
  src += fs.readFileSync(__dirname + '/src/core.js');
  src += fs.readFileSync(__dirname + '/src/entityCreator.js');
  src += fs.readFileSync(__dirname + '/src/entityTraits.js');
  src += fs.readFileSync(__dirname + '/src/sceneTransitions.js');

  console.log('Writing raw source file');
  fs.writeFileSync(__dirname + '/gin.js', src);

  console.log('Writing minified source file');
  var ast = jsp.parse(src);
  ast = pro.ast_mangle(ast);
  ast = pro.ast_squeeze(ast);
  var final_code = pro.gen_code(ast);
  fs.writeFileSync(__dirname + '/gin.min.js', final_code);

}, { async : true });