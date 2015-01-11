export function log(x = 'nothing to say') {
  console.log(x);
}

export function q(id) {
  var e = document.getElementById(id);
  if (!e) {
    throw new Error(`Can't find element ${id}`);
  }
  return e;
}

export function mkel(tag, content, className = null) {
  var element = document.createElement(tag);
  if (className)
    element.className = className;
  if (content) {
    if (typeof(content) == 'string')
      element.innerHTML = content;
    else // array
      for (var c of content) {
        if (typeof(c) == 'string')
          c = document.createTextNode(c);
        element.appendChild(c);
      }
  }
  return element;
}

export function TODO(comment = '') {
  return {};
}
