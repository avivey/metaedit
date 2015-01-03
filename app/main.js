"use strict";

var githubRepoName = "avivey/test-jsgit";

// Your user can generate these manually at https://github.com/settings/tokens/new
// Or you can use an oauth flow to get a token for the user.
var githubToken = "341c2751e26554dcbf44e0995148a4e4177ee07b";


var repo = externals.jsgit.connect_to_repo(githubRepoName, githubToken)

import * as ui_elements from 'app/ui_setup'

function log(something = "foo") {
  console.log(something)
}

var run = externals.gen_run

var HEAD = null

var author_object = { name: "Aviv Eyal", email: 'avivey@gmail.com' }

import {ref_to_project_name} from 'app/projects';

ui_elements.update_branches_button.onclick = function() {
  run(function*() {
    var refs = yield repo.listRefs();
    var target = ui_elements.branch_list

    target.innerHTML = ''
    for (let ref of refs) {
      var project = ref_to_project_name(ref)
      if (!project) continue
      var li = document.createElement("li")
      li.className = "link_like"
      li.innerHTML = project
      li.onclick = () => load_branch(ref)
      target.appendChild(li)
    }
  })
}

var load_branch = function(ref) {
  run(function*() {
    var hash = yield repo.readRef(ref);
    var commit = yield repo.loadAs("commit", hash);
    var tree = yield repo.loadAs("tree", commit.tree);
    var entry = tree["README.md"];
    var readme = yield repo.loadAs("text", entry.hash);

    HEAD = {
      ref,
      hash,
      commit,
    }
    ui_elements.branch_span.textContent = ref;
    ui_elements.textarea.value = readme;
  })
}

ui_elements.commit_button.onclick = function() {
  run(function*() {
    if (!HEAD) {
      log('curr branch isnt real, not commiting')
      return
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
