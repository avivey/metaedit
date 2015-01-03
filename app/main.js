

var githubRepoName = "avivey/test-jsgit";

// Your user can generate these manually at https://github.com/settings/tokens/new
// Or you can use an oauth flow to get a token for the user.
var githubToken = "341c2751e26554dcbf44e0995148a4e4177ee07b";


var repo = externals.jsgit.connect_to_repo(githubRepoName, githubToken)

import * as ui_elements from 'app/ui_setup'

function log(something = "foo") {
  console.log(something)
}

ui_elements.update_branches_button.onclick = function() {
  externals.gen_run(function*() {
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
  externals.gen_run(function*() {
    var headHash = yield repo.readRef(branch);
    var commit = yield repo.loadAs("commit", headHash);
    var tree = yield repo.loadAs("tree", commit.tree);
    var entry = tree["README.md"];
    var readme = yield repo.loadAs("text", entry.hash);

    ui_elements.textarea.textContent = readme;
  })
}

