/* This is the "Welcome app", which is loaded first.
 *
 * Features:
 * - Login flow
 * - Select app to run
 */


import {log, TODO} from 'lib/util';
import {q, mkel} from 'lib/util';
import * as network from 'lib/network';
import { getToken } from 'app/github';

var run = externals.gen_run;

export default class {
  constructor() {
  }

  * loadApp(target_div, app_manager) {
    this.app_manager = app_manager;
    var fragment = yield network.request('app/welcome.f.html');
    target_div.innerHTML = fragment;
    q('hostname').textContent = location.protocol + '//' + location.host;

    var logged_in = !!localStorage.metaedit_github_token
    q('login_state').textContent = logged_in ?
        'Logged in!' : 'Not logged in';

    q('navigation_bar').hidden = true;
    if (! logged_in) {
      q('login_form').hidden = false;
      yield* this.render_login();
    } else {
      q('logout_form').hidden = false;
      yield* this.render_menu(target_div, app_manager);
    }
  }

  * render_menu(target_div, app_manager) {
    var launcher = q('app_launcher');
    launcher.innerHTML = '<h2>Select Application:</h2>'
    for (var app of app_manager.applications) {
      launcher.appendChild(yield* this.render_app_item(app, app_manager));
    }

    launcher.hidden = false;
  }

  * render_app_item(app, app_manager) {
    var info = app.applicationInformation;

    var img = mkel('img');
    img.src = info.avatar;

    var fork = mkel('li', 'Fork and Launch', 'link_like disabled');
    var update = mkel('li', 'Update and Launch', 'link_like disabled');
    var launch = mkel('li', 'Launch without updating', 'link_like disabled');

    var forked = yield* app_manager.isForked(app);
    if (forked) {
      update.onclick = () => run(TODO(app_manager.loadApp(app)));
      update.classList.remove('disabled');
      launch.onclick = () => run(app_manager.loadApp(app));
      launch.classList.remove('disabled');
    } else {
      fork.onclick = () => TODO();
      fork.classList.remove('disabled');
    }

    var body = mkel(
      'div',
      [
        mkel('h3', info.name),
        info.description,
        mkel('ul', [fork, update, launch])
      ],
      'body');

    return mkel('div', [img, body], 'app_launcher_item');
  }


  * render_login() {
    q('github_login').onclick = ()=>
      run(function*() {
        var u = q('w_username').value;
        var p = q('w_password').value;
        var token = yield* getToken(u, p);
        localStorage.metaedit_github_token = token;
        location.reload(false);
      });
  }


  * destroyApp() {
    q('navigation_bar').hidden = false;
  }

  get editor() { return TODO(); }
  get bypass_all_app_manager() { return true; }
}
