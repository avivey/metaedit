/*
 list changed files in project (integrate with ckan/files_browser)
 commit message box, save changes

 have "open PR" button?

 explore "branch metadata" concept, notes.


 explore way to start change before having project name.
*/

import{log} from 'lib/util'
export default class {
  constructor() {
    this.activeProject = null;
    this._git_head = null;

    this.git_workspace_changed_hooks = [];
    this.project_loaded_hooks = []
  }

  set gitHead(new_head) {
    this._git_head = new_head;
    for (var f of this.git_workspace_changed_hooks)
      f(new_head);
  }
  get gitHead() { return this._git_head; }

  * loadProject(project, repository = project.repository) {
    // TODO if unsaved changes - boom
    var ref = project ? project.ref : 'refs/heads/master';

    var hash = yield repository.readRef(ref);
    var commit = yield repository.loadAs("commit", hash);

    this.activeProject = project;
    this.gitHead = { ref, hash, commit }

   for (var f of this.project_loaded_hooks)
      f(project);
  }
}