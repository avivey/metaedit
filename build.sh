rm load-nodejs-modules.c.js ext/load-nodejs-modules.min.js
nodejs `which browserify` app/load-nodejs-modules.js --standalone externals -o load-nodejs-modules.c.js
nodejs `which minify` load-nodejs-modules.c.js -o ext/load-nodejs-modules.min.js
rm load-nodejs-modules.c.js
