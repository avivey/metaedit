
export default class {
  constructor(div) {
    this.__div = div;
    this.active_application = null;
  }

  * loadApp(app_object) {
    if (this.active_application)
      this.active_application.destroyApp();

    this.active_application = app_object;
    yield* app_object.loadApp(this.__div, this);
  }
}