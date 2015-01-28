/* Functions to interact with GitHub. Gen-run friendly.
 *
 */
import {log, TODO} from 'lib/util';
import * as network from 'lib/network';

import { githubApiRoot } from 'app/config';

import { githubClientId, githubClientSecret } from 'app/config';
export function* getToken(username, password) {
  var body = {
    note: 'metaedit app',
    node_url: 'https://github.com/avivey/metaedit',
    scopes: ['public_repo', 'user:email'],
    client_secret: githubClientSecret,
  };
  body = JSON.stringify(body);
  var options = {
    method: 'PUT',
    headers: [
      ['Authorization', 'basic ' +  window.btoa(username + ":" + password)]
    ]
  };
  var uri = githubApiRoot;
  uri += 'authorizations/clients/';
  uri += githubClientId
  var response = yield network.request(uri, body, options);
  response = JSON.parse(response);

  return response.token;
}

export default class {
  constructor(token) {
    this.token = token;

    if (token)
      externals.gen_run(this.loadUserData());
  }

  * getAuthorInformation() { // can probably drop the * and hope.
    yield* this.loadUserData();
    return this.author;
  }
  * getUsername() {
    yield* this.loadUserData();
    return this.username;
  }
  * loadUserData() {
    if (this.author) return;
    // TODO handle exceptions here.
    var [userdata, emails] = [ // TODO parallelize this.
      yield* this.apiRequest('user'),
      yield* this.apiRequest('user/emails')
    ]

    emails = emails.filter( mail => mail.primary )

    this.author = { name: userdata.name, email: emails[0].email }
    this.username = userdata.login;
  }

  * apiRequest(api_uri, body = undefined, method = 'GET') {
    var uri = githubApiRoot + api_uri;
    var options = {
      headers: [
        ['Authorization', 'token ' + this.token ]
      ],
      method: method
    }

    body = JSON.stringify(body);
    var response = yield network.request(uri, body, options)
    return JSON.parse(response)
  }

  * saveFile(project, git_head, path, content, mode = '100644') {
    var update = [{ path, mode, content }];
    update.base = git_head.commit.tree;
    var repository = project.repository;

    var treeHash = yield repository.createTree(update);

    var commitHash = yield repository.saveAs(
      "commit",
      {
        tree: treeHash,
        parent: git_head.hash,
        author: yield* this.getAuthorInformation(),
        message: "automatic save"
      }
    );

    yield repository.updateRef(project.ref, commitHash);
  }

  * deleteBranch(repository, ref) {
    var repository = repository;
    yield repository.deleteRef(ref);
  }

  * updateMaster(repository, upstream_repo_name) {
   var upstream = externals.jsgit.connect_to_repo(
      upstream_repo_name,
      this.token);

    var upstreamHash = yield upstream.readRef('refs/heads/master');
    yield repository.updateRef('refs/heads/master', upstreamHash);
  }

  * compareBranches(repository, left, right) {
    // Github's api looks like it should be symmetrical diff ("a...b"), but it
    // really just "a..b".
    var uri = `repos/${repository.githubRepoName}/compare/${left}...${right}`;
    return yield* this.apiRequest(uri);
  }

  loadRepository(repo_name) {
    // TODO if repo_name doesn't contain '/'{ repo_name=username+'/'+repo_name}
    var repo = externals.jsgit.connect_to_repo(repo_name, this.token);
    repo.githubRepoName = repo_name;
    return repo;
  }

  * readRef(repository, ref) {
    var hash = yield repository.readRef(ref);
    var commit = yield repository.loadAs("commit", hash);
    return {ref, hash, commit};
  }

  * squashChanges(repository, base, workbranch, targetBranch, commitMessage) {
    var [base_hash, work_hash] = yield [
      repository.readRef(base),
      repository.readRef(workbranch),
    ];
    var work_commit = yield repository.loadAs("commit", work_hash);

    var commitHash = yield repository.saveAs(
      "commit",
      {
        tree: work_commit.tree,
        parent: base_hash,
        author: yield* this.getAuthorInformation(),
        message: commitMessage,
      }
    );

    yield repository.updateRef(targetBranch, commitHash); // todo force?
  }

  * createPullRequst(where, what, title, body  ) {
    var uri = `repos/${where}/pulls`;
    var body = {
      title,
      body,
      head: what,
      base: 'master',
    }
    var response = yield* this.apiRequest(uri, body, 'POST');
    log(response);
    return response.html_url;
  }

  * doesRepoExist(repo_full_name) {
    var xhr = yield network.request(
      'repos/' + repo_full_name,
      null,
      { return_xhr: true });
    // return xhr.status / 100 == 2;
    return false
  }
}
