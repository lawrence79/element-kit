# Element Kit

A lightweight library that exposes a high-level API on your HTML elements.  It uses the new [Element](https://developer.mozilla.org/en-US/docs/Web/API/Element) and [HTMLElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement) API interfaces if available. Otherwise, falls back to old-school native javascript for older browsers.

It also adds some other helpful goodies (methods) to your elements that are missing in the [Element API](https://developer.mozilla.org/en-US/docs/Web/API/Element).

This library works on IE9+, all modern browsers, and mobile.

## Installation

### Bower

```shell
bower install element-kit
```

### Node Module

```shell
npm install element-kit --save-dev
```

## Usage

To give you a glimpse of whats available in Element Kit, lets say you have the problem (that many of us have) where you need
to detect the completion of an element's [CSS transition](https://developer.mozilla.org/en-US/docs/Web/Guide/CSS/Using_CSS_transitions)
in javascript before your code can continue. Given the following CSS...


```css
.animate {
    transition-property: background-color;
    transition-duration: 100ms;
    transition-timing-function: ease-out;
}
```

You could use element kit to wait until the element finishes its transition before doing other things in your javascript code. Like so:

```javascript
var element = document.getElementByTagName('div')[0];
element.kit.classList.add('animate'); // transition element's background color
element.kit.waitForTransition(element, function () {
    // 100 milliseconds later...
    console.log('transition complete!');
});
```

More methods and usage can be found on the [docs](https://github.com/mkay581/element-kit/blob/master/docs/element.md) page.

## Release History

 * 2014-12-08   v0.1.0   Official release.
