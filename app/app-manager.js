/*
 *
 * Services provided to applications:
 * - Projects manager (branches)
 * - Workspace (like git workspace)
 *
 *
 */
export default class {
  constructor(main_div, projects, workspace) {
    this.__main = main_div;   // TODO maybe move to "globals" instead?
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
    this.__main.innerHTML = ''

    this.active_application = app_object;
    yield* app_object.loadApp(this.__main, this);
  }

  get editor() {
    if (! this.active_application)
      return null;
    return this.active_application.editor;
  }

}
