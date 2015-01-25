# ImageElement.kit

The following methods will be available to you under the "kit" property of all of your HTMLImageElements (your `<img>` tags).


### ImageElement.kit.load

`ImageElement.kit.load(attr)`

This method uses the image path specified in the custom attribute `attr` that you pass it and lazy loads the image into memory
and caches it for fast rendering later. `attr` is a string denoting the custom attribute on the element that contains the path of the
image to be lazy-loaded. This method does not show the image, just loads it. If you want to inject the image into the DOM
and render it, use the `show()` method below in your callback of the `load()` method.

```javascript
var imageEl = document.getElementByClassName('img')[0];

imageEl.setAttribute('my-lazy-image', 'http://path/to/my/image'); // set url on custom attribute

imageEl.load('my-lazy-image', function () {
    // image done loading!
});

```

### ImageElement.kit.show

`ImageElement.kit.show()`

Shows an image that has already been lazy-loaded (using the `load()` method above) by injecting it into the DOM. If the image
hasn't been lazy-loaded with the `load()` method, this method does nothing.

```javascript
var imageEl = document.getElementByClassName('img')[0];

imageEl.setAttribute('my-lazy-image', 'http://path/to/my/image'); // set url on custom attribute

imageEl.load('my-lazy-image', function () {
    imageEl.show(); // show the image in the DOM
});

```