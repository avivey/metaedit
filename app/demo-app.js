import {log, q, mkel} from 'lib/util';
import * as network from 'lib/network';
import * as file_browser from 'app/ckan/file_browser'; // TODO
import Editor from 'app/ckan/editor';
var run = externals.gen_run;

export default class {
  constructor() {
  }

  * loadApp(main_div, app_manager) {
    yield TODO('demo app, not real');
  }

  * destroyApp(app_manager) {
    yield;
  }

  get fileBrowser() {
    return null;
  }

  updateFileBrowser(repository, git_head) {
  }

  get editor() {
    return null;
  }

  get applicationInformation() {
    return {
      name: "demo app",
      description: "demo application for integration testing.",
      avatar: "https://avatars1.githubusercontent.com/u/9023970",
      repoName: 'brhams',
      upstreamOrg: 'avivey',
    };
  }
}
