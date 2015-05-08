var sinon = require('sinon');
var TestUtils = require('test-utils');
var assert = require('assert');

require('../src/element-kit');


describe('Element Tests', function () {

    it('adding and removing classes', function() {
        var el = document.createElement('div');
        var testClassName = 'testing';
        el.kit.classList.add(testClassName);
        assert.ok(el.classList.contains(testClassName), 'new class was added successfully');
        el.kit.classList.add(testClassName);
        assert.ok(el.classList.contains(testClassName), 'adding the same class a second time does not add the class name again');
        el.kit.classList.remove(testClassName);
        assert.ok(!el.classList.contains(testClassName), 'removing class was successful');
    });

    it('adding and removing classes when browser does not natively support classList', function() {
        var el = document.createElement('div');
        var testClassName = 'testing';
        var origCreateElement = document.createElement;
        document.createElement = function (arg) {
            if (arg === '_') {
                return {};
            } else {
                return origCreateElement.apply(this, arguments);
            }
        };
        el.kit.classList.add(testClassName);
        assert.equal(el.className, testClassName, 'new class was added successfully');
        el.kit.classList.add(testClassName);
        assert.equal(el.className, testClassName, 'adding the same class a second time does not add the class name again');
        el.kit.classList.remove(testClassName);
        assert.equal(el.className, '', 'removing class was successful');
        var firstTestClass = 'new-class';
        var secondTestClass = 'new-too-class';
        el.kit.classList.add(firstTestClass);
        el.kit.classList.add(secondTestClass);
        assert.equal(el.className, firstTestClass + ' ' + secondTestClass, 'adding another class while one already exists, adds the new class correctly');
        document.createElement = origCreateElement;
    });

    it('adding and removing a class when other classes already exist', function() {
        var testClass = 'test2';
        var el = document.createElement('div');
        el.className = 'existingclass supercedingclass testing2';
        el.kit.classList.add(testClass);
        assert.ok(el.kit.classList.contains(testClass), 'target element has class initially');
        var result = 'existingclass supercedingclass testing2';
        el.kit.classList.remove(testClass);
        assert.equal(el.className, result, 'class was removed successfully, leaving all other existing classes in tact');
    });

    it('adding and removing multiple classes', function() {
        var el = document.createElement('div');
        el.kit.classList.add('test1', 'test2');
        assert.ok(el.classList.contains('test1'), 'after adding two classes, el has the first class');
        assert.ok(el.classList.contains('test2'), 'el has the second class');
        el.kit.classList.remove('test1', 'test2');
        assert.ok(!el.classList.contains('test1'), 'after removing the two classes, el no longer has the first class');
        assert.ok(!el.classList.contains('test2'), 'el no longer has the second class');
    });

    it('querying whether the element has class names that all begin with the same prefix', function() {
        var el = document.createElement('div');
        el.className = 'mock_new mock-test mockahkd';
        assert.ok(!el.kit.classList.contains('mock'), 'element does not have the class specified even though it has classes with prefixes that are the same');

    });

    it('toggling a class', function() {
        var el = document.createElement('div');
        var testClassName = 'toggle1';
        el.kit.classList.toggle(testClassName);
        assert.ok(el.classList.contains(testClassName), 'calling toggle() with a css class that hasnt been added adds it');
        el.kit.classList.toggle(testClassName);
        assert.ok(!el.classList.contains(testClassName), 'calling toggle() when the element already has the css class removes it');
        el.kit.classList.toggle(testClassName);
        assert.ok(el.classList.contains(testClassName), 'calling toggle() when a previous toggle has removed the class adds it back again');
        el.kit.classList.remove(testClassName);
    });

    it('getting closest ancestor', function() {
        var html = ' \n\r' +
            '<div>' +
            '<div class="test-child"></div>' +
            '</div>';
        var el = document.createElement('li');
        el.className = 'ancestor';
        el.setAttribute('data-more', 'more_data');
        el.innerHTML = html;
        var childEl = el.getElementsByClassName('test-child')[0];
        assert.equal(childEl.kit.getClosestAncestorElementByClassName('ancestor'), el, 'getting closest ancestor element returns correct element');
        assert.ok(!childEl.kit.getClosestAncestorElementByClassName('nothing'), 'returns falsy when no ancestors have the class specified');
        assert.ok(!childEl.kit.getClosestAncestorElementByClassName('test-child'), ' does NOT return the source element when attempting to get an ancestor element with the same class');
    });

    it('adding and removing events', function() {
        var el = document.createElement('div');
        var eventSpy = sinon.spy();
        el.kit.addEventListener('click', eventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        assert.deepEqual(eventSpy.thisValues[0], el, 'after adding a click event listener to an element, clicking it triggers the listener correctly with the clicked element as the context');
        el.kit.removeEventListener('click', eventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        assert.equal(eventSpy.callCount, 1, 'after removing the click event listener, clicking it no longer triggers the listener');
    });

    it('adding and removing events with a context', function() {
        var el = document.createElement('div');
        var eventSpy = sinon.spy();
        var bindableObj = {eventCallback: eventSpy};
        el.kit.addEventListener('click', 'eventCallback', bindableObj);
        el.dispatchEvent(TestUtils.createEvent('click')); // trigger event!
        assert.deepEqual(eventSpy.thisValues[0], bindableObj, 'after adding a click event listener with a context to an element, clicking element triggers the listener with the binded obj as the context');
        el.kit.removeEventListener('click', 'eventCallback', bindableObj);
    });

    it('adding and removing events when others exist', function() {
        var el = document.createElement('div');
        var firstClickEventSpy = sinon.spy();
        var secondClickEventSpy = sinon.spy();

        el.kit.addEventListener('click', firstClickEventSpy);
        el.kit.addEventListener('click', secondClickEventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        assert.equal(firstClickEventSpy.callCount, 1, 'after adding first click event listener to an element, clicking it triggers the first listener correctly');
        assert.equal(secondClickEventSpy.callCount, 1, 'second listener on same event was triggered');

        el.kit.removeEventListener('click', firstClickEventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        assert.equal(firstClickEventSpy.callCount, 1, 'after removing first click event listener, clicking element no longer triggers first event listener');
        assert.equal(secondClickEventSpy.callCount, 2, 'second listener was still triggered');

        el.kit.removeEventListener('click', secondClickEventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        assert.equal(firstClickEventSpy.callCount, 1, 'after removing second click event listener, first event listener is still not triggered');
        assert.equal(secondClickEventSpy.callCount, 2, 'second listener was no longer triggered');
    });


    it('appending outer html element', function() {
        var origParent = document.createElement('div');
        var innerEl = document.createElement('span');
        var spanText = 'Test stuff';
        innerEl.innerHTML = spanText;
        var innerHtml = '<span>' + spanText + '</span>';
        origParent.appendChild(innerEl);
        var wrapperHtml = '<div class="wrapper"></div>';
        var wrapper = innerEl.kit.appendOuterHtml(wrapperHtml);
        assert.equal(wrapper.innerHTML, innerHtml, 'new element has inner html contents');
        assert.equal(wrapper.parentNode, origParent, 'new wrapper\'s parent node is the wrapped element\'s original parent');
    });

    it('appending outer html element when element is not in the DOM', function() {
        var innerEl = document.createElement('span');
        var spanText = 'Test stuff';
        innerEl.innerHTML = spanText;
        var innerHtml = '<span>' + spanText + '</span>';
        var wrapperHtml = '<div class="wrapper"></div>';
        var wrapper = innerEl.kit.appendOuterHtml(wrapperHtml);
        assert.equal(wrapper.innerHTML, innerHtml, 'new element has inner html contents');
        assert.deepEqual(wrapper.parentNode.prototype, document.createDocumentFragment.prototype, 'new wrapper\'s parent node is a document fragement since element had no original parent');
    });

    it('getCssComputedProperty()', function() {
        var el = document.createElement('div');
        var value = '300px';
        el.style.width = value;
        assert.equal(el.kit.getCssComputedProperty('width'), value, 'calling getCssComputedProperty() returns correct value');
    });

    it('waitForTransition() when there is a single computed property', function(done) {
        var el = document.createElement('div');
        var callbackSpy = sinon.spy();
        var highestTimeMilliseconds = 100;
        el.style.transitionDelay = highestTimeMilliseconds + 'ms';
        el.kit.waitForTransition(callbackSpy);
        assert.equal(callbackSpy.callCount, 0, 'after calling waitForTransition() on an element that has a transition delay, the callback is not fired immediately because the transition hasnt finished');
        setTimeout(function () {
            assert.equal(callbackSpy.callCount, 1, 'callback is fired after the transition delay time elapses');
            var highestTimeMilliseconds = 150;
            el.style.transitionDelay = '100ms';
            el.style.transitionDuration = highestTimeMilliseconds + 'ms';
            el.kit.waitForTransition(callbackSpy);
            assert.equal(callbackSpy.callCount, 1, 'callback is NOT immediately fired after a call to waitForTransition(), because the appropriate time hasnt yet elapsed');
            setTimeout(function () {
                assert.equal(callbackSpy.callCount, 2, 'after setting the transition duration to a higher number than the transition delay, callback is fired after the transition duration time elapses');
                var highestTime = 0.3;
                var highestTimeMilliseconds = highestTime * 1000;
                el.style.transitionDelay = '100ms';
                el.style.transitionDuration = highestTime + 's';
                el.kit.waitForTransition(callbackSpy);
                assert.equal(callbackSpy.callCount, 2, 'callback is NOT immediately fired after a call to waitForTransition(), because the appropriate time hasnt yet elapsed');
                setTimeout(function () {
                    assert.equal(callbackSpy.callCount, 3, 'callback is still fired after the transition duration time elapses, even when it uses a seconds unit with a time value lower than the milliseconds time value of the transition duration');
                    done();
                },highestTimeMilliseconds  + 1);
            }, highestTimeMilliseconds + 1);
        }, highestTimeMilliseconds + 1);
    });

    it('waitForTransition() on element that has multiple computed transition properties', function(done) {
        var el = document.createElement('div');
        var callbackSpy = sinon.spy();
        var highestTimeMilliseconds = 100;
        el.style.transitionDelay = [highestTimeMilliseconds + 'ms', '50ms'];
        el.kit.waitForTransition(callbackSpy);
        assert.equal(callbackSpy.callCount, 0, 'callback is NOT immediately fired after a call to waitForTransition(), because the appropriate time hasnt yet elapsed');
        setTimeout(function () {
            assert.equal(callbackSpy.callCount, 1, 'waitForTransition() fires callback at the appropriate time when on an element that has multiple transition delays');
            var highestTimeMilliseconds = 200;
            el.style.transitionDuration = ['40ms', highestTimeMilliseconds + 'ms'];
            el.kit.waitForTransition(callbackSpy);
            assert.equal(callbackSpy.callCount, 1, 'callback is NOT immediately fired after a call to waitForTransition(), because the appropriate time hasnt yet elapsed');
            setTimeout(function () {
                assert.equal(callbackSpy.callCount, 2, 'waitForTransition() fires callback at the appropriate time when on an element that has multiple transition durations');
                var highestTimeMilliseconds = 200;
                el.style.transitionDuration = ['100ms', '50ms'];
                el.style.transitionDelay = [highestTimeMilliseconds + 'ms', '50ms'];
                el.kit.waitForTransition(callbackSpy);
                assert.equal(callbackSpy.callCount, 2, 'callback is NOT immediately fired after a call to waitForTransition(), because the appropriate time hasnt yet elapsed');
                setTimeout(function () {
                    assert.equal(callbackSpy.callCount, 3, 'waitForTransition() fires callback at the appropriate time when on an element that has multiples of both transition delays and durations');
                    var highestTime = 0.3;
                    var highestTimeMilliseconds = highestTime * 1000;
                    el.style.transitionDuration = ['100ms', '50ms'];
                    el.style.transitionDelay = ['100ms', highestTime + 's', '300ms'];
                    el.kit.waitForTransition(callbackSpy);
                    assert.equal(callbackSpy.callCount, 3, 'callback is NOT immediately fired after a call to waitForTransition(), because the appropriate time hasnt yet elapsed');
                    setTimeout(function () {
                        assert.equal(callbackSpy.callCount, 4, 'waitForTransition() fires callback at the appropriate time when on an element that has multiples of both transition delays and durations, even when one has a seconds unit');
                        done()
                    }, highestTimeMilliseconds + 1);
                }, highestTimeMilliseconds + 1);
            }, highestTimeMilliseconds);
        }, 101);
    });

    it('getting the unique identifier of an element', function() {
        var firstEl = document.createElement('div');
        var secondEl = document.createElement('div');
        var firstElId = firstEl.kit.getUniqueId();
        assert.ok(firstElId, 'first el returns an id that is not undefined');
        var secondElId = secondEl.kit.getUniqueId();
        assert.ok(secondElId, 'second el returns an id that is not undefined');
        assert.notEqual(firstElId, secondElId, 'id of first el does NOT equal id of second el');
    });

    it('getting a dataset property when it already exists in DOM', function() {
        var el = document.createElement('div');
        var testProp = 'test';
        var value = 'myval';
        el.setAttribute('data-' + testProp, value);
        assert.equal(el.kit.dataset[testProp], value, 'querying dataset returns already-assigned dataset value');
    });

    it('setting and getting data sets', function() {
        var el = document.createElement('div');
        var testVal = 'my-test-value';
        el.kit.dataset.newValue = testVal;
        assert.equal(el.kit.dataset.newValue, testVal, 'after setting a new value on dataset, the new value is returned when queried');
    });

    it('should return camel-cased key when there is a hyphenated dataset attribute in the markup', function() {
        var el = document.createElement('div');
        var testProp = 'test-my-hyphen-prop';
        var value = 'myval';
        el.setAttribute('data-' + testProp, value);
        assert.equal(el.kit.dataset.testMyHyphenProp, value, 'querying dataset returns camcel-cased key');
    });

});
