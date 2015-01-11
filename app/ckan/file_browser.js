/*

search mods, ignore version
  list versions
    maybe show mode full name
    edit version or copy to new version
    maybe copy to new undefined version

should maybe know if it's reading master or a project?

*/
"use strict";

import {log, q, clearElement, mkel} from 'lib/util';
var run = externals.gen_run;


// TODO lots of things to fix here...
// maye make this a "constuctor", because it returns an "object"?
// it binds some state to some functions.
// I think i've just re-invented "module".
export function plugInUI( // TODO nothing here is really ok.
  top_level_list, level_2_list,
  load_file_event) {

  function* update(repository, root_hash) {
    var allMods = yield* listAllMods(repository, root_hash);
    var target = top_level_list;

    clearElement(target);
    var frag = document.createDocumentFragment();
    for (let mod of allMods) {
      let modTreeHash = mod.hash;
      var li = mkel('li', mod.name, 'link_like');
      li.onclick = () => {
        run(displayFilesForMod(repository, modTreeHash, mod));
      }
      frag.appendChild(li);
    }
    target.appendChild(frag);

    backToFileList();
  }
  q('back_btn').onclick = backToFileList; // TODO only once.

  function* displayFilesForMod(repository, hash, mod) {
    const target = level_2_list;
    clearElement(target);

    // TODO read one file, get mod name, display that instead.
    q('level_2_title').innerHTML = mod.name;

    var frag = document.createDocumentFragment();
    var files = yield* listFilesForMod(repository, hash, mod.path);
    for (let file of files) {
      var li = mkel('li', version(file.name), 'link_like');
      li.title = file.path;
      li.onclick = () => load_file_event(file);
      frag.appendChild(li);
    }
    target.appendChild(frag);

    q('files_list_2_group').hidden = false;
    top_level_list.hidden = true;
  }

  // this is for "changed files". This file is already evil, so what's one more.
  function displayFromFlatFilesList(target_elment, files) {
    clearElement(target_elment);
    var frag = document.createDocumentFragment();
    for (let file of files) {
      var li = mkel('li', file.name, 'link_like');
      li.title = file.path;
      li.onclick = () => load_file_event(file);
      frag.appendChild(li);
    }
    target_elment.appendChild(frag);
  }

  function backToFileList() {
    top_level_list.hidden = false;
    q('files_list_2_group').hidden = true;
    clearElement(level_2_list);
  }

  return {
    update, // TODO updateRoot? also document.
    displayFromFlatFilesList,
  }
}

var magic_numbers = {
  tree  : parseInt("040000", 8),
  file  : parseInt("100644", 8),
  exec  : parseInt("100755", 8),
  link  : parseInt("120000", 8),
  commit: parseInt("160000", 8),
}

export function* listAllMods(repository, tree_hash, path = '') {
  // TODO most code here should be in workspace or in projets.
  var tree = yield repository.loadAs('tree', tree_hash);
  var allMods = [];
  for (let name in tree) {
    let ob = tree[name];
    if (ob.mode != magic_numbers.tree) continue;

    ob.name = name;
    ob.path = path + name;
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

// Only accept filenames that have exactly one dash in them.
var full_filename_re = /^([^-]*)-([^-]*)\.ckan$/;
function version(filename) {
  var match = filename.match(full_filename_re);
  return match ? match[2] : filename;
}
function mod(filename) {
  var match = filename.match(full_filename_re);
  return match ? match[1] : '';
}
