/* This is the "Welcome app", which is loaded first.
 *
 * Features:
 * - Login flow
 * - Select app to run
 */


import {log} from 'lib/debug'
import * as network from 'lib/network';
import { getToken } from 'app/github';

var run = externals.gen_run;

export default class {
  constructor() {
  }

  * loadApp(target_div, app_manager) {
    var fragment = yield network.request('app/welcome.f.html');
    target_div.innerHTML = fragment;
    this.app_manager = app_manager;

    var logged_in = !!localStorage.metaedit_github_token
    q('login_state').textContent = logged_in ?
        'Logged in!' : 'Not logged in';

    if (! logged_in) {
      q('login_form').hidden = false;
    } else {
      q('logout_form').hidden = false;
      q('app_launcher').hidden = false;
    }

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

  }

}
var q = document.getElementById.bind(document);
