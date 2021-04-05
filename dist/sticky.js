(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.StickySidebar = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};



function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

/**
 * Returns a function, that, as long as it continues to be invoked, will not
 * be triggered. The function will be called after it stops being called for
 * N milliseconds. If `immediate` is passed, trigger the function on the
 * leading edge, instead of the trailing. The function also has a property 'clear' 
 * that is a function which will clear the timer to prevent previously scheduled executions. 
 *
 * @source underscore.js
 * @see http://unscriptable.com/2009/03/20/debouncing-javascript-methods/
 * @param {Function} function to wrap
 * @param {Number} timeout in ms (`100`)
 * @param {Boolean} whether to execute at the beginning (`false`)
 * @api public
 */
function debounce(func, wait, immediate){
  var timeout, args, context, timestamp, result;
  if (null == wait) wait = 100;

  function later() {
    var last = Date.now() - timestamp;

    if (last < wait && last >= 0) {
      timeout = setTimeout(later, wait - last);
    } else {
      timeout = null;
      if (!immediate) {
        result = func.apply(context, args);
        context = args = null;
      }
    }
  }

  var debounced = function(){
    context = this;
    args = arguments;
    timestamp = Date.now();
    var callNow = immediate && !timeout;
    if (!timeout) timeout = setTimeout(later, wait);
    if (callNow) {
      result = func.apply(context, args);
      context = args = null;
    }

    return result;
  };

  debounced.clear = function() {
    if (timeout) {
      clearTimeout(timeout);
      timeout = null;
    }
  };
  
  debounced.flush = function() {
    if (timeout) {
      result = func.apply(context, args);
      context = args = null;
      
      clearTimeout(timeout);
      timeout = null;
    }
  };

  return debounced;
}

// Adds compatibility for ES modules
debounce.debounce = debounce;

var debounce_1 = debounce;

