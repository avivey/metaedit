
import {log, q, mkel} from 'lib/util'

export default class {

  updateProjects() {
    run(function*() {
      var projectList = yield* projects.getAllProjects(repo);

      var target = q('project_list');

      target.innerHTML = ''
      for (let name in projectList) {
        let project = projectList[name];

        var li = mkel("li", name, 'link_like');
        li.onclick = () => run(workspace.loadProject(project));
        target.appendChild(li);
      }
    })
  }
}

