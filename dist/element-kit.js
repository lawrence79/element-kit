(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*global define:false require:false */
module.exports = (function(){
	// Import Events
	var events = require('events')

	// Export Domain
	var domain = {}
	domain.createDomain = domain.create = function(){
		var d = new events.EventEmitter()

		function emitError(e) {
			d.emit('error', e)
		}

		d.add = function(emitter){
			emitter.on('error', emitError)
		}
		d.remove = function(emitter){
			emitter.removeListener('error', emitError)
		}
		d.bind = function(fn){
			return function(){
				var args = Array.prototype.slice.call(arguments)
				try {
					fn.apply(null, args)
				}
				catch (err){
					emitError(err)
				}
			}
		}
		d.intercept = function(fn){
			return function(err){
				if ( err ) {
					emitError(err)
				}
				else {
					var args = Array.prototype.slice.call(arguments, 1)
					try {
						fn.apply(null, args)
					}
					catch (err){
						emitError(err)
					}
				}
			}
		}
		d.run = function(fn){
			try {
				fn()
			}
			catch (err) {
				emitError(err)
			}
			return this
		};
		d.dispose = function(){
			this.removeAllListeners()
			return this
		};
		d.enter = d.exit = function(){
			return this
		}
		return d
	};
	return domain
}).call(this)
},{"events":2}],2:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      }
      throw TypeError('Uncaught, unspecified "error" event.');
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],3:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],4:[function(require,module,exports){
'use strict';

module.exports = require('./lib')

},{"./lib":9}],5:[function(require,module,exports){
'use strict';

var asap = require('asap/raw')

function noop() {};

// States:
//
// 0 - pending
// 1 - fulfilled with _value
// 2 - rejected with _value
// 3 - adopted the state of another promise, _value
//
// once the state is no longer pending (0) it is immutable

// All `_` prefixed properties will be reduced to `_{random number}`
// at build time to obfuscate them and discourage their use.
// We don't use symbols or Object.defineProperty to fully hide them
// because the performance isn't good enough.


// to avoid using try/catch inside critical functions, we
// extract them to here.
var LAST_ERROR = null;
var IS_ERROR = {};
function getThen(obj) {
  try {
    return obj.then;
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

function tryCallOne(fn, a) {
  try {
    return fn(a);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}
function tryCallTwo(fn, a, b) {
  try {
    fn(a, b);
  } catch (ex) {
    LAST_ERROR = ex;
    return IS_ERROR;
  }
}

module.exports = Promise;
function Promise(fn) {
  if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new')
  if (typeof fn !== 'function') throw new TypeError('not a function')
  this._71 = 0;
  this._18 = null;
  this._61 = [];
  if (fn === noop) return;
  doResolve(fn, this);
}
Promise.prototype._10 = function (onFulfilled, onRejected) {
  var self = this;
  return new this.constructor(function (resolve, reject) {
    var res = new Promise(noop);
    res.then(resolve, reject);
    self._24(new Handler(onFulfilled, onRejected, res));
  });
};
Promise.prototype.then = function(onFulfilled, onRejected) {
  if (this.constructor !== Promise) return this._10(onFulfilled, onRejected);
  var res = new Promise(noop);
  this._24(new Handler(onFulfilled, onRejected, res));
  return res;
};
Promise.prototype._24 = function(deferred) {
  if (this._71 === 3) {
    this._18._24(deferred);
    return;
  }
  if (this._71 === 0) {
    this._61.push(deferred);
    return;
  }
  var state = this._71;
  var value = this._18;
  asap(function() {
    var cb = state === 1 ? deferred.onFulfilled : deferred.onRejected
    if (cb === null) {
      (state === 1 ? deferred.promise._82(value) : deferred.promise._67(value))
      return
    }
    var ret = tryCallOne(cb, value);
    if (ret === IS_ERROR) {
      deferred.promise._67(LAST_ERROR)
    } else {
      deferred.promise._82(ret)
    }
  });
};
Promise.prototype._82 = function(newValue) {
  //Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
  if (newValue === this) {
    return this._67(new TypeError('A promise cannot be resolved with itself.'))
  }
  if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
    var then = getThen(newValue);
    if (then === IS_ERROR) {
      return this._67(LAST_ERROR);
    }
    if (
      then === this.then &&
      newValue instanceof Promise &&
      newValue._24 === this._24
    ) {
      this._71 = 3;
      this._18 = newValue;
      for (var i = 0; i < this._61.length; i++) {
        newValue._24(this._61[i]);
      }
      return;
    } else if (typeof then === 'function') {
      doResolve(then.bind(newValue), this)
      return
    }
  }
  this._71 = 1
  this._18 = newValue
  this._94()
}

Promise.prototype._67 = function (newValue) {
  this._71 = 2
  this._18 = newValue
  this._94()
}
Promise.prototype._94 = function () {
  for (var i = 0; i < this._61.length; i++)
    this._24(this._61[i])
  this._61 = null
}


function Handler(onFulfilled, onRejected, promise){
  this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null
  this.onRejected = typeof onRejected === 'function' ? onRejected : null
  this.promise = promise;
}

/**
 * Take a potentially misbehaving resolver function and make sure
 * onFulfilled and onRejected are only called once.
 *
 * Makes no guarantees about asynchrony.
 */
function doResolve(fn, promise) {
  var done = false;
  var res = tryCallTwo(fn, function (value) {
    if (done) return
    done = true
    promise._82(value)
  }, function (reason) {
    if (done) return
    done = true
    promise._67(reason)
  })
  if (!done && res === IS_ERROR) {
    done = true
    promise._67(LAST_ERROR)
  }
}
},{"asap/raw":13}],6:[function(require,module,exports){
'use strict';

var Promise = require('./core.js')

module.exports = Promise
Promise.prototype.done = function (onFulfilled, onRejected) {
  var self = arguments.length ? this.then.apply(this, arguments) : this
  self.then(null, function (err) {
    setTimeout(function () {
      throw err
    }, 0)
  })
}
},{"./core.js":5}],7:[function(require,module,exports){
'use strict';

//This file contains the ES6 extensions to the core Promises/A+ API

var Promise = require('./core.js')
var asap = require('asap/raw')

module.exports = Promise

/* Static Functions */

function ValuePromise(value) {
  this.then = function (onFulfilled) {
    if (typeof onFulfilled !== 'function') return this
    return new Promise(function (resolve, reject) {
      asap(function () {
        try {
          resolve(onFulfilled(value))
        } catch (ex) {
          reject(ex);
        }
      })
    })
  }
}
ValuePromise.prototype = Promise.prototype

var TRUE = new ValuePromise(true)
var FALSE = new ValuePromise(false)
var NULL = new ValuePromise(null)
var UNDEFINED = new ValuePromise(undefined)
var ZERO = new ValuePromise(0)
var EMPTYSTRING = new ValuePromise('')

Promise.resolve = function (value) {
  if (value instanceof Promise) return value

  if (value === null) return NULL
  if (value === undefined) return UNDEFINED
  if (value === true) return TRUE
  if (value === false) return FALSE
  if (value === 0) return ZERO
  if (value === '') return EMPTYSTRING

  if (typeof value === 'object' || typeof value === 'function') {
    try {
      var then = value.then
      if (typeof then === 'function') {
        return new Promise(then.bind(value))
      }
    } catch (ex) {
      return new Promise(function (resolve, reject) {
        reject(ex)
      })
    }
  }

  return new ValuePromise(value)
}

Promise.all = function (arr) {
  var args = Array.prototype.slice.call(arr)

  return new Promise(function (resolve, reject) {
    if (args.length === 0) return resolve([])
    var remaining = args.length
    function res(i, val) {
      if (val && (typeof val === 'object' || typeof val === 'function')) {
        var then = val.then
        if (typeof then === 'function') {
          then.call(val, function (val) { res(i, val) }, reject)
          return
        }
      }
      args[i] = val
      if (--remaining === 0) {
        resolve(args);
      }
    }
    for (var i = 0; i < args.length; i++) {
      res(i, args[i])
    }
  })
}

Promise.reject = function (value) {
  return new Promise(function (resolve, reject) { 
    reject(value);
  });
}

Promise.race = function (values) {
  return new Promise(function (resolve, reject) { 
    values.forEach(function(value){
      Promise.resolve(value).then(resolve, reject);
    })
  });
}

/* Prototype Methods */

Promise.prototype['catch'] = function (onRejected) {
  return this.then(null, onRejected);
}

},{"./core.js":5,"asap/raw":13}],8:[function(require,module,exports){
'use strict';

var Promise = require('./core.js')

module.exports = Promise
Promise.prototype['finally'] = function (f) {
  return this.then(function (value) {
    return Promise.resolve(f()).then(function () {
      return value
    })
  }, function (err) {
    return Promise.resolve(f()).then(function () {
      throw err
    })
  })
}

},{"./core.js":5}],9:[function(require,module,exports){
'use strict';

module.exports = require('./core.js')
require('./done.js')
require('./finally.js')
require('./es6-extensions.js')
require('./node-extensions.js')

},{"./core.js":5,"./done.js":6,"./es6-extensions.js":7,"./finally.js":8,"./node-extensions.js":10}],10:[function(require,module,exports){
'use strict';

//This file contains then/promise specific extensions that are only useful for node.js interop

var Promise = require('./core.js')
var asap = require('asap')

module.exports = Promise

/* Static Functions */

Promise.denodeify = function (fn, argumentCount) {
  argumentCount = argumentCount || Infinity
  return function () {
    var self = this
    var args = Array.prototype.slice.call(arguments)
    return new Promise(function (resolve, reject) {
      while (args.length && args.length > argumentCount) {
        args.pop()
      }
      args.push(function (err, res) {
        if (err) reject(err)
        else resolve(res)
      })
      var res = fn.apply(self, args)
      if (res && (typeof res === 'object' || typeof res === 'function') && typeof res.then === 'function') {
        resolve(res)
      }
    })
  }
}
Promise.nodeify = function (fn) {
  return function () {
    var args = Array.prototype.slice.call(arguments)
    var callback = typeof args[args.length - 1] === 'function' ? args.pop() : null
    var ctx = this
    try {
      return fn.apply(this, arguments).nodeify(callback, ctx)
    } catch (ex) {
      if (callback === null || typeof callback == 'undefined') {
        return new Promise(function (resolve, reject) { reject(ex) })
      } else {
        asap(function () {
          callback.call(ctx, ex)
        })
      }
    }
  }
}

Promise.prototype.nodeify = function (callback, ctx) {
  if (typeof callback != 'function') return this

  this.then(function (value) {
    asap(function () {
      callback.call(ctx, null, value)
    })
  }, function (err) {
    asap(function () {
      callback.call(ctx, err)
    })
  })
}

},{"./core.js":5,"asap":11}],11:[function(require,module,exports){
"use strict";

// rawAsap provides everything we need except exception management.
var rawAsap = require("./raw");
// RawTasks are recycled to reduce GC churn.
var freeTasks = [];
// We queue errors to ensure they are thrown in right order (FIFO).
// Array-as-queue is good enough here, since we are just dealing with exceptions.
var pendingErrors = [];
var requestErrorThrow = rawAsap.makeRequestCallFromTimer(throwFirstError);

function throwFirstError() {
    if (pendingErrors.length) {
        throw pendingErrors.shift();
    }
}

/**
 * Calls a task as soon as possible after returning, in its own event, with priority
 * over other events like animation, reflow, and repaint. An error thrown from an
 * event will not interrupt, nor even substantially slow down the processing of
 * other events, but will be rather postponed to a lower priority event.
 * @param {{call}} task A callable object, typically a function that takes no
 * arguments.
 */
module.exports = asap;
function asap(task) {
    var rawTask;
    if (freeTasks.length) {
        rawTask = freeTasks.pop();
    } else {
        rawTask = new RawTask();
    }
    rawTask.task = task;
    rawAsap(rawTask);
}

// We wrap tasks with recyclable task objects.  A task object implements
// `call`, just like a function.
function RawTask() {
    this.task = null;
}

// The sole purpose of wrapping the task is to catch the exception and recycle
// the task object after its single use.
RawTask.prototype.call = function () {
    try {
        this.task.call();
    } catch (error) {
        if (asap.onerror) {
            // This hook exists purely for testing purposes.
            // Its name will be periodically randomized to break any code that
            // depends on its existence.
            asap.onerror(error);
        } else {
            // In a web browser, exceptions are not fatal. However, to avoid
            // slowing down the queue of pending tasks, we rethrow the error in a
            // lower priority turn.
            pendingErrors.push(error);
            requestErrorThrow();
        }
    } finally {
        this.task = null;
        freeTasks[freeTasks.length] = this;
    }
};

},{"./raw":12}],12:[function(require,module,exports){
(function (global){
"use strict";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including IO, animation, reflow, and redraw
// events in browsers.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Equivalent to push, but avoids a function call.
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// `requestFlush` is an implementation-specific method that attempts to kick
// off a `flush` event as quickly as possible. `flush` will attempt to exhaust
// the event queue before yielding to the browser's own event loop.
var requestFlush;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grow
// unbounded. To prevent memory exhaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0; scan < index; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

// `requestFlush` is implemented using a strategy based on data collected from
// every available SauceLabs Selenium web driver worker at time of writing.
// https://docs.google.com/spreadsheets/d/1mG-5UYGup5qxGdEMWkhP6BWCz053NUb2E1QoUTU16uA/edit#gid=783724593

// Safari 6 and 6.1 for desktop, iPad, and iPhone are the only browsers that
// have WebKitMutationObserver but not un-prefixed MutationObserver.
// Must use `global` instead of `window` to work in both frames and web
// workers. `global` is a provision of Browserify, Mr, Mrs, or Mop.
var BrowserMutationObserver = global.MutationObserver || global.WebKitMutationObserver;

// MutationObservers are desirable because they have high priority and work
// reliably everywhere they are implemented.
// They are implemented in all modern browsers.
//
// - Android 4-4.3
// - Chrome 26-34
// - Firefox 14-29
// - Internet Explorer 11
// - iPad Safari 6-7.1
// - iPhone Safari 7-7.1
// - Safari 6-7
if (typeof BrowserMutationObserver === "function") {
    requestFlush = makeRequestCallFromMutationObserver(flush);

// MessageChannels are desirable because they give direct access to the HTML
// task queue, are implemented in Internet Explorer 10, Safari 5.0-1, and Opera
// 11-12, and in web workers in many engines.
// Although message channels yield to any queued rendering and IO tasks, they
// would be better than imposing the 4ms delay of timers.
// However, they do not work reliably in Internet Explorer or Safari.

// Internet Explorer 10 is the only browser that has setImmediate but does
// not have MutationObservers.
// Although setImmediate yields to the browser's renderer, it would be
// preferrable to falling back to setTimeout since it does not have
// the minimum 4ms penalty.
// Unfortunately there appears to be a bug in Internet Explorer 10 Mobile (and
// Desktop to a lesser extent) that renders both setImmediate and
// MessageChannel useless for the purposes of ASAP.
// https://github.com/kriskowal/q/issues/396

// Timers are implemented universally.
// We fall back to timers in workers in most engines, and in foreground
// contexts in the following browsers.
// However, note that even this simple case requires nuances to operate in a
// broad spectrum of browsers.
//
// - Firefox 3-13
// - Internet Explorer 6-9
// - iPad Safari 4.3
// - Lynx 2.8.7
} else {
    requestFlush = makeRequestCallFromTimer(flush);
}

// `requestFlush` requests that the high priority event queue be flushed as
// soon as possible.
// This is useful to prevent an error thrown in a task from stalling the event
// queue if the exception handled by Node.js’s
// `process.on("uncaughtException")` or by a domain.
rawAsap.requestFlush = requestFlush;

// To request a high priority event, we induce a mutation observer by toggling
// the text of a text node between "1" and "-1".
function makeRequestCallFromMutationObserver(callback) {
    var toggle = 1;
    var observer = new BrowserMutationObserver(callback);
    var node = document.createTextNode("");
    observer.observe(node, {characterData: true});
    return function requestCall() {
        toggle = -toggle;
        node.data = toggle;
    };
}

// The message channel technique was discovered by Malte Ubl and was the
// original foundation for this library.
// http://www.nonblocking.io/2011/06/windownexttick.html

// Safari 6.0.5 (at least) intermittently fails to create message ports on a
// page's first load. Thankfully, this version of Safari supports
// MutationObservers, so we don't need to fall back in that case.

// function makeRequestCallFromMessageChannel(callback) {
//     var channel = new MessageChannel();
//     channel.port1.onmessage = callback;
//     return function requestCall() {
//         channel.port2.postMessage(0);
//     };
// }

// For reasons explained above, we are also unable to use `setImmediate`
// under any circumstances.
// Even if we were, there is another bug in Internet Explorer 10.
// It is not sufficient to assign `setImmediate` to `requestFlush` because
// `setImmediate` must be called *by name* and therefore must be wrapped in a
// closure.
// Never forget.

// function makeRequestCallFromSetImmediate(callback) {
//     return function requestCall() {
//         setImmediate(callback);
//     };
// }

// Safari 6.0 has a problem where timers will get lost while the user is
// scrolling. This problem does not impact ASAP because Safari 6.0 supports
// mutation observers, so that implementation is used instead.
// However, if we ever elect to use timers in Safari, the prevalent work-around
// is to add a scroll event listener that calls for a flush.

// `setTimeout` does not call the passed callback if the delay is less than
// approximately 7 in web workers in Firefox 8 through 18, and sometimes not
// even then.

function makeRequestCallFromTimer(callback) {
    return function requestCall() {
        // We dispatch a timeout with a specified delay of 0 for engines that
        // can reliably accommodate that request. This will usually be snapped
        // to a 4 milisecond delay, but once we're flushing, there's no delay
        // between events.
        var timeoutHandle = setTimeout(handleTimer, 0);
        // However, since this timer gets frequently dropped in Firefox
        // workers, we enlist an interval handle that will try to fire
        // an event 20 times per second until it succeeds.
        var intervalHandle = setInterval(handleTimer, 50);

        function handleTimer() {
            // Whichever timer succeeds will cancel both timers and
            // execute the callback.
            clearTimeout(timeoutHandle);
            clearInterval(intervalHandle);
            callback();
        }
    };
}

// This is for `asap.js` only.
// Its name will be periodically randomized to break any code that depends on
// its existence.
rawAsap.makeRequestCallFromTimer = makeRequestCallFromTimer;

// ASAP was originally a nextTick shim included in Q. This was factored out
// into this ASAP package. It was later adapted to RSVP which made further
// amendments. These decisions, particularly to marginalize MessageChannel and
// to capture the MutationObserver implementation in a closure, were integrated
// back into ASAP proper.
// https://github.com/tildeio/rsvp.js/blob/cddf7232546a9cf858524b75cde6f9edf72620a7/lib/rsvp/asap.js


}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],13:[function(require,module,exports){
(function (process){
"use strict";

var domain; // The domain module is executed on demand
var hasSetImmediate = typeof setImmediate === "function";

// Use the fastest means possible to execute a task in its own turn, with
// priority over other events including network IO events in Node.js.
//
// An exception thrown by a task will permanently interrupt the processing of
// subsequent tasks. The higher level `asap` function ensures that if an
// exception is thrown by a task, that the task queue will continue flushing as
// soon as possible, but if you use `rawAsap` directly, you are responsible to
// either ensure that no exceptions are thrown from your task, or to manually
// call `rawAsap.requestFlush` if an exception is thrown.
module.exports = rawAsap;
function rawAsap(task) {
    if (!queue.length) {
        requestFlush();
        flushing = true;
    }
    // Avoids a function call
    queue[queue.length] = task;
}

var queue = [];
// Once a flush has been requested, no further calls to `requestFlush` are
// necessary until the next `flush` completes.
var flushing = false;
// The position of the next task to execute in the task queue. This is
// preserved between calls to `flush` so that it can be resumed if
// a task throws an exception.
var index = 0;
// If a task schedules additional tasks recursively, the task queue can grown
// unbounded. To prevent memory excaustion, the task queue will periodically
// truncate already-completed tasks.
var capacity = 1024;

// The flush function processes all tasks that have been scheduled with
// `rawAsap` unless and until one of those tasks throws an exception.
// If a task throws an exception, `flush` ensures that its state will remain
// consistent and will resume where it left off when called again.
// However, `flush` does not make any arrangements to be called again if an
// exception is thrown.
function flush() {
    while (index < queue.length) {
        var currentIndex = index;
        // Advance the index before calling the task. This ensures that we will
        // begin flushing on the next task the task throws an error.
        index = index + 1;
        queue[currentIndex].call();
        // Prevent leaking memory for long chains of recursive calls to `asap`.
        // If we call `asap` within tasks scheduled by `asap`, the queue will
        // grow, but to avoid an O(n) walk for every task we execute, we don't
        // shift tasks off the queue after they have been executed.
        // Instead, we periodically shift 1024 tasks off the queue.
        if (index > capacity) {
            // Manually shift all values starting at the index back to the
            // beginning of the queue.
            for (var scan = 0; scan < index; scan++) {
                queue[scan] = queue[scan + index];
            }
            queue.length -= index;
            index = 0;
        }
    }
    queue.length = 0;
    index = 0;
    flushing = false;
}

rawAsap.requestFlush = requestFlush;
function requestFlush() {
    // Ensure flushing is not bound to any domain.
    // It is not sufficient to exit the domain, because domains exist on a stack.
    // To execute code outside of any domain, the following dance is necessary.
    var parentDomain = process.domain;
    if (parentDomain) {
        if (!domain) {
            // Lazy execute the domain module.
            // Only employed if the user elects to use domains.
            domain = require("domain");
        }
        domain.active = process.domain = null;
    }

    // `setImmediate` is slower that `process.nextTick`, but `process.nextTick`
    // cannot handle recursion.
    // `requestFlush` will only be called recursively from `asap.js`, to resume
    // flushing after an error is thrown into a domain.
    // Conveniently, `setImmediate` was introduced in the same version
    // `process.nextTick` started throwing recursion errors.
    if (flushing && hasSetImmediate) {
        setImmediate(flush);
    } else {
        process.nextTick(flush);
    }

    if (parentDomain) {
        domain.active = process.domain = parentDomain;
    }
}


}).call(this,require('_process'))
},{"_process":3,"domain":1}],14:[function(require,module,exports){
'use strict';

var Element = require('./element');
var ImageElement = require('./image-element');

var elementCount = 0, cache = {}, loaded;

module.exports = (function () {

    var ElementKit = function (options) {
        this.initialize(options);
    };
    ElementKit.prototype = {
        /**
         * Does a little setup for element kit.
         */
        initialize: function () {

            var self = this;
            // can only define the element property once or an exception will be thrown
            // must also check if element kit was loaded by some other module dependency
            if (!loaded && !document.body.kit) {
                // make element kit available on ALL DOM Elements when they are created
                loaded = Object.defineProperty(window.Element.prototype, 'kit', {
                    get: function () {
                        return self.setup(this);
                    }
                });
            }
        },

        /**
         * Sets up the kit on an element.
         * @param {HTMLElement} el - The element in which to load the kit onto
         * @returns {Element|ImageElement} Returns the element instance
         */
        setup: function (el) {
            var ElementClass;
            // only add a new instance of the class if it hasnt already been added
            if (!cache[el._kitId]) {
                ElementClass = el instanceof window.HTMLImageElement ? ImageElement : Element;
                elementCount++;
                el._kitId = elementCount;
                cache[el._kitId] = new ElementClass(el);
            }
            return cache[el._kitId];
        },
        /**
         * Destroys element kit.
         */
        destroy: function () {}

    };

    return new ElementKit();

})();
},{"./element":15,"./image-element":16}],15:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var ElementKit = require('./element-kit');

var Element = function (el) {
    this.initialize(el);
};

/**
 * A class from which all Elements are based.
 * @description Bootstraps an element to allow for native JS methods (see https://developer.mozilla.org/en-US/docs/Web/API/Element)
 * @class Element
 * @param {Element} el - The element
 */
Element.prototype = /** @lends Element */{

    initialize: function (el) {
        this.el = el;
        this.classList = this._getClassList();
        this._eventListenerMap = this._eventListenerMap || [];

        Object.defineProperty(this, 'dataset', {
            get: function () {
                return this.getData();
            }.bind(this)
        });
    },

    /**
     * Bubbles up each parent node of the element, triggering the callback on each element until traversal
     * either runs out of parent nodes, reaches the document element, or if callback returns a falsy value
     * @param {Function} callback - A callback that fires which gets passed the current element
     * @param {HTMLElement} [startEl] - The element where traversal will begin (including the passed element), defaults to current el
     * @private
     */
    _traverseEachParent: function (callback, startEl) {
        var parentNode = startEl || this.el,
            predicate;
        // check if the node has classname property, if not, we know we're at the #document element
        while (parentNode && typeof parentNode.className === 'string') {
            predicate = callback(parentNode);
            if (predicate !== undefined && !predicate) {
                break;
            }
            parentNode = parentNode.parentNode;
        }
    },

    /**
     * Wrap a parent container element around the element.
     * @param {string} html - The wrapper html
     */
    appendOuterHtml: function (html) {
        var parent = this.el.parentNode,
            container = utils.createHtmlElement(html);
        if (parent) {
            parent.replaceChild(container, this.el);
        } else {
            parent = document.createDocumentFragment();
            parent.appendChild(container);
        }
        container.appendChild(this.el);
        return container;
    },

    /**
     * Retrieves the unique identifier of the element.
     * @private
     */
    getUniqueId: function () {
        return this.el._kitId;
    },

    /**
     * Gets the closest ancestor element that has a css class.
     * @param {string} className - The class name that the ancestor must have to match
     */
    getClosestAncestorElementByClassName: function (className) {
        var result;
        this._traverseEachParent(function (parent) {
            if (parent.kit._hasClass(className)) {
                result = parent;
                return false;
            }
        }, this.el.parentNode);
        return result;
    },

    /**
     * Adds an event listener to the element.
     * @param {string} event - The event to listen to
     * @param {string|Function} listener - The name of the function (or the function itself) that should fire when the event happens
     * @param {Object} [context] - The context in which the function should be called
     * @param {Object} [options] - Object containing additional options
     * @param {Object} [options.useCapture] - Whether to use capture (see Web.API.EventTarget.addEventListener)
     */
    addEventListener: function (event, listener, context, options) {
        var _listener = listener;
        options = options || {};

        if (typeof _listener !== 'function') {
            _listener = this._createEventListener(context[listener], context);
        }

        this.el.addEventListener(event, _listener, options.useCapture);

        this._eventListenerMap.push({
            event: event,
            listener: _listener,
            listenerId: listener,
            context: context
        });
    },

    /**
     * Creates an event listener bounded to a context (useful for adding and removing events).
     * @param {Function} listener - The listener function
     * @param {Object} context - The context that should be used when the function is called
     * @returns {Function} Returns an event listener function bounded to the context
     * @private
     */
    _createEventListener: function (listener, context) {
        return function (e) {
            context = context || this;
            listener.apply(context, arguments);
        }
    },

    /**
     * Removes an event listener from the element.
     * @param {string} event - The event to remove
     * @param {string|Function} listener - The event listener function or (name of it) to be removed
     * @param {Object} [context] - The context of the listener that is being removed
     */
    removeEventListener: function (event, listener, context) {
        var map = this._eventListenerMap || [],
            i,
            obj;

        if (map.length) {
            for (i = 0; i < map.length; i++) {
                obj = map[i];
                if (obj && obj.event === event && obj.listenerId === listener && obj.context === context) {
                    this.el.removeEventListener(event, obj.listener);
                    this._eventListenerMap[i] = null;
                    break;
                }
            }
        }
    },

    /**
     * Builds a transition promise that waits to resolve until the el's CSS transition is completed.
     * @param {Function} callback - The callback that is fired when the transition time is complete
     * @returns {HTMLElement} Returns the html element
     */
    waitForTransition: function (callback) {
        var duration = this.getTransitionDuration();
        if (callback) {
            if (duration > 0) {
                setTimeout(callback.bind(this, this.el), duration);
            } else {
                callback(this.el);
            }
        }
    },

    /**
     * Gets the time is takes for the element to transition to its show state.
     * @returns {Number} Returns the total CSS transition time in milliseconds
     */
    getTransitionDuration: function () {
        var delayProp = this.getCssComputedProperty('transition-delay') || '0ms',
            durationProp = this.getCssComputedProperty('transition-duration') || '0ms',
            times = Array.isArray(durationProp) ? durationProp : [durationProp],
            delay = Array.isArray(delayProp) ? delayProp : [delayProp],
            highest = 0,
            map;

        times.push.apply(times, delay); // account for delay

        // calculate highest number of time
        times.forEach(function (value) {
            value.split(',').forEach(function (v) {
                v = this._convertCssTimeValueToMilliseconds(v);
                map = this._getCssPropUnitMap(v);
                if (map.num > highest) {
                    highest = map.num;
                }
            }.bind(this));
        }.bind(this));

        return highest;
    },

    /**
     * Gets the computed property of the element.
     * @param {string} prop - The name of the property to get
     * @returns {string} Returns the value of the property
     */
    getCssComputedProperty: function (prop) {
        var style = window.getComputedStyle(this.el);
        return style.getPropertyValue(prop) || this.el.style[this._getJsPropName(prop)];
    },

    /**
     * Takes a value and separates the number and unit into a key/value map.
     * @param v - The value
     * @returns {{num: Number, unit: string}} Returns the map
     * @private
     */
    _getCssPropUnitMap: function (v) {
        v.trim();
        var num = v.match('[0-9\.]+'),
            unit = 'ms';

        num = num ? num[0] : '';
        if (num) {
            unit = v.split(num)[1];
            num = Number(num);
        }
        return {
            num: num,
            unit: unit
        };
    },

    /**
     * Converts a css timing unit value into milliseconds.
     * @param {string} val - The value string
     * @returns {string} Returns the timing unit value in milliseconds
     * @private
     */
    _convertCssTimeValueToMilliseconds: function (val) {
        var number = this._getCssPropUnitMap(val).num,
            unit = val.replace(number, '');
        if (unit === 's') {
            val = number * 1000;
        } else {
            val = number;
        }
        return val + 'ms';
    },

    /**
     * Gets the class list of an element.
     * @returns {Array} Returns an array of class names.
     * @private
     */
    _getClassList: function () {
        return {
            add: this._addClass.bind(this),
            remove: this._removeClass.bind(this),
            contains: this._hasClass.bind(this),
            toggle: this._toggleClass.bind(this)
        };
    },

    /**
     * Gets the class list of an element.
     * @returns {Array} Returns an array of class names.
     * @private
     */
    _getCssClasses: function () {
        return this.el.className.split(' ');
    },

    /**
     * Toggles (adds/removes) a css class on the element.
     * @param {string} className - The css class value to add/remove
     * @private
     */
    _toggleClass: function (className) {
        if (!this._hasClass(className)) {
            this._addClass(className);
        } else {
            this._removeClass(className);
        }
    },

    /**
     * Adds a CSS class to the element.
     * @param {...string} arguments - The arguments containing css classes to add
     * @private
     */
    _addClass: function  () {
        if (('classList' in document.createElement('_'))) {
            // browser supports classList!
            this._each(arguments, function (className) {
                this.el.classList.add(className);
            }.bind(this));
        } else {
            this._each(arguments, function (className) {
                if (!this._hasClass(className)) {
                    this.el.className = this.el.className ? this.el.className + ' ' + className : className;
                }
            }.bind(this));
        }
    },

    /**
     * Triggers a callback function for a set of items.
     * @param {Array} items - An array of items
     * @param {Function} method - The function to execute for each item
     * @private
     */
    _each: function (items, method) {
        var count = items.length,
            i;
        for (i = 0; i < count; i++) {
            method(items[i]);
        }
    },

    /**
     * Removes a CSS class from the element.
     * @param {...string} arguments - The arguments containing css classes to remove
     * @private
     */
    _removeClass: function () {
        var re;
        if ('classList' in document.createElement('_')) {
            this._each(arguments, function (className) {
                this.el.classList.remove(className);
            }.bind(this));
        } else {
            this._each(arguments, function (className) {
                if (this.el.className === className) {
                    // if the only class that exists,  remove it and make empty string
                    this.el.className = '';
                } else {
                    re = '[\\s]*' + className;
                    re = new RegExp(re, 'i');
                    this.el.className = this.el.className.replace(re, '');
                }
            }.bind(this));
        }
    },

    /**
     * Checks if the element has a class.
     * @param {string} className - The css class value to check
     * @private
     */
    _hasClass: function (className) {
        var classes = this._getCssClasses();
        return classes.indexOf(className) !== -1;
    },

    /**
     * Takes a css property name and returns the javascript version of it.
     * @param {string} cssProp - The css property
     * @returns {string} Returns the javascript version
     * @private
     */
    _getJsPropName: function (cssProp) {
        // convert to camelCase
        cssProp = cssProp.replace(/-([a-z])/g, function (letter) {
            return letter[1].toUpperCase();
        });
        return cssProp;
    },

    /**
     * Gets a simplified mapping of all attributes of an element.
     * @returns {object} - Returns an object containing all attribute mappings
     */
    getAttributes: function () {
        var attrs = this.el.attributes,
            map = {};
        if (attrs.length) {
            for (var i = 0; i < attrs.length; i++) {
                map[attrs[i].name] = attrs[i].value;
            }
        }
        return map;
    },

    /**
     * Gets the elements current data attributes that have been assigned in the DOM.
     * @returns {{}}
     * @private
     */
    _getDomData: function () {
        var attrs = this.getAttributes(), data = {}, key, value;
        for (key in attrs) {
            if (attrs.hasOwnProperty(key)) {
                value = attrs[key];
                if (key.indexOf('data-') === 0) {
                    // data attribute found!
                    key = key.substr(5);
                    data[key] = value;
                }
            }
        }
        return data;
    },

    /**
     * Returns an object of the element's current data attributes.
     * @returns {*|{}}
     */
    getData: function () {
        var key;

        this._data = utils.extend({}, this._data, this._getDomData());

        // convert all current data properties to be "watchable".
        for (key in this._data) {
            if (this._data.hasOwnProperty(key)) {
                var value = this._data[key];
                // TODO: we should only convert it if it isnt already a "watchable" obj
                Object.defineProperty(this._data, key, {
                    writeable: true,
                    get: function () {
                        return value;
                    }.bind(this),
                    set: function (value) {
                        this.setData.bind(this, key, value)
                    }.bind(this)
                });
            }
        }
        return this._data;

    },

    /**
     * When data is being set.
     * @param {string} key - The key of which to be set
     * @param {*} value - The value
     */
    setData: function (key, value) {
        this.el.setAttribute('data-' + key, value);
        this._data[key] = value;

    },

    /**
     * Destroys the kit on the element.
     */
    destroy: function () {}
};

module.exports = Element;
},{"./element-kit":14,"./utils":17}],16:[function(require,module,exports){
'use strict';

var utils = require('./utils');
var Element = require('./element');
var Promise = require('promise');

/**
 * A class from which all image elements are based.
 * @class ImageElement
 * @param {Element} el - The element
 * @todo: find a more simple way to extend Element class along with its prototypes
 */
var ImageElement = function (el) {
    Element.prototype.initialize.call(this, el);
};
ImageElement.prototype = utils.extend({}, Element.prototype, {
    /**
     * Loads the image asset from a provided source url.
     * @param {string} src - The attribute on the element which has the image source url or any url
     */
    load: function (src) {

        src = this.el.getAttribute(src) || src;

        if (!src) {
            console.warn('ElementKit error: undefined was passed to load() call');
            return Promise.resolve();
        }

        if (src.indexOf(',') !== -1) {
            // image is a srcset!
            src = this._getImageSourceSetPath(src);
        }
        return this._loadImage(src);
    },

    /**
     * Loads an image in a virtual DOM which will be cached in the browser and shown.
     * @param {string} src - The image source url
     * @private
     * @returns {Promise}
     */
    _loadImage: function (src) {
        var img = this.el;
        return new Promise(function (resolve, reject) {
            img.onload = function () {
                resolve(img);
            };
            img.onerror = function () {
                reject(new Error('ImageElement error: image path "' + src + '" returned an error'));
            };
            img.src = src;
        });
    },

    /**
     * Sniffs srcset attribute and detects the images viewport size to return the correct source image to display
     * FYI: browsers do have this functionality natively but some of them have it turned by default (Firefox, IE, etc)
     * @param {string} srcSet - The source set attribute
     * @returns {string} Returns the source image path
     * @private
     */
    _getImageSourceSetPath: function (srcSet) {
        var viewportWidth = window.innerWidth,
            viewportHeight = window.innerHeight,
            src,
            widthHeightMap,
            width,
            height,
            found;
        srcSet.split(',').forEach(function (str) {
            widthHeightMap = this._buildSourceMapWidthHeight(str);
            width = widthHeightMap.width || 0;
            height = widthHeightMap.height || 0;
            if (!found && viewportWidth >= width && viewportHeight >= height) {
                src = str.split(' ')[0];
                found = true;
            }
        }.bind(this));
        return src;
    },

    /**
     * Builds a mapping of width and height within a srcset attribute.
     * @param {String} str - The srcset attribute string
     * @param {Object} [map] - The object that width and height keys will be attached to
     * @returns {*|{}}
     * @private
     */
    _buildSourceMapWidthHeight: function (str, map) {
        var frags = str.split(' '),
            attrId,
            getNumber = function (frag) {
                return Number(frag.substr(0, frag.length - 1))
            };

        map = map || {};

        frags.shift(); // remove first item since we know it is the filename

        frags.forEach(function (frag) {
            attrId = frag.charAt(frag.length - 1);
            if (attrId === 'w') {
                map.width = getNumber(frag);
            } else if (attrId === 'h') {
                map.height = getNumber(frag);
            }
        });
        return map;
    }

});

module.exports = ImageElement;
},{"./element":15,"./utils":17,"promise":4}],17:[function(require,module,exports){
module.exports = {
    /**
     * Creates an HTML Element from an html string.
     * @param {string} html - String of html
     * @returns {HTMLElement} - Returns and html element node
     */
    createHtmlElement: function (html) {
        var tempParentEl,
            el;
        if (html) {
            html = html.trim(html);
            tempParentEl = document.createElement('div');
            tempParentEl.innerHTML = html;
            el = tempParentEl.childNodes[0];
            return tempParentEl.removeChild(el);
        }
    },

    /**
     * Merges the contents of two or more objects.
     * @param {object} obj - The target object
     * @param {...object} - Additional objects who's properties will be merged in
     */
    extend: function (target) {
        var merged = target,
            source, i;
        for (i = 1; i < arguments.length; i++) {
            source = arguments[i];
            for (var prop in source) {
                if (source.hasOwnProperty(prop)) {
                    merged[prop] = source[prop];
                }
            }
        }
        return merged;
    },

    /**
     * Triggers a method on an html collection.
     * @param {HTMLCollection} els - A collection of elements
     * @param {string} method - The method to call on each of the elements
     * @param {Array} [params] - An array of parameters in which the pass to the method
     */
    triggerHtmlCollectionMethod: function (els, method, params) {
        var count = els.length,
            i, el;
        for (i = 0; i < count; i++) {
            el = els[i];
            el.kit[method].apply(el.kit, params);
        }
    }
};
},{}]},{},[14,15,16,17]);
