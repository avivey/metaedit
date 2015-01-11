"use strict";

// TODO just about nothing should actually stay in this file.

import {githubToken} from 'app/config';

import {log, TODO} from 'lib/util';
import {q, clearElement, mkel} from 'lib/util';

var run = externals.gen_run

import Github from 'app/github';
var github = new Github(githubToken)

import {ref_to_project_name, getAllProjects} from 'app/projects';
import Workspace from 'app/workspace';
import * as projects from 'app/projects';
import ProjectsBrowser from 'app/projects_browser';

var workspace = new Workspace(github);
var projectsBrowser = new ProjectsBrowser(workspace);

q('update_projects_btn').onclick = () => {
  run(projectsBrowser.updateProjects());
}
workspace.git_workspace_changed_hooks['project_browser']= () => {
  // This also updates the projects list whenever we checkout something, but
  // it does so asynchronously.
  run(projectsBrowser.updateProjects());
}


workspace.git_workspace_changed_hooks['changed_files'] = () => {
  // TODO changed_files section needs to be transformed via file_browser.
  run(function*() {
    var files = yield* workspace.listChangedFiles();
    var frag = document.createDocumentFragment();
    for (let file of files) {
      var li = mkel('li', file.name, 'link_like');
      // li.onclick = () => load_file_event(file);
      frag.appendChild(li);
    }
    var target = q('changed_files_list');
    clearElement(target);
    target.appendChild(frag);
  });
}

var tmp= function() {
  run(function*() {
    yield* workspace.saveChanges(editor());
    updateProjects()
  })
}
q('update_master_btn').onclick = function() {
  run(github.updateMaster(TODO()));
}

q('delete_project_btn').onclick = function() {
  run(function*() { // move to projects/projects_browser.
    var project = workspace.activeProject;
    if (project) {
      yield* github.deleteBranch(project);
      updateProjects();
    }
  })
}

import AppManager from 'app/app-manager';
var appManager = new AppManager(q('main_pane'), projects, workspace, github);
function editor() { return appManager.editor; }

import ckanApp from 'app/ckan/application';
appManager.registerApplication(new ckanApp());
appManager.registerApplication(new ckanApp());

import WelcomeApp from 'app/welcome';
run(function*() {
  var welcome = new WelcomeApp();
  yield* appManager.loadApp(welcome);
});
