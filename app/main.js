"use strict";

// TODO just about nothing should actually stay in this file.

import {githubUsername, githubRepoName, githubUpstreamOrg, githubToken} from 'app/config';

var repo = externals.jsgit.connect_to_repo(githubUsername+'/'+githubRepoName, githubToken);

import * as ui_elements from 'app/ui_setup';

import {log} from 'lib/debug';

var run = externals.gen_run

var HEAD = null // This object is evil and ugly. kill it.
var MASTER = null // this one is also bad.

import * as github from 'app/github';

import {ref_to_project_name} from 'app/projects';
import * as editor from 'app/ckan/editor';

ui_elements.update_branches_button.onclick = function() {
  run(function*() {
    var refs = yield repo.listRefs();
    var target = ui_elements.branch_list

    target.innerHTML = ''
    for (let ref of refs) {
      var project = ref_to_project_name(ref);
      if (!project) continue;
      var li = document.createElement("li");
      li.className = "link_like";
      li.innerHTML = project;
      li.onclick = () => load_branch(ref);
      target.appendChild(li);
    }
  })
}

var load_branch = function(ref) {
  run(function*() {
    var hash = yield repo.readRef(ref);
    var commit = yield repo.loadAs("commit", hash);
    var tree = yield repo.loadAs("tree", commit.tree);
    var entry = tree["README.md"];

    yield* editor.loadNewFile(repo, {hash: entry.hash});

    HEAD = {
      ref,
      hash,
      commit,
    }
    ui_elements.branch_span.textContent = ref;

    on_project_loaded();
  })
}


function* readMaster() {
  var ref = 'refs/heads/master';
  var hash = yield repo.readRef(ref);
  var commit = yield repo.loadAs("commit", hash);
  var tree = yield repo.loadAs("tree", commit.tree);
  var entry = tree["README.md"];
  yield* editor.loadNewFile(repo, {hash: entry.hash});

  MASTER = {
    ref,
    hash,
    commit,
  }
  HEAD = null;
  ui_elements.branch_span.textContent = 'none';

  yield* ckanFileBrowser.update(repo, MASTER.commit.tree)
}
ui_elements.close_active_project_button.onclick = ()=>run(readMaster);






var author_object = run(github.getAuthorInformation)
ui_elements.commit_button.onclick = function() {
  run(function*() {
    if (!HEAD) {
      log('curr branch isnt real, not commiting')
      return
    }
    if (!editor_changed) {
      log('No changes in editor - not committing');
      return;
    }

    var update = [
      {
        path: 'README.md',
        mode: '100644',
        content: ui_elements.textarea.value
      }
    ]
    update.base = HEAD.commit.tree

    var treeHash = yield repo.createTree(update)

    var commitHash = yield repo.saveAs(
      "commit",
      {
        tree: treeHash,
        parent: HEAD.hash,
        author: author_object,
        message: "automatic save"
      }
    );

    yield repo.updateRef(HEAD.ref, commitHash)
    load_branch(HEAD.ref)
  })
}

ui_elements.update_master_button.onclick = function() {
  run(function*() {
    var upstream = externals.jsgit.connect_to_repo(
      githubUpstreamOrg+'/'+githubRepoName,
      githubToken);

    var upstreamHash = yield upstream.readRef('refs/heads/master');
    yield repo.updateRef('refs/heads/master', upstreamHash);
  });
}

import { plugInUI as plugInUIckan } from 'app/ckan/file_browser';

function TODO(a=undefined) {}

var ckanFileBrowser = plugInUIckan(
  repo,

  ui_elements.files_list_1,
  ui_elements.files_list_2,

  file => run(editor.loadNewFile(repo, file))
);

ui_elements.update_files_button.onclick = ()=> run(ckanFileBrowser.update(repo, HEAD.commit.tree));

function on_project_loaded() {
  ui_elements.update_files_button.onclick()
}
ui_elements.update_branches_button.onclick()
ui_elements.close_active_project_button.onclick()
