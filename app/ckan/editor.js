/*
  editor for a single ckan file.
  allow changing mode version in filename,
  allow (suggest?) matching it to content.

  create + format json file
*/

// For now, keep using the textarea.
import * as ui_elements from 'app/ui_setup'; // TODO this is obviously really bad.
import {log} from 'lib/debug';


import * as network from 'lib/network';

var json_editor;
export var editor_changed = false;

// TODO define "file" object.
export function* loadNewFile(repository, file) {

  var content = yield repository.loadAs("text", file.hash);

  try {
    content = JSON.parse(content);
  } catch (err) {
    alert("Failed to read file as JSON: "+ file.name);
    ui_elements.textarea.value = content;
    return;
  }

  json_editor.setValue(content);
  // TODo alert if editor_changed or sometihng.
  editor_changed = false
}

export function* getContentAsString() {
  // Validate the editor's current value against the schema
  var errors = json_editor.validate();

  if (errors.length) {
    alert("Content isn't valid!");
    throw new Error("validation error");
  }

  return externals.stringify(json_editor.getValue());
}


externals.gen_run(function*() {
  var schema = yield* network.request('CKAN.schema'); // TODO move this
  var editor_options = {
    schema: JSON.parse(schema),
    disable_edit_json: true,
  }

  json_editor = new JSONEditor(ui_elements.json_editor, editor_options);
  json_editor.on('change',()=> { editor_changed = true;})
});




