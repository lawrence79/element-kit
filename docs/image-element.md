# ImageElement.kit

The following methods will be available to you under the "kit" property of all of your HTMLImageElements (your `<img>` tags).


### ImageElement.kit.load

`ImageElement.kit.load(attr)`

Lazy loads an image . `html` is a string of HTML to wrap and append to the parent of the current element.

```javascript
var el = document.getElementByClassName('div')[0],
    containerHtml = '<div class="wrapper"></div>',
    container = el.kit.appendOuterHtml(el, containerHtml);

container.innerHTML
=>  '<div class="wrapper"><p class="my-existing-content"></p></div>'

```