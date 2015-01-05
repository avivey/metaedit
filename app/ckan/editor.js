/*
  editor for a single ckan file.
  allow changing mode version in filename,
  allow (suggest?) matching it to content.

  create + format json file
*/

// For now, keep using the textarea.
import * as ui_elements from 'app/ui_setup'; // TODO this is obviously really bad.

// TODO define "file" object.
export function* loadNewFile(repository, file) {

  var content = yield repository.loadAs("text", file.hash);

  // TODo alert if editor_changed or sometihng.
  ui_elements.textarea.value = content;
  editor_changed = false
}

export var editor_changed = false;
ui_elements.textarea.onchange = ()=> { editor_changed = true; }


