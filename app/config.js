"use strict";

export var refs_namespace = 'metaedit';


// Your user can generate these manually at https://github.com/settings/tokens/new
// Or you can use an oauth flow to get a token for the user.
export var githubToken = localStorage['metaedit_github_token'];

export var githubUsername = 'avivey'  // TODO store this.

export var githubRepoName = "CKAN-meta";
export var githubUpstreamOrg = "KSP-CKAN"; // TODO can pull this?

// for github ent, something like 'https://github.example.com/api/v3/'
export var githubApiRoot = 'https://api.github.com/';


// These are used to create and get the auth token. You can get your own at
// https://github.com/settings/applications/, or use the "alternate" login flow.
export var githubClientId = 'f91c69f66311e7536382';
export var githubClientSecret = '3a9547e9c061738864530dd4f7be910d6f1b8252';
