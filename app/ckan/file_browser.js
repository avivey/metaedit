/*

search mods, ignore version
  list versions
    maybe show mode full name
    edit version or copy to new version


*/
"use strict";

export function* listAllMods(repository, tree_hash) {
  var allMods = {};
  var tree = yield repository.loadAs('tree', tree_hash);
  for (let prop in tree) {
    let ob = tree[prop];
      if (ob.mode = 16384) { // I don't know why this is the mode.
        allMods[prop] = ob.hash;
      }
  }

  return allMods;
}


