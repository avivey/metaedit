"use strict";

import {refs_namespace} from 'app/config';

// Project object is:
/*
  {
    name: string. project name, main part of branch name.
    ref: string. Full refname of branch.
    mergebase: hash of commit where branch was made (Basically merge-base).
    pullrequest: {
      uri: string, uri for the github pr object.  NOTE: May be missing
      ref: string, full refname of the "from" branch for the pr.
    }
  }


  Project is almost identical to branch.
  Consider if `master` is "project" or "almost project" or if we need an
  abstraction for "branch".
*/

function Project(repository, name, ref) {
  this.repository = repository;
  this.name = name;
  this.ref = ref;
}
Project.prototype.get_mergebase = function*() {
  // repository.readRef rename_mb+this.name
  // or use https://developer.github.com/v3/repos/commits/#compare-two-commits
  return null;
}


var refname_base = 'refs/heads/'+refs_namespace+'/'
var refname_pr = refname_base + '__pr/'
var refname_mb = 'refs/heads'+refs_namespace+'/__mergebase/'  // TODO remove.

var refname_re = new RegExp(refname_base + '(__pr/|__mergebase/)?(.*)')

export function ref_to_project_name(ref) {
  var matches = ref.match(refname_re);
  if (!matches) return null;

  return matches[2];
}

var ALL_PROJECTS = {}

// Fetches all refs, builds projects db
export function* update_all(repository) {
  var all_projects = {}
  var [projects, prs] = yield [
    repository.listRefs(refname_base),
    repository.listRefs(refname_pr),
  ];

  for (let ref in projects) {
    const name = ref_to_project_name(ref);
    if (!name) continue;
    all_projects[name] = new Project(repository, name, ref);
  }

  for (let ref in prs) {
    const name = ref_to_project_name(ref);
    project = all_projects[name];
    if (!project) continue; // TODO warn here.
    // TODO if project[pr] error
    project.pullrequest = { ref }; // TODO find pr uri.
  }

  ALL_PROJECTS = all_projects;
  return ALL_PROJECTS;
}


