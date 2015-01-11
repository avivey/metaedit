/*
  editor for a single ckan file.
  allow changing mode version in filename,
  allow (suggest?) matching it to content.

  create + format json file
*/

import {log, TODO} from 'lib/util';
import {q, mkel} from 'lib/util';
import * as network from 'lib/network';

export default class {
  constructor() {
    var self = this;
    externals.gen_run(function*() {
      var schema = yield network.request('ext/CKAN.schema'); // TODO move this
      self.json_editor = self.makeJsonEditor(schema);
    });
    this.editor_changed = false;
    this.active_file = null;
  }
  isEditorChanged() {
    return this.json_editor.getValue() != this.__original_value;
  }
  getActiveFile() { return this.active_file; }

  // TODO define "file" object.
  * loadNewFile(repository, file) {
    // TODo alert if editor_changed or sometihng.
    var content = yield repository.loadAs("text", file.hash);

    try {
      content = JSON.parse(content);
    } catch (err) {
      alert("Failed to read file as JSON: "+ file.name);
      log(content);
      return;
    }

    this.active_file = file;
    this.__original_value = content;
    this.json_editor.setValue(content);
    this.editor_changed = false;
    q('changes_marker_span').textContent = 'No changes'; // TODO delay this
  }

  getContentAsString() {
    // Validates the editor's current value against the schema
    var errors = this.json_editor.validate();
    if (errors.length) {
      alert("Content isn't valid!");
      throw new Error("validation error");
    }

    return externals.stringify(this.json_editor.getValue(), {space:4});
  }

  * destroy() {
    this.json_editor.destroy();
  }

  suggestProjectName() {
    return null;
  }

  makeJsonEditor(schema) {
    var editor_options = {
      schema: JSON.parse(schema),
      disable_edit_json: true,
    }

    var json_editor = new JSONEditor(q('json_editor'), editor_options);
    json_editor.on(
      'change',
      ()=> {
        this.editor_changed = true;
        q('changes_marker_span').textContent = 'made changes';
      });
    return json_editor;
  }
}