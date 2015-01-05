/* Functions to interact with GitHub. Gen-run friendly.
 *
 */
"use strict";

import * as network from 'lib/network';

import {githubApiRoot} from 'app/config';

function unimpl() {
  throw new Error("Not implemented");
}

function* getToken(username, password) {
  unimpl();
  return null;
}

export function* getAuthorInformation() {
  // TODO implement
  return { name: "Aviv Eyal", email: 'avivey@gmail.com' }
}

/* adds auth header, github api root
*/
function* apiRequest(api_uri, body = undefined) {
  var uri = githubApiRoot + api_uri;
  unimpl()
}

export function* saveFile(project, path, content, mode = '100644') {

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

    yield repo.updateRef(HEAD.ref, commitHash)
    workspace.loadProject(workspace.getActiveProject());
}

function squashChanges(base, workbranch, targetBranch) {

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
