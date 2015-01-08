
export default class {
  constructor(main_div, navbar_div) {
    this.__main = main_div;
    this.__navbar = navbar_div;
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
    this.__navbar.innerHTML = ''

    this.active_application = app_object;
    yield* app_object.loadApp(this.__main, this.__navbar, this);
  }
}
