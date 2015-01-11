/* TODO
 *
 * Features:
 * -
 * -
 */


import {log, q, mkel} from 'lib/util';
import * as network from 'lib/network';
import Editor from 'app/ckan/editor';
var run = externals.gen_run;

export default class {
  constructor() {
  }

  * loadApp(main_div, app_manager) {
    var [main, nav] = yield [
      network.request('app/ckan/main.f.html'),
      network.request('app/ckan/navigation.f.html'),
    ];
    main_div.innerHTML = main;
    q('file_browser').innerHTML = nav;

    app_manager.workspace.git_workspace_changed_hooks['ckan'] =
      this.updateFileBrowser.bind(this);

    this.__editor = new Editor();
  }

  * destroyApp(app_manager) {
    yield* this.__editor.destroy();

    delete app_manager.workspace.git_workspace_changed_hooks['ckan']
    this.__editor = null;
  }

  get fileBrowser() {
    // TODO
  }

  updateFileBrowser() {
    // TDOO
  }

  get editor() {
    return this.__editor;
  }

  get applicationInformation() {
    return {
      name: "KSP-CKAN/CKAN-meta",
      description: "some generic text describing this feature.",
      avatar: "https://avatars1.githubusercontent.com/u/9023970",
      repoName: 'CKAN-meta',
      upstreamOrg: 'KSP-CKAN',
    }
  }
}

// var branch_list = q('project_list');
// var update_branches_button = q('update_branches');

// var files_list_1 = q('files_list_1');
// var files_list_2 = q('files_list_2');

// var json_editor = q('json_editor');
// var branch_span = q('current_branch');
// var commit_button = q('save_changes');
// var changes_marker_span = q('changes_marker');

// var update_master_button = q('update_master');
// var delete_project_button = q('delete_project');
// var close_active_project_button = q('close_active_project');


