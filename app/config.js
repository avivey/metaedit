"use strict";

export var refs_namespace = 'metaedit';


// Your user can generate these manually at https://github.com/settings/tokens/new
// Or you can use an oauth flow to get a token for the user.
export var githubToken = localStorage['metaedit_github_token'];

if (!githubToken) {
  alert("Missing github token! All is lost!");
}

export var githubUsername = 'avivey'

export var githubRepoName = "CKAN-meta";
export var githubUpstreamOrg = "KSP-CKAN"; // TODO can pull this?

// for github ent, something like 'https://github.example.com/api/v3/'
export var githubApiRoot = 'https://api.github.com/';
