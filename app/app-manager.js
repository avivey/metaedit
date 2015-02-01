/*
 *
 * Services provided to applications:
 * - Projects manager (branches)
 * - Workspace (like git workspace)
 *
 *
 */
import {log, TODO} from 'lib/util';
export default class {
  constructor(main_div, projects, workspace, github) {
    this.__main = main_div;   // TODO maybe move to "globals" instead?
    this.__github = github;
    this.projects = projects;
    this.workspace = workspace;

    this.active_application = null;
    this.applications = [];
  }

  registerApplication(app_object) {
    this.applications.push(app_object);
  }

  * loadApp(app_object, pre_load_action = 'nothing') {
    if (this.active_application)
      yield* this.active_application.destroyApp();
    this.__main.innerHTML = '';

    if (!app_object.bypass_all_app_manager) {
      var info = app_object.applicationInformation;
      var username = yield* this.__github.getUsername();
      var repository = this.__github.loadRepository(
        username + '/' + info.repoName);

      switch (pre_load_action) {
        case 'fork':
          var upstream = info.upstreamOrg + '/' + info.repoName;
          var bug = yield* this.__github.forkRepo(upstream);
          break;

        case 'update':
          var upstream = info.upstreamOrg + '/' + info.repoName;
          var bug = yield* this.__github.updateMaster(repository, upstream);
          break;

        case 'nothing':
        default:
          break;
      }
    }

    this.active_application = app_object;
    yield* app_object.loadApp(this.__main, this);

    if (!app_object.bypass_all_app_manager) {
      // Let the application wire up some hooks before applying changes.
      yield* this.workspace.loadProject(null, repository);
    }
  }

  * isForked(info) {
    var username = yield* this.__github.getUsername();
    return yield* this.__github.doesRepoExist(username + '/' + info.repoName);
  }

  get editor() {
    if (! this.active_application)
      return null;
    return this.active_application.editor;
  }
}
