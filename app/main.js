"use strict";

// TODO just about nothing should actually stay in this file.

import {githubUsername, githubRepoName, githubUpstreamOrg, githubToken} from 'app/config';

var repo = externals.jsgit.connect_to_repo(githubUsername+'/'+githubRepoName, githubToken);

import * as ui_elements from 'app/ui_setup';

import {log} from 'lib/debug';

var run = externals.gen_run

import Github from 'app/github';
var github = new Github(githubToken)

import {ref_to_project_name, getAllProjects} from 'app/projects';
import * as workspace from 'app/workspace';
import * as projects from 'app/projects';
import * as editor from 'app/ckan/editor';

ui_elements.update_branches_button.onclick = function() {
  run(function*() {
    var projectList = yield* projects.getAllProjects(repo);

    var target = ui_elements.branch_list

    target.innerHTML = ''
    for (let name in projectList) {
      let project = projectList[name];

      var li = document.createElement("li");
      li.className = "link_like";
      li.innerHTML = name;
      li.onclick = () => run(workspace.loadProject(project));
      target.appendChild(li);
    }
  })
}

ui_elements.close_active_project_button.onclick = ()=> {
  run(workspace.loadProject(null, repo));
}

ui_elements.commit_button.onclick = function() {
  run(function*() {
    if (!workspace.getActiveProject()) {
      log('curr branch isnt real, not commiting')
      return
    }
    if (!editor.isEditorChanged) {
      log('No changes in editor - not committing');
      return;
    }

    content = yield* editor.getContentAsString()
    github.saveFile(
      workspace.getActiveProject(),
      editor.getActiveFile().path,
      content);

    workspace.loadProject(workspace.getActiveProject());
  })
}

ui_elements.update_master_button.onclick = function() {
  run(function*() {  // moveto github.js
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


workspace.git_workspace_changed_hooks.push(function(head) {
  run(ckanFileBrowser.update(repo, head.commit.tree));
})
workspace.project_loaded_hooks.push(function(project) {
  ui_elements.branch_span.textContent = project ? project.name : 'none';
})


ui_elements.update_branches_button.onclick()
ui_elements.close_active_project_button.onclick()
