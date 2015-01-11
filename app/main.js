"use strict";

// TODO just about nothing should actually stay in this file.

import {githubUsername, githubRepoName, githubUpstreamOrg, githubToken} from 'app/config';

var repo = externals.jsgit.connect_to_repo(githubUsername+'/'+githubRepoName, githubToken);

import {log, TODO} from 'lib/util';
import {q, mkel} from 'lib/util';

var run = externals.gen_run

import Github from 'app/github';
var github = new Github(githubToken)

import {ref_to_project_name, getAllProjects} from 'app/projects';
import Workspace from 'app/workspace';
import * as projects from 'app/projects';
import ProjectsBrowser from 'app/projects_browser';

var workspace = new Workspace();
var projectsBrowser = new ProjectsBrowser();

q('update_projects_btn').onclick = () => projectsBrowser.updateProjects()

q('close_active_project_btn').onclick = ()=> {
  run(workspace.loadProject(null, repo));
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
  run(function*() {
    var project = workspace.activeProject;
    if (project) {
      yield* github.deleteBranch(project);
      updateProjects();
    }
  })
}

import { plugInUI as plugInUIckan } from 'app/ckan/file_browser';
var ui_elements = TODO()

var ckanFileBrowser = plugInUIckan(
  repo,

  ui_elements.files_list_1,
  ui_elements.files_list_2,

  file => run(editor().loadNewFile(repo, file))
);


workspace.git_workspace_changed_hooks['main.js'] = function(head) {
  run(ckanFileBrowser.update(repo, head.commit.tree));
};
workspace.project_loaded_hooks['main.js'] = function(project) {
  if (project) {
    ui_elements.branch_span.textContent = project.name;
    ui_elements.commit_button.textContent = 'Save';
  } else {
    ui_elements.branch_span.textContent = 'None';
    ui_elements.commit_button.textContent = 'Save as new project';
  }
};


import AppManager from 'app/app-manager';
var appManager = new AppManager(q('main_pane'), projects, workspace);
function editor() { return appManager.editor; }

import ckanApp from 'app/ckan/application';
appManager.registerApplication(new ckanApp());
appManager.registerApplication(new ckanApp());

import WelcomeApp from 'app/welcome';
run(function*() {
  var welcome = new WelcomeApp();
  yield* appManager.loadApp(welcome);
});


// updateProjects();
// ui_elements.close_active_project_button.onclick()
