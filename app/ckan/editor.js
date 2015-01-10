/*
  editor for a single ckan file.
  allow changing mode version in filename,
  allow (suggest?) matching it to content.

  create + format json file
*/

import {log, q, mkel} from 'lib/util';


import * as network from 'lib/network';

var json_editor;
var editor_changed = false;
export function isEditorChanged() { return editor_changed; }
var active_file = null;
export function getActiveFile() { return active_file; }

// TODO define "file" object.
export function* loadNewFile(repository, file) {
  // TODo alert if editor_changed or sometihng.
  var content = yield repository.loadAs("text", file.hash);

  try {
    content = JSON.parse(content);
  } catch (err) {
    alert("Failed to read file as JSON: "+ file.name);
    log(content);
    return;
  }

  active_file = file;
  json_editor.setValue(content);
  editor_changed = false; q('changes_marker_span').textContent = 'No changes';
}

export function getContentAsString() {
  // Validate the editor's current value against the schema
  var errors = json_editor.validate();
  if (errors.length) {
    alert("Content isn't valid!");
    throw new Error("validation error");
  }

  return externals.stringify(json_editor.getValue(), {space:4});
}


externals.gen_run(function*() {
  var schema = yield network.request('ext/CKAN.schema'); // TODO move this
  var editor_options = {
    schema: JSON.parse(schema),
    disable_edit_json: true,
  }

  json_editor = new JSONEditor(q('json_editor'), editor_options);
  json_editor.on(
    'change',
    ()=> {
      editor_changed = true; q('changes_marker_span').textContent = 'made changes'
    });
});
