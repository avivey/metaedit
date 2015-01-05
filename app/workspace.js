/*
 list changed files in project (integrate with ckan/files_browser)
 commit message box, save changes

 have "open PR" button?

 explore "branch metadata" concept, notes.


 explore way to start change before having project name.
*/

var active_project = null;
var git_head = null;

function setGitHead(new_head) {
  git_head = new_head;
  for (var f of git_workspace_changed_hooks)
    f(new_head);
}

export function getActiveProject() {
  return active_project;
}

import{log} from 'lib/debug'
export function* loadProject(project, repository = project.repository) {
  // TODO if unsaved changes - boom
log(git_workspace_changed_hooks)
  var ref = project ? project.ref : 'refs/heads/master';

  var hash = yield repository.readRef(ref);
  var commit = yield repository.loadAs("commit", hash);

  active_project = project;
  setGitHead({
    ref,
    hash,
    commit,
  })

 for (var f of project_loaded_hooks)
    f(project);
}

export var git_workspace_changed_hooks = [];
export var project_loaded_hooks = [];

