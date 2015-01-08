export function log(x = 'nothing to say') {
  console.log(x);
}

export var q = document.getElementById.bind(document);

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
