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
    this.__activeFile = null;
  }
  isEditorChanged() {
    return this.json_editor.getValue() != this.__original_value;
  }

  get activeFile() { return this.__activeFile; }
  set activeFile(file) {
    this.__activeFile = file;
    var target = q('current_filename');
    if (file) {
      target.innerHTML = file.name;
      target.title = file.path;
    } else {
      target.innerHTML = '<i>none</i>';
      target.title = null;
    }
  }

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

    this.activeFile = file;
    this.__original_value = content;
    this.json_editor.setValue(content);
    this.editor_changed = false;
    q('changes_marker_span').textContent = 'No changes'; // TODO delay this

    q('save_as_btn').onclick = () => this.createNewVersion();
    q('close_file').onclick = () => { this.activeFile = null };
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
    return this.activeFile? this.activeFile.name : null;
  }

  createNewVersion() {
    // TODO replace with something smarter.
    if (!this.activeFile) return;
    var name = prompt('new filename?', this.activeFile.name);
    if (name == this.activeFile.name) return;
    this.activeFile = {
      name,
      path: this.activeFile.path.replace(this.activeFile.name, name),
      // TODO  hash ?
    }
  }

  makeJsonEditor(schema) {
    var editor_options = {
      schema: JSON.parse(schema),
      disable_edit_json: true,
    }

    var json_editor = new JSONEditor(q('json_editor'), editor_options);
    json_editor.on(
      'change',
      () =>  {
        this.editor_changed = true;
        q('changes_marker_span').textContent = 'made changes';
      });
    return json_editor;
  }
}