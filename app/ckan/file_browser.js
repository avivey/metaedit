/*

search mods, ignore version
  list versions
    maybe show mode full name
    edit version or copy to new version


*/
"use strict";

import {log} from 'lib/debug';
var run = externals.gen_run;

// maye make this a "constuctor", because it returns an "object"?
// it binds some state to some functions.
// I think i've just re-invented "module".
export function plugInUI( // Maybe provide it with one div and let it make it's own lists, buttons, etc. or have it return the div.
  repository,
  top_level_list, level_2_list,
  load_file_event) {

  function* update(repository, root_hash) {
    var allMods = yield* listAllMods(repository, root_hash);
    var target = top_level_list;

    target.innerHTML = '';
    for (let mod of allMods) {
      let modTreeHash = mod.hash;
      var li = document.createElement("li");
      li.className = "link_like";
      li.innerHTML = mod.name;
      li.onclick = () => run(displayFilesForMod(modTreeHash, mod.path));
      target.appendChild(li);
    }

    backToFileList();
  }


  function* displayFilesForMod(hash, path) {
    const target = level_2_list;
    target.innerHTML = '';

    var li = document.createElement("li");
    li.className = "link_like";
    li.innerHTML = "BACK";
    li.onclick = backToFileList
    target.appendChild(li);

    var files = yield* listFilesForMod(repository, hash, path);
    for (let file of files) {
      li = document.createElement("li");
      li.className = "link_like";
      li.innerHTML = file.name;
      li.onclick = () => load_file_event(file);
      target.appendChild(li);
    }

    target.hidden = false;
    top_level_list.hidden = true;
  }

  function backToFileList() {
    top_level_list.hidden = false;
    level_2_list.hidden = true;
    level_2_list.innerHTML = '';
  }


  return {
    update // TODO updateRoot? also document.
  }
}

var magic_numbers = {
  tree  : parseInt("040000", 8),
  file  : parseInt("100644", 8),
  exec  : parseInt("100755", 8),
  link  : parseInt("120000", 8),
  commit: parseInt("160000", 8),
}

export function* listAllMods(repository, tree_hash) {
  var tree = yield repository.loadAs('tree', tree_hash);
  var allMods = [];
  for (let name in tree) {
    let ob = tree[name];
    if (ob.mode != magic_numbers.tree) continue;

    ob.name = name;
    ob.path = '/'+name;  // TODO fixit
    allMods.push(ob);
  }

  return allMods;
}

export function* listFilesForMod(repository, tree_hash, path) {
  var tree = yield repository.loadAs('tree', tree_hash);
  var files = []
  for (let name in tree) {
    let ob = tree[name];
    ob.path = path + '/' + name;
    ob.name = name;
    files.push(ob);
  }
  return files;
}

