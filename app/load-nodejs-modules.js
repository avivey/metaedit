// node.js style export. feed this into browserify --standalone externals
// Note that this file is in ES5, not ES6.


// This provides symbolic names for the octal modes used by git trees.
var modes = require('js-git/lib/modes');

function connect_to_repo(githubRepoName, githubToken) {

  // Create a repo_object by creating a plain object.
  var repo_object = {};

  // Mixin the main library using github to provide the following:
  // - repo_object.loadAs(type, hash) => value
  // - repo_object.saveAs(type, value) => hash
  // - repo_object.readRef(ref) => hash
  // - repo_object.updateRef(ref, hash) => hash
  // - repo_object.createTree(entries) => hash
  // - repo_object.hasHash(hash) => has
  require('js-github/mixins/github-db')(repo_object, githubRepoName, githubToken);

  // This adds a high-level API for creating multiple git objects by path.
  // - createTree(entries) => hash
  require('js-git/mixins/create-tree')(repo_object);

  // // Cache github objects locally in indexeddb
  // require('js-git/mixins/add-cache')(repo_object, require('js-git/mixins/indexed-db'));

  // Cache everything except blobs over 100 bytes in memory.
  // This makes path-to-hash lookup a sync operation in most cases.
  require('js-git/mixins/mem-cache')(repo_object);

  // This provides extra methods for dealing with packfile streams.
  // It depends on
  // - unpack(packStream, opts) => hashes
  // - pack(hashes, opts) => packStream
  // require('js-git/mixins/pack-ops')(repo_object);

  // This adds in walker algorithms for quickly walking history or a tree.
  // - logWalk(ref|hash) => stream<commit>
  // - treeWalk(hash) => stream<object>
  require('js-git/mixins/walkers')(repo_object);

  // This combines parallel requests for the same resource for effeciency under load.
  require('js-git/mixins/read-combiner')(repo_object);

  // This makes the object interface less strict.  See it's docs for details
  require('js-git/mixins/formats')(repo_object);

  return repo_object;
}


externals = {
  jsgit: {
    connect_to_repo: connect_to_repo
  },
  gen_run: require('gen-run'),
  stringify: require('json-stable-stringify'),
}

module.exports = externals