var sticky = createCommonjsModule(function (module, exports) {
(function (global, factory) {
  if (typeof undefined === "function" && undefined.amd) {
    undefined(['exports', 'debounce'], factory);
  } else {
    factory(exports, debounce_1);
  }
})(commonjsGlobal, function (exports, _debounce) {
  Object.defineProperty(exports, "__esModule", {
    value: true
  });

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  var _createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  /**
   * Sticky Sidebar JavaScript Plugin.
   * @version 3.3.4
   * @author Ahmed Bouhuolia <a.bouhuolia@gmail.com>
   * @license The MIT License (MIT)
   */
  var StickySidebar = function () {

    // ---------------------------------
    // # Define Constants
    // ---------------------------------
    //
    var EVENT_KEY = '.stickySidebar';
    var DEFAULTS = {
      /**
       * Additional top spacing of the element when it becomes sticky.
       * @type {Number|Function}
       */
      topSpacing: 0,

      /**
       * Additional bottom spacing of the element when it becomes sticky.
       * @type {Number|Function}
       */
      bottomSpacing: 0,

      /**
       * Container sidebar selector to know what the beginning and end of sticky element.
       * @type {String|HTMLElement|false}
       */
      container: false,

      /**
       * Inner wrapper selector.
       * @type {String}
       */
      innerWrapper: '.inner-wrapper-sticky',

      /**
       * The name of CSS class to apply to elements when they have become stuck.
       * @type {String|false}
       */
      stickyClass: 'is-affixed',

      /**
       * Detect when sidebar and its container change height so re-calculate their dimensions.
       * @type {Boolean}
       */
      resizeSensor: true,

      /**
       * The sidebar returns to its normal position if its width below this value.
       * @type {Number}
       */
      minWidth: 0
    };

    // ---------------------------------
    // # Class Definition
    // ---------------------------------
    //
    /**
     * Sticky Sidebar Class.
     * @public
     */

    var StickySidebar = function () {

      /**
       * Sticky Sidebar Constructor.
       * @constructor
       * @param {HTMLElement|String} sidebar - The sidebar element or sidebar selector.
       * @param {Object} options - The options of sticky sidebar.
       */
      function StickySidebar(sidebar) {
        var _this = this;

        var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

        _classCallCheck(this, StickySidebar);

        this.options = StickySidebar.extend(DEFAULTS, options);

        // Sidebar element query if there's no one, throw error.
        this.sidebar = 'string' === typeof sidebar ? document.querySelector(sidebar) : sidebar;
        if ('undefined' === typeof this.sidebar) {
          throw new Error('There is no specific sidebar element.');
        }

        this.sidebarInner = false;
        this.container = this.sidebar.parentElement;

        // Current Affix Type of sidebar element.
        this.affixedType = 'STATIC';
        this.direction = 'down';
        this.support = {
          transform: false,
          transform3d: false
        };

        this._initialized = false;
        this._reStyle = false;
        this._breakpoint = false;

        // Dimensions of sidebar, container and screen viewport.
        this.dimensions = {
          translateY: 0,
          maxTranslateY: 0,
          topSpacing: 0,
          lastTopSpacing: 0,
          bottomSpacing: 0,
          lastBottomSpacing: 0,
          sidebarTop: 0,
          sidebarHeight: 0,
          sidebarWidth: 0,
          containerTop: 0,
          containerHeight: 0,
          viewportHeight: 0,
          viewportTop: 0,
          lastViewportTop: 0
        };

        // Bind event handlers for referencability.
        // ['handleEvent'].forEach( (method) => {
        //   this[method] = this[method].bind(this);
        // });
        this.handleEvent = this.handleEvent.bind(this);
        this.handleEventDebounce = (0, _debounce.debounce)(this.handleEvent, 100);

        if (StickySidebar.supportResizeObserver()) {
          this.resizeObserver = new ResizeObserver(function () {
            _this.handleEventDebounce();
          });
        }

        // Initialize sticky sidebar for first time.
        this.initialize();
      }

      /**
       * Initializes the sticky sidebar by adding inner wrapper, define its container,
       * min-width breakpoint, calculating dimensions, adding helper classes and inline style.
       * @private
       */


      _createClass(StickySidebar, [{
        key: 'initialize',
        value: function initialize() {
          var _this2 = this;

          this._setSupportFeatures();

          // Get sticky sidebar inner wrapper, if not found, will create one.
          if (this.options.innerWrapper) {
            if (typeof this.options.innerWrapper === 'string') {
              this.sidebarInner = this.sidebar.querySelector(this.options.innerWrapper);

              if (null === this.sidebarInner) this.sidebarInner = false;
            } else {
              this.sidebarInner = this.options.innerWrapper;
            }
          }

          if (!this.sidebarInner) {
            var wrapper = document.createElement('div');
            wrapper.setAttribute('class', 'inner-wrapper-sticky');
            this.sidebar.appendChild(wrapper);

            while (this.sidebar.firstChild !== wrapper) {
              wrapper.appendChild(this.sidebar.firstChild);
            }this.sidebarInner = wrapper;
          }

          // Container wrapper of the sidebar.
          if (this.options.container) {
            if (typeof this.options.container === 'string') {
              var containers = document.querySelectorAll(this.options.container);
              containers = Array.prototype.slice.call(containers);

              containers.forEach(function (container) {
                if (!container.contains(_this2.sidebar)) return;
                _this2.container = container;
              });

              if (!containers.length) throw new Error('The container does not contains on the sidebar.');
            } else {
              this.container = this.options.container;
            }
          }

          // If top/bottom spacing is not function parse value to integer.
          if ('function' !== typeof this.options.topSpacing) {
            this.options.topSpacing = parseInt(this.options.topSpacing) || 0;
          }

          if ('function' !== typeof this.options.bottomSpacing) {
            this.options.bottomSpacing = parseInt(this.options.bottomSpacing) || 0;
          }

          // Breakdown sticky sidebar if screen width below `options.minWidth`.
          this._widthBreakpoint();

          // Calculate dimensions of sidebar, container and viewport.
          this.calcDimensions();

          // Affix sidebar in proper position.
          this.stickyPosition();

          // Bind all events.
          this.bindEvents();

          // Inform other properties the sticky sidebar is initialized.
          this._initialized = true;
          this._enabled = true;
        }
      }, {
        key: 'bindEvents',
        value: function bindEvents() {
          if (this.eventBinded) {
            return;
          }
          this.eventBinded = true;

          window.addEventListener('resize', this.handleEventDebounce, { passive: true, capture: false });
          this.addScrollEvent();

          this.sidebar.addEventListener('update' + EVENT_KEY, this.handleEvent);

          if (StickySidebar.supportResizeObserver()) {
            this.resizeObserver.observe(this.sidebarInner);
            this.resizeObserver.observe(this.container);
          } else {
            if (this.options.resizeSensor && 'undefined' !== typeof ResizeSensor) {
              new ResizeSensor(this.sidebarInner, this.handleEventDebounce);
              new ResizeSensor(this.container, this.handleEventDebounce);
            }
          }
        }
      }, {
        key: 'removeEvents',
        value: function removeEvents() {
          this.eventBinded = false;
          this.handleEventDebounce.clear();

          window.removeEventListener('resize', this.handleEventDebounce);
          this.removeScrollEvent();

          this.sidebar.removeEventListener('update' + EVENT_KEY, this.handleEvent);

          if (StickySidebar.supportResizeObserver()) {
            this.resizeObserver.unobserve(this.sidebarInner);
            this.resizeObserver.unobserve(this.container);
          } else {
            if (this.options.resizeSensor && 'undefined' !== typeof ResizeSensor) {
              ResizeSensor.detach(this.sidebarInner, this.handleEventDebounce);
              ResizeSensor.detach(this.container, this.handleEventDebounce);
            }
          }
        }
      }, {
        key: 'addScrollEvent',
        value: function addScrollEvent() {
          if (!this.isScrollEventAdded) {
            window.addEventListener('scroll', this.handleEvent, { passive: true, capture: false });
            this.isScrollEventAdded = true;
          }
        }
      }, {
        key: 'removeScrollEvent',
        value: function removeScrollEvent() {
          if (!!this.isScrollEventAdded) {
            window.removeEventListener('scroll', this.handleEvent, { capture: false });
            this.isScrollEventAdded = false;
          }
        }
      }, {
        key: 'handleEvent',
        value: function handleEvent(event) {
          this.updateSticky(event);
        }
      }, {
        key: 'calcDimensions',
        value: function calcDimensions() {
          if (this._breakpoint) {
            return;
          }
          var dims = this.dimensions;
          this.resetStyles();

          // Container of sticky sidebar dimensions.
          dims.containerTop = StickySidebar.offsetRelative(this.container).top;
          dims.containerHeight = this.container.clientHeight;
          dims.containerInnerHeight = parseInt(window.getComputedStyle(this.container).height, 10);
          dims.containerBottom = dims.containerTop + dims.containerHeight;

          // Sidebar dimensions.
          dims.sidebarTop = StickySidebar.offsetRelative(this.sidebarInner).top;
          dims.sidebarHeight = this.sidebarInner.offsetHeight;
          dims.sidebarWidth = this.sidebarInner.offsetWidth;

          // Screen viewport dimensions.
          dims.viewportHeight = window.innerHeight;

          // Maximum sidebar translate Y.
          dims.maxTranslateY = dims.containerHeight - dims.sidebarHeight;

          this._calcDimensionsWithScroll();
        }
      }, {
        key: '_calcDimensionsWithScroll',
        value: function _calcDimensionsWithScroll() {
          var dims = this.dimensions;
          if (dims.containerInnerHeight === dims.sidebarHeight) {
            return;
          }

          dims.sidebarLeft = StickySidebar.offsetRelative(this.sidebar).left;

          dims.viewportTop = document.documentElement.scrollTop || document.body.scrollTop;
          dims.viewportBottom = dims.viewportTop + dims.viewportHeight;
          dims.viewportLeft = document.documentElement.scrollLeft || document.body.scrollLeft;

          dims.topSpacing = this.options.topSpacing;
          dims.bottomSpacing = this.options.bottomSpacing;

          if ('function' === typeof dims.topSpacing) {
            dims.topSpacing = parseInt(dims.topSpacing(this.sidebar)) || 0;
          }

          if ('function' === typeof dims.bottomSpacing) {
            dims.bottomSpacing = parseInt(dims.bottomSpacing(this.sidebar)) || 0;
          }

          if ('VIEWPORT-TOP' === this.affixedType) {
            // Adjust translate Y in the case decrease top spacing value.
            if (dims.topSpacing < dims.lastTopSpacing) {
              dims.translateY += dims.lastTopSpacing - dims.topSpacing;
              this._reStyle = true;
            }
          } else if ('VIEWPORT-BOTTOM' === this.affixedType) {
            // Adjust translate Y in the case decrease bottom spacing value.
            if (dims.bottomSpacing < dims.lastBottomSpacing) {
              dims.translateY += dims.lastBottomSpacing - dims.bottomSpacing;
              this._reStyle = true;
            }
          }

          dims.lastTopSpacing = dims.topSpacing;
          dims.lastBottomSpacing = dims.bottomSpacing;
        }
      }, {
        key: 'isSidebarFitsViewport',
        value: function isSidebarFitsViewport() {
          var dims = this.dimensions;
          var offset = this.scrollDirection === 'down' ? dims.lastBottomSpacing : dims.lastTopSpacing;
          return this.dimensions.sidebarHeight + offset < this.dimensions.viewportHeight;
        }
      }, {
        key: 'observeScrollDir',
        value: function observeScrollDir() {
          var dims = this.dimensions;
          if (dims.lastViewportTop === dims.viewportTop) {
            return;
          }

          var furthest = 'down' === this.direction ? Math.min : Math.max;

          // If the browser is scrolling not in the same direction.
          if (dims.viewportTop === furthest(dims.viewportTop, dims.lastViewportTop)) {
            this.direction = 'down' === this.direction ? 'up' : 'down';
          }
        }
      }, {
        key: 'getAffixType',
        value: function getAffixType() {
          var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          this._calcDimensionsWithScroll();
          var dims = this.dimensions;
          var colliderTop = dims.viewportTop + dims.topSpacing;
          var affixType = this.affixedType;

          if (colliderTop <= dims.sidebarTop || dims.containerHeight <= dims.sidebarHeight) {
            dims.translateY = 0;
            affixType = 'STATIC';
          } else if (force) {
            affixType = this._getAffixTypeScrollingDown();
          } else {
            affixType = 'up' === this.direction ? this._getAffixTypeScrollingUp() : this._getAffixTypeScrollingDown();
          }

          // Make sure the translate Y is not bigger than container height.
          dims.translateY = Math.max(0, dims.translateY);
          dims.translateY = Math.min(dims.containerHeight, dims.translateY);
          dims.translateY = Math.round(dims.translateY);

          dims.lastViewportTop = dims.viewportTop;

          return affixType;
        }
      }, {
        key: '_getAffixTypeScrollingDown',
        value: function _getAffixTypeScrollingDown() {
          var dims = this.dimensions;
          var sidebarBottom = dims.sidebarHeight + dims.sidebarTop;
          var colliderTop = dims.viewportTop + dims.topSpacing;
          var colliderBottom = dims.viewportBottom - dims.bottomSpacing;
          var affixType = this.affixedType;

          if (this.isSidebarFitsViewport()) {
            if (dims.sidebarHeight + colliderTop >= dims.containerBottom) {
              dims.translateY = dims.containerBottom - sidebarBottom;
              affixType = 'CONTAINER-BOTTOM';
            } else if (colliderTop >= dims.sidebarTop) {
              dims.translateY = colliderTop - dims.sidebarTop;
              affixType = 'VIEWPORT-TOP';
            }
          } else {
            if (dims.containerBottom <= colliderBottom) {
              dims.translateY = dims.containerBottom - sidebarBottom;
              affixType = 'CONTAINER-BOTTOM';
            } else if (sidebarBottom + dims.translateY <= colliderBottom) {
              dims.translateY = colliderBottom - sidebarBottom;
              affixType = 'VIEWPORT-BOTTOM';
            } else if (dims.sidebarTop + dims.translateY <= colliderTop && 0 !== dims.translateY && dims.maxTranslateY !== dims.translateY) {
              affixType = 'VIEWPORT-UNBOTTOM';
            }
          }

          return affixType;
        }
      }, {
        key: '_getAffixTypeScrollingUp',
        value: function _getAffixTypeScrollingUp() {
          var dims = this.dimensions;
          var sidebarBottom = dims.sidebarHeight + dims.sidebarTop;
          var colliderTop = dims.viewportTop + dims.topSpacing;
          var colliderBottom = dims.viewportBottom - dims.bottomSpacing;
          var affixType = this.affixedType;

          if (colliderTop <= dims.translateY + dims.sidebarTop) {
            dims.translateY = colliderTop - dims.sidebarTop;
            affixType = 'VIEWPORT-TOP';
          } else if (dims.containerBottom <= colliderBottom) {
            dims.translateY = dims.containerBottom - sidebarBottom;
            affixType = 'CONTAINER-BOTTOM';
          } else if (!this.isSidebarFitsViewport()) {
            if (dims.sidebarTop <= colliderTop && 0 !== dims.translateY && dims.maxTranslateY !== dims.translateY) {
              affixType = 'VIEWPORT-UNBOTTOM';
            }
          }

          return affixType;
        }
      }, {
        key: '_getStyle',
        value: function _getStyle(affixType) {
          if ('undefined' === typeof affixType) {
            return;
          }

          var style = { inner: {}, outer: {} };
          var dims = this.dimensions;

          switch (affixType) {
            case 'VIEWPORT-TOP':
              style.inner = {
                position: 'fixed', top: dims.topSpacing,
                left: dims.sidebarLeft - dims.viewportLeft, width: dims.sidebarWidth
              };
              break;
            case 'VIEWPORT-BOTTOM':
              style.inner = {
                position: 'fixed', top: 'auto', left: dims.sidebarLeft,
                bottom: dims.bottomSpacing, width: dims.sidebarWidth
              };
              break;
            case 'CONTAINER-BOTTOM':
            case 'VIEWPORT-UNBOTTOM':
              var translate = this._getTranslate(0, dims.translateY + 'px');
              if (translate) {
                style.inner = { transform: translate };
              } else {
                style.inner = { position: 'absolute', top: dims.translateY, width: dims.sidebarWidth };
              }
              break;
          }

          switch (affixType) {
            case 'VIEWPORT-TOP':
            case 'VIEWPORT-BOTTOM':
            case 'VIEWPORT-UNBOTTOM':
            case 'CONTAINER-BOTTOM':
              style.outer = { height: dims.sidebarHeight, position: 'relative' };
              break;
          }

          style.outer = StickySidebar.extend({ height: '', position: '' }, style.outer);
          style.inner = StickySidebar.extend({
            position: 'relative', top: '', left: '',
            bottom: '', width: '', transform: ''
          }, style.inner);

          return style;
        }
      }, {
        key: 'stickyPosition',
        value: function stickyPosition() {
          var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

          var dims = this.dimensions;
          if (this._breakpoint) {
            return;
          }
          if (dims.containerInnerHeight <= dims.sidebarHeight) {
            this.removeScrollEvent();
            return;
          } else {
            this.addScrollEvent();
          }

          force = this._reStyle || force || false;

          var offsetTop = this.options.topSpacing;
          var offsetBottom = this.options.bottomSpacing;

          var affixType = this.getAffixType(force);
          var style = this._getStyle(affixType);

          if ((this.affixedType !== affixType || force) && affixType) {
            var affixEvent = 'affix.' + affixType.toLowerCase().replace('viewport-', '') + EVENT_KEY;
            StickySidebar.eventTrigger(this.sidebar, affixEvent);

            if ('STATIC' === affixType) StickySidebar.removeClass(this.sidebar, this.options.stickyClass);else StickySidebar.addClass(this.sidebar, this.options.stickyClass);

            for (var key in style.outer) {
              var unit = 'number' === typeof style.outer[key] ? 'px' : '';
              this.sidebar.style[key] = style.outer[key] + unit;
            }

            for (var _key in style.inner) {
              var _unit = 'number' === typeof style.inner[_key] ? 'px' : '';
              this.sidebarInner.style[_key] = style.inner[_key] + _unit;
            }

            var affixedEvent = 'affixed.' + affixType.toLowerCase().replace('viewport-', '') + EVENT_KEY;
            StickySidebar.eventTrigger(this.sidebar, affixedEvent);
          } else if (this._initialized) {
            this.sidebarInner.style.left = style.inner.left;
          }

          this.affixedType = affixType;
        }
      }, {
        key: '_widthBreakpoint',
        value: function _widthBreakpoint() {
          if (window.innerWidth <= this.options.minWidth) {
            this._breakpoint = true;
            this.affixedType = 'STATIC';

            this.sidebar.removeAttribute('style');
            StickySidebar.removeClass(this.sidebar, this.options.stickyClass);
            this.sidebarInner.removeAttribute('style');
          } else {
            this._breakpoint = false;
          }
        }
      }, {
        key: 'updateSticky',
        value: function updateSticky() {
          var _this3 = this;

          var event = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : { type: 'resize' };

          if (!this._enabled || this._running) {
            return;
          }
          this._running = true;

          (function (eventType) {
            requestAnimationFrame(function () {
              if (!_this3._enabled) {
                _this3._running = false;
                return;
              }
              switch (eventType) {
                // When browser is scrolling and re-calculate just dimensions
                // within scroll.
                case 'scroll':
                  _this3._calcDimensionsWithScroll();
                  _this3.observeScrollDir();
                  _this3.stickyPosition();
                  break;

                // When browser is resizing or there's no event, observe width
                // breakpoint and re-calculate dimensions.
                case 'resize':
                default:
                  _this3._widthBreakpoint();
                  _this3.calcDimensions();
                  _this3.stickyPosition(true);
                  _this3.bindEvents();
                  break;
              }
              _this3._running = false;
            });
          })(event.type);
        }
      }, {
        key: '_setSupportFeatures',
        value: function _setSupportFeatures() {
          var support = this.support;

          support.transform = StickySidebar.supportTransform();
          // support.transform3d = StickySidebar.supportTransform(true);
        }
      }, {
        key: '_getTranslate',
        value: function _getTranslate() {
          var y = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
          var x = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;

          // if( this.support.transform3d ) return 'translate3d(' + y +', '+ x +', '+ z +')';
          // else
          if (this.support.transform) {
            return 'translate(' + y + ', ' + x + ')';
          } else {
            return false;
          }
        }
      }, {
        key: 'restart',
        value: function restart() {
          this._enabled = true;
          this.updateSticky();
        }
      }, {
        key: 'destroy',
        value: function destroy() {
          this._enabled = false;

          this.sidebar.classList.remove(this.options.stickyClass);
          this.sidebar.style.minHeight = '';
          this.resetStyles();
          this.removeEvents();
        }
      }, {
        key: 'resetStyles',
        value: function resetStyles() {
          var styleReset = { inner: {}, outer: {} };

          styleReset.inner = { position: '', top: '', left: '', bottom: '', width: '', transform: '' };
          styleReset.outer = { height: '', position: '' };

          for (var key in styleReset.outer) {
            this.sidebar.style[key] = styleReset.outer[key];
          }for (var _key2 in styleReset.inner) {
            this.sidebarInner.style[_key2] = styleReset.inner[_key2];
          }
        }
      }], [{
        key: 'supportTransform',
        value: function supportTransform(transform3d) {
          var result = false,
              property = transform3d ? 'perspective' : 'transform',
              upper = property.charAt(0).toUpperCase() + property.slice(1),
              prefixes = ['Webkit', 'Moz', 'O', 'ms'],
              support = document.createElement('support'),
              style = support.style;

          (property + ' ' + prefixes.join(upper + ' ') + upper).split(' ').forEach(function (property, i) {
            if (!result && style[property] !== undefined) {
              result = property;
            }
          });
          return result;
        }
      }, {
        key: 'supportResizeObserver',
        value: function supportResizeObserver() {
          return 'ResizeObserver' in window;
        }
      }, {
        key: 'eventTrigger',
        value: function eventTrigger(element, eventName, data) {
          try {
            var event = new CustomEvent(eventName, { detail: data });
          } catch (e) {
            var event = document.createEvent('CustomEvent');
            event.initCustomEvent(eventName, true, true, data);
          }
          element.dispatchEvent(event);
        }
      }, {
        key: 'extend',
        value: function extend(defaults, options) {
          var results = {};
          for (var key in defaults) {
            if ('undefined' !== typeof options[key]) {
              results[key] = options[key];
            } else {
              results[key] = defaults[key];
            }
          }
          return results;
        }
      }, {
        key: 'offsetRelative',
        value: function offsetRelative(element) {
          var rect = element.getBoundingClientRect();
          var documentElement = document.documentElement;
          var top = rect.top + window.pageYOffset - documentElement.clientTop;
          var left = rect.left + window.pageXOffset - documentElement.clientLeft;
          return { top: top, left: left };
        }
      }, {
        key: 'addClass',
        value: function addClass(element, className) {
          if (!StickySidebar.hasClass(element, className)) {
            if (element.classList) {
              element.classList.add(className);
            } else {
              element.className += ' ' + className;
            }
          }
        }
      }, {
        key: 'removeClass',
        value: function removeClass(element, className) {
          if (StickySidebar.hasClass(element, className)) {
            if (element.classList) {
              element.classList.remove(className);
            } else {
              element.className = element.className.replace(new RegExp('(^|\\b)' + className.split(' ').join('|') + '(\\b|$)', 'gi'), ' ');
            }
          }
        }
      }, {
        key: 'hasClass',
        value: function hasClass(element, className) {
          if (element.classList) return element.classList.contains(className);else return new RegExp('(^| )' + className + '( |$)', 'gi').test(element.className);
        }
      }, {
        key: 'defaults',
        get: function () {
          return DEFAULTS;
        }
      }]);

      return StickySidebar;
    }();

    return StickySidebar;
  }();

  exports.default = StickySidebar;


  // Global
  // -------------------------
  window.StickySidebar = StickySidebar;
});
});

var sticky$1 = unwrapExports(sticky);

return sticky$1;

})));

//# sourceMappingURL=sticky.js.map
