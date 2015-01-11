/*
 list changed files in project (integrate with ckan/files_browser)
 commit message box, save changes

 have "open PR" button?

 explore "branch metadata" concept, notes.


 explore way to start change before having project name.
*/

import {log, q, TODO} from 'lib/util'
import * as projects from 'app/projects'; // TODO

export default class {
  constructor(github) {
    this.activeProject = null;
    this.__git_head = null;
    this.__github = github;

    this.git_workspace_changed_hooks = {};
    this.project_loaded_hooks = {};
    this.git_repository_changed_hooks = {};
  }

  set gitHead(new_head) {
    this.__git_head = new_head;
    invokeHooks(this.git_workspace_changed_hooks, this.repository, new_head);
  }
  get gitHead() { return this.__git_head; }

  set repository(repository) {
    if (this.__repository == repository)
      return;
    this.__repository = repository;
    invokeHooks(this.git_repository_changed_hooks, repository);
  }
  get repository() { return this.__repository; }

  * loadProject(project, repository = project.repository) {
    // TODO if unsaved changes - boom
    var ref = project ? project.ref : 'refs/heads/master';
    this.activeProject = project;
    this.repository = repository;
    this.gitHead = yield* this.__readRef(repository, ref)

    invokeHooks(this.project_loaded_hooks, project);
  }

  * __readRef(repository, ref) {
    var hash = yield repository.readRef(ref);
    var commit = yield repository.loadAs("commit", hash);
    return {ref, hash, commit};
  }

  // git diff --name-only HEAD master
  * listChangedFiles() {
    if (!this.activeProject) return [];

    var diff = yield* this.__github.compareBranches(
      this.repository,
      'master',
      this.activeProject.ref)
    return diff.files.map(file => {
      return {
        path: file.filename,
        name: file.filename,
      }
    });
  }

  * saveChanges(editor) {
    if (!editor.isEditorChanged()) {
      log('No changes in editor - not committing');
      return;
    }

    var head = this.gitHead;
    var project = this.activeProject;
    if (!project) {
      var name = editor.suggestProjectName();
      name = name || prompt("Enter name for new project:");
      if (!name) return;
      project = projects.createNewProject(this.repository, name);
      head = yield* this.__readRef(this.repository, 'refs/heads/master');
    }
    var content = editor.getContentAsString()
    yield* this.__github.saveFile(
      project,
      head,
      editor.activeFile.path,
      content);

    yield* this.loadProject(project);
  }
}

function invokeHooks(hookMap, ...args) {
  for (var k in hookMap)
    hookMap[k](...args);
}
