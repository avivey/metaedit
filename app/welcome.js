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

    q('login_state').textContent =
      localStorage.metaedit_github_token ?
        'Logged in!' : 'Not logged in';

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
