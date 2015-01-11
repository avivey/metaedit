import {log, q, mkel} from 'lib/util';
import * as network from 'lib/network';
import * as file_browser from 'app/ckan/file_browser'; // TODO
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
    q('save_changes').onclick = () => {
      run(app_manager.workspace.saveChanges(this.__editor));
    }

    this.__file_browser = file_browser.plugInUI(
      q('files_list_1'),
      q('files_list_2'),
      file =>
        run(this.editor.loadNewFile(app_manager.workspace.repository, file))
    );

    // TODO these should be somewhere more global
    app_manager.workspace.project_loaded_hooks['ckan'] = (project) => {
      q('current_project').innerHTML = project ? project.name : '<i>none</i>';
    }
    q('close_project').onclick = () => {
      run(app_manager.workspace.loadProject(
        null,
        app_manager.workspace.repository));
    }
    var __file_browser = this.__file_browser;
    app_manager.workspace.git_workspace_changed_hooks['changed_files'] = () => {
      run(function*() {
        var files = yield* app_manager.workspace.listChangedFiles();
        __file_browser.displayFromFlatFilesList(
          q('changed_files_list'),
          files);
      });
    }
    q('make_pr').onclick = () => {
      run(app_manager.workspace.createPullRequst('KSP-CKAN/CKAN-meta'))
    }
  }

  * destroyApp(app_manager) {
    yield* this.__editor.destroy();

    delete app_manager.workspace.git_workspace_changed_hooks['ckan']
    delete app_manager.workspace.git_workspace_changed_hooks['changed_files']
    this.__editor = null;
  }

  get fileBrowser() {
    return this.__file_browser;
  }

  updateFileBrowser(repository, git_head) {
    run(this.__file_browser.update(repository, git_head.commit.tree));
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
