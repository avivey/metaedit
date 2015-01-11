/* This is the "Welcome app", which is loaded first.
 *
 * Features:
 * - Login flow
 * - Select app to run
 */


import {log, q, mkel} from 'lib/util';
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
    for (let app of app_manager.applications) {
      var info = app.applicationInformation;

      var img = mkel('img');
      img.src = info.avatar;

      var l2 = mkel('li', 'Update and Launch', 'link_like disabled');
      var l1 = mkel('li', 'Fork and Launch', 'link_like disabled');
      var l3 = mkel('li', 'Launch without updating', 'link_like');

      l3.onclick = () => run(app_manager.loadApp(app));


      var body = mkel(
        'div',
        [
          mkel('h3', info.name),
          info.description,
          mkel('ul', [l1, l2, l3])
        ],
        'body');

      launcher.appendChild(mkel('div', [img, body], 'app_launcher_item'));
    }

    launcher.hidden = false;
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
