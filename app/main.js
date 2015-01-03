

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

var current_branch = ''
var last_head = ''
var last_tree = ''

var author_object = { name: "Aviv Eyal", email: 'avivey@gmail.com' }


ui_elements.update_branches_button.onclick = function() {
  run(function*() {
    var refs = yield repo.listRefs('heads/test');
    var target = ui_elements.branch_list

    target.innerHTML = ''
    for (let ref of refs) {
      var li = document.createElement("li")
      li.className = "link_like"
      li.innerHTML = ref
      li.onclick = () => load_branch(ref)
      target.appendChild(li)
    }
  })
}

var load_branch = function(branch) {
  run(function*() {
    var headHash = yield repo.readRef(branch);
    var commit = yield repo.loadAs("commit", headHash);
    var tree = yield repo.loadAs("tree", commit.tree);
    var entry = tree["README.md"];
    var readme = yield repo.loadAs("text", entry.hash);

    current_branch = branch;
    last_head = headHash
    last_tree = commit.tree
    ui_elements.branch_span.textContent = branch;
    ui_elements.textarea.value = readme;
  })
}

ui_elements.commit_button.onclick = function() {
  run(function*() {
    const save_to = current_branch
    if (!(/^refs\//).test(save_to)) {
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
    update.base = last_tree

    var treeHash = yield repo.createTree(update)

    var commitHash = yield repo.saveAs(
      "commit",
      {
        tree: treeHash,
        parent: last_head,
        author: author_object,
        message: "automatic save"
      }
    );

    yield repo.updateRef(save_to, commitHash)
    load_branch(save_to)
  })
}
