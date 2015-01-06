"use strict";
import {log} from 'lib/debug';
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


var refname_base = 'heads/'+refs_namespace+'/'
var refname_pr = refname_base + '__pr/'

var refname_re = new RegExp('refs/' + refname_base + '(__pr/)?(.*)')

export function ref_to_project_name(ref) {
  var matches = ref.match(refname_re);
  if (!matches) return null;

  return matches[2];
}

var ALL_PROJECTS = null; // TODO naming convntion.

// Fetches all refs, builds projects db
export function* update_all(repository) {
  var all_projects = {}
  var [projects, prs] = yield [
    repository.listRefs(refname_base),
    repository.listRefs(refname_pr),
  ];
  if (!projects) projects = []
  if (!prs) prs = []

  for (let ref of projects) {
    const name = ref_to_project_name(ref);
    if (!name) continue;
    all_projects[name] = new Project(repository, name, ref);
  }

  for (let ref of prs) {
    const name = ref_to_project_name(ref);
    project = all_projects[name];
    if (!project) continue; // TODO warn here.
    // TODO if project[pr] error
    project.pullrequest = { ref }; // TODO find pr uri.
  }

  ALL_PROJECTS = all_projects;
  return ALL_PROJECTS;
}

export function* getAllProjects(repository) {
  if (ALL_PROJECTS)
    return ALL_PROJECTS;
  return yield* update_all(repository);
}

var new_project_name_re = /^[a-z][a-z0-9_-]*$/i;
export function createNewProject(repository, name) {
  name = name.replace(' ', '_');
  if (!name.match(new_project_name_re))
    throw new Error("Name is inavlid");

  var ref = 'refs/' + refname_base + name;

  var project = new Project(repository, name, ref);
  ALL_PROJECTS[name] = project;
  return project;
}


