rm load-nodejs-modules.js load-nodejs-modules.min.js
nodejs `which browserify` app/load-nodejs-modules.js --standalone externals -o load-nodejs-modules.js
nodejs `which minify` load-nodejs-modules.js

