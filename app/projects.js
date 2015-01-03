"use strict";

import {refs_namespace} from 'app/config'

// Project object is:
/*
  {
    name: string. project name, main part of branch name.
    ref: string. Full refname of branch.
    pullrequest: {
      uri: string, uri for the github pr object.
      ref: string, full refname of the "from" branch for the pr.
    }
  }
*/


var refname_re = new RegExp("refs/heads/"+refs_namespace+"/(.*)")
var pr_refname_re = new RegExp("refs/heads/"+refs_namespace+"/__PR/(.*)")

export function ref_to_project_name(ref) {
  var matches = ref.match(refname_re);
  if (!matches) return null;

  return matches[1];
}

export function pr_ref_to_project_name(ref) {
  var matches = ref.match(pr_refname_re);
  if (!matches) return null;

  return matches[1];
}

var ALL_PROJECTS = {}

// Fetches all refs, builds projects db
export function* update_all(repository) {
  var all_projects = {}
  var [projects, prs] = yield [
    repository.listRefs('heads/' + refs_namespace),
    repository.listRefs('heads/' + refs_namespace + '/__PR/'),
  ]

  for (let ref in projects) {
    const name = ref_to_project_name(ref)
    if (!name) continue
    all_projects[name] = { name, ref }
  }

  for (let ref in prs) {
    const name = pr_ref_to_project_name(ref)
    project = all_projects[name]
    if (!project) continue // TODO warn here.
    // TODO if project[pr] error
    project.pullrequest = { ref } // TODO find pr uri.
  }

  ALL_PROJECTS = all_projects
  return ALL_PROJECTS
}


