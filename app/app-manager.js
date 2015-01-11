/*
 *
 * Services provided to applications:
 * - Projects manager (branches)
 * - Workspace (like git workspace)
 *
 *
 */
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

  * loadApp(app_object) {
    if (this.active_application)
      this.active_application.destroyApp();
    this.__main.innerHTML = '';

    if (!app_object.bypass_all_app_manager) {
    // Load repo. TODO
      var username = yield* this.__github.getUsername();
      var repo_name = app_object.applicationInformation.repoName;
      var repository = this.__github.loadRepository(username + '/' + repo_name);
    }

    this.active_application = app_object;
    yield* app_object.loadApp(this.__main, this);

    if (!app_object.bypass_all_app_manager) {
      // Let the application wire up some hooks before applying changes.
      yield* this.workspace.loadProject(null, repository);
    }
  }

  get editor() {
    if (! this.active_application)
      return null;
    return this.active_application.editor;
  }

}
