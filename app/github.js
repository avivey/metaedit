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
