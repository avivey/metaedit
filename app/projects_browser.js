
import {log, q, clearElement, mkel} from 'lib/util'
var run = externals.gen_run;
import * as projects from 'app/projects';

export default class {
  constructor(workspace) {
    this.workspace = workspace;
  }

  * updateProjects() {
    var projectList =
      yield* projects.getAllProjects( this.workspace.repository);
    var target = q('project_list');

    clearElement(target);
    for (let name in projectList) {
      let project = projectList[name];

      var li = mkel("li", name, 'link_like');
      li.onclick = () => run(this.workspace.loadProject(project));
      target.appendChild(li);
    }
  }
}
