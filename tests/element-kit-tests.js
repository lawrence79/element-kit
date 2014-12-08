define([
    'sinon',
    'qunit',
    'test-utils',
    TEST_FILE
], function(
    Sinon,
    QUnit,
    TestUtils
){
    "use strict";

    QUnit.module('Element Tests');

    QUnit.test('initialization', function() {
        QUnit.expect(1);
        var firstEl = document.createElement('div');
        var secondEl = document.createElement('div');
        QUnit.notDeepEqual(firstEl.kit, secondEl.kit, 'after kits initialized, each kit has a different instance');
    });

    QUnit.test('ensuring the same instance is used', function() {
        QUnit.expect(3);
        var firstEl = document.createElement('div');
        QUnit.deepEqual(firstEl, firstEl.kit.el, 'after initializing first el, its kit instance references the first el also');
        var secondEl = document.createElement('div');
        QUnit.deepEqual(secondEl, secondEl.kit.el, 'after initialize second el, its kit instance references the second el same el');
        QUnit.deepEqual(firstEl, firstEl.kit.el, 'first kit\'s el still references the first el');
    });

    QUnit.test('adding and removing classes', function() {
        QUnit.expect(3);
        var el = document.createElement('div');
        var testClassName = 'testing';
        el.kit.classList.add(testClassName);
        QUnit.ok(el.classList.contains(testClassName), 'new class was added successfully');
        el.kit.classList.add(testClassName);
        QUnit.ok(el.classList.contains(testClassName), 'adding the same class a second time does not add the class name again');
        el.kit.classList.remove(testClassName);
        QUnit.ok(!el.classList.contains(testClassName), 'removing class was successful');
    });

    QUnit.test('adding and removing a class when other classes already exist', function() {
        QUnit.expect(2);
        var testClass = 'test2';
        var el = document.createElement('div');
        el.className = 'existingclass supercedingclass testing2';
        el.kit.classList.add(testClass);
        QUnit.ok(el.kit.classList.contains(testClass), 'target element has class initially');
        var result = 'existingclass supercedingclass testing2';
        el.kit.classList.remove(testClass);
        QUnit.equal(el.className, result, 'class was removed successfully, leaving all other existing classes in tact');
    });
    
    QUnit.test('querying whether the element has class names that all begin with the same prefix', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var el = document.createElement('div');
        fixture.appendChild(el);
        el.className = 'mock_new mock-test mockahkd';
        QUnit.ok(!el.kit.classList.contains('mock'), 'element does not have the class specified even though it has classes with prefixes that are the same');

    });

    QUnit.test('toggling a class', function() {
        QUnit.expect(3);
        var el = document.createElement('div');
        var testClassName = 'toggle1';
        el.kit.classList.toggle(testClassName);
        QUnit.ok(el.classList.contains(testClassName), 'calling toggle() with a css class that hasnt been added adds it');
        el.kit.classList.toggle(testClassName);
        QUnit.ok(!el.classList.contains(testClassName), 'calling toggle() when the element already has the css class removes it');
        el.kit.classList.toggle(testClassName);
        QUnit.ok(el.classList.contains(testClassName), 'calling toggle() when a previous toggle has removed the class adds it back again');
        el.kit.classList.remove(testClassName);
    });

    QUnit.test('getting closest ancestor', function() {
        QUnit.expect(3);
        var html = ' \n\r' +
            '<div>' +
                '<div class="test-child"></div>' +
            '</div>';
        var el = document.createElement('li');
        el.className = 'ancestor';
        el.setAttribute('data-more', 'more_data');
        el.innerHTML = html;
        var childEl = el.getElementsByClassName('test-child')[0];
        QUnit.equal(childEl.kit.getClosestAncestorElementByClassName('ancestor'), el, 'getting closest ancestor element returns correct element');
        QUnit.ok(!childEl.kit.getClosestAncestorElementByClassName('nothing'), 'returns falsy when no ancestors have the class specified');
        QUnit.ok(!childEl.kit.getClosestAncestorElementByClassName('test-child'), ' does NOT return the source element when attempting to get an ancestor element with the same class');
    });
    
    QUnit.test('adding and removing events', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var el = document.createElement('div');
        fixture.appendChild(el);
        var eventSpy = Sinon.spy();
        el.kit.addEventListener('click', eventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.deepEqual(eventSpy.thisValues[0], el, 'after adding a click event listener to an element, clicking it triggers the listener correctly with the clicked element as the context');
        el.kit.removeEventListener('click', eventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.equal(eventSpy.callCount, 1, 'after removing the click event listener, clicking it no longer triggers the listener');
    });
    
    QUnit.test('adding and removing events with a context', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var el = document.createElement('div');
        fixture.appendChild(el);
        var eventSpy = Sinon.spy();
        var bindableObj = {eventCallback: eventSpy};
        el.kit.addEventListener('click', 'eventCallback', bindableObj);
        el.dispatchEvent(TestUtils.createEvent('click')); // trigger event!
        QUnit.deepEqual(eventSpy.thisValues[0], bindableObj, 'after adding a click event listener with a context to an element, clicking element triggers the listener with the binded obj as the context');
        el.kit.removeEventListener('click', 'eventCallback', bindableObj);
    });
    
    QUnit.test('adding and removing events when others exist', function() {
        QUnit.expect(6);
        var fixture = document.getElementById('qunit-fixture');
        var el = document.createElement('div');
        fixture.appendChild(el);
        var firstClickEventSpy = Sinon.spy();
        var secondClickEventSpy = Sinon.spy();
    
        el.kit.addEventListener('click', firstClickEventSpy);
        el.kit.addEventListener('click', secondClickEventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.equal(firstClickEventSpy.callCount, 1, 'after adding first click event listener to an element, clicking it triggers the first listener correctly');
        QUnit.equal(secondClickEventSpy.callCount, 1, 'second listener on same event was triggered');
    
        el.kit.removeEventListener('click', firstClickEventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.equal(firstClickEventSpy.callCount, 1, 'after removing first click event listener, clicking element no longer triggers first event listener');
        QUnit.equal(secondClickEventSpy.callCount, 2, 'second listener was still triggered');
    
        el.kit.removeEventListener('click', secondClickEventSpy);
        el.dispatchEvent(TestUtils.createEvent('click'));
        QUnit.equal(firstClickEventSpy.callCount, 1, 'after removing second click event listener, first event listener is still not triggered');
        QUnit.equal(secondClickEventSpy.callCount, 2, 'second listener was no longer triggered');
    });
    
    
    QUnit.test('appending outer html element', function() {
        QUnit.expect(2);
        var origParent = document.createElement('div');
        var innerEl = document.createElement('span');
        var spanText = 'Test stuff';
        innerEl.innerHTML = spanText;
        var innerHtml = '<span>' + spanText + '</span>';
        origParent.appendChild(innerEl);
        var wrapperHtml = '<div class="wrapper"></div>';
        var wrapper = innerEl.kit.appendOuterHtml(wrapperHtml);
        QUnit.equal(wrapper.innerHTML, innerHtml, 'new element has inner html contents');
        QUnit.equal(wrapper.parentNode, origParent, 'new wrapper\'s parent node is the wrapped element\'s original parent');
    });
    
    QUnit.test('getCssComputedProperty()', function() {
        QUnit.expect(1);
        var fixture = document.getElementById('qunit-fixture');
        var el = document.createElement('div');
        fixture.appendChild(el);
        var value = '300px';
        el.style.width = value;
        QUnit.equal(el.kit.getCssComputedProperty('width'), value, 'calling getCssComputedProperty() returns correct value');
    });
    
    QUnit.asyncTest('waitForTransition()', function() {
        QUnit.expect(2);
        var fixture = document.getElementById('qunit-fixture');
        var html = '<div class="container"></div>';
        var el = document.createElement('div');
        fixture.appendChild(el);
        var callbackSpy = Sinon.spy();
        el.style.transitionDelay = '100ms';
        el.kit.waitForTransition(callbackSpy);
        QUnit.equal(callbackSpy.callCount, 0, 'after calling waitForTransition() on an element that has a transition delay of 100ms, the callback is not fired immediately because the transition hasnt finished');
        setTimeout(function () {
            QUnit.equal(callbackSpy.callCount, 1, 'callback is fired after 100ms elapses');
            QUnit.start();
        }, 101);
    });

    QUnit.test('getting the unique identifier of an element', function() {
        QUnit.expect(3);
        var firstEl = document.createElement('div');
        var secondEl = document.createElement('div');
        var firstElId = firstEl.kit.getUniqueId();
        QUnit.ok(firstElId, 'first el returns an id that is not undefined');
        var secondElId = secondEl.kit.getUniqueId();
        QUnit.ok(secondElId, 'second el returns an id that is not undefined');
        QUnit.notEqual(firstElId, secondElId, 'id of first el does NOT equal id of second el');
    });

    QUnit.test('getting a dataset property when it already exists in DOM', function() {
        QUnit.expect(1);
        var el = document.createElement('div');
        var testProp = 'test';
        var value = 'myval';
        el.setAttribute('data-' + testProp, value);
        QUnit.equal(el.kit.dataset[testProp], value, 'querying dataset returns already-assigned dataset value');
    });

    QUnit.test('setting and getting data sets', function() {
        QUnit.expect(1);
        var el = document.createElement('div');
        var testVal = 'my-test-value';
        el.kit.dataset.newValue = testVal;
        QUnit.equal(el.kit.dataset.newValue, testVal, 'after setting a new value on dataset, the new value is returned when queried');
    });

});