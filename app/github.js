/* Functions to interact with GitHub. Gen-run friendly.
 *
 */
"use strict";
import {log} from 'lib/debug';
import * as network from 'lib/network';

import {githubApiRoot} from 'app/config';

function unimpl() {
  throw new Error("Not implemented");
}

export function* getToken(username, password) {
  unimpl();
  return null;
}

export default class {
  constructor(token) {
    this.token = token;
  }

  * getAuthorInformation() {
    if (!this.author) {
      var [userdata, emails] = [ // TODO parallelize this.
        yield* this.apiRequest('user'),
        yield* this.apiRequest('user/emails')
      ]

      emails = emails.filter( mail => mail.primary )

      this.author = { name: userdata.name, email: emails[0].email }
    }
    return this.author;
  }

  * apiRequest(api_uri, body = undefined, method = 'GET') {
    var uri = githubApiRoot + api_uri;
    var options = {
      headers: [
        ['Authorization', 'token ' + this.token ]
      ],
      method: method
    }
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
}
function squashChanges(base, workbranch, targetBranch) {

// take tree from workbranch, make commit with that tree and
// parent = base, udpate targetBranch to that commit.

/*
    var update = [
      {
        path: 'README.md',
        mode: '100644',
        content: ui_elements.textarea.value
      }
    ]
    update.base = HEAD.commit.tree

    var treeHash = yield repo.createTree(update)

    var commitHash = yield repo.saveAs(
      "commit",
      {
        tree: treeHash,
        parent: HEAD.hash,
        author: author_object,
        message: "automatic save"
      }
    );

    yield repo.updateRef(HEAD.ref, commitHash)*/
}
