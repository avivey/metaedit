/*
 list changed files in project (integrate with ckan/files_browser)
 commit message box, save changes

 have "open PR" button?

 explore "branch metadata" concept, notes.


 explore way to start change before having project name.
*/

import{log, q, TODO} from 'lib/util'
export default class {
  constructor() {
    this.activeProject = null;
    this._git_head = null;

    this.git_workspace_changed_hooks = {};
    this.project_loaded_hooks = {};
    // TODO add hook for repository actually changing.
  }

  set gitHead(new_head) {
    this._git_head = new_head;
    for (var k in this.git_workspace_changed_hooks)
      this.git_workspace_changed_hooks[k](this.repository, new_head);
  }
  get gitHead() { return this._git_head; }

  * loadProject(project, repository = project.repository) {
    // TODO if unsaved changes - boom
    var ref = project ? project.ref : 'refs/heads/master';
    var hash = yield repository.readRef(ref);
    var commit = yield repository.loadAs("commit", hash);
    this.activeProject = project;
    this.repository = repository;
    this.gitHead = { ref, hash, commit }

    for (var k in this.project_loaded_hooks)
      this.project_loaded_hooks[k](project);
  }

  * saveChanges(editor) {
    if (!editor.isEditorChanged()) {
      log('No changes in editor - not committing');
      return;
    }

    var head = this.gitHead;
    var project = this.activeProject;
    if (!project) {
      var projects = TODO();
      var name = editor.suggestProjectName();
      name = name || prompt("Enter name for new project:");
      if (!name) return;
      var project = projects.createNewProject(repo, name);
    }
    var content = editor.getContentAsString()
    yield* github.saveFile(
      project,
      head,
      editor.getActiveFile().path,
      content);

    yield* this.loadProject(project);
  }
}