// See doc/application.txt for more details about this.
/* TODO
 *
 * Features:
 * -
 * -
 */


import {log, TODO} from 'lib/util'
import {q, mkel} from 'lib/util'

var run = externals.gen_run;

export default class {
  constructor() {
  }

  * loadApp(main_div, app_manager) {
  }

  * destroyApp() {
  }

  applicationInformation = {
    name: "Application Name",
    description: "some generic text describing this feature.",
    avatar: "https://avatars1.githubusercontent.com/u/9023970",
    repoName: 'myrepo',
    upstreamOrg: 'KSP-CKAN',
  }

  get editor() {
    TODO("implement this")
  }
}
var q = document.getElementById.bind(document);
