'use strict';

// Utils file reference
// utils at: https://assets.codepen.io/573855/lr-codepen-utils.js

/* GSAP Plugins Registration */
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

/* ScrollTrigger Configuration */
// Configures ScrollTrigger for optimized performance and mobile responsiveness
ScrollTrigger.config({
    limitCallbacks: true, // Limits the frequency of callback invocations for performance
    ignoreMobileResize: true, // Ignores resize events on mobile devices to prevent trigger misfires
    // autoRefreshEvents: ''
});

/* GSAP ScrollSmoother Initialization */
var scroller = (function() {
    // Ensure gsap and ScrollSmoother are defined, and device isn't touch-enabled
    if (typeof gsap === 'undefined' || typeof ScrollSmoother === 'undefined' || utils.isTouch()) {
        utils.addClass(document.body, 'normalize-scroll');
        return null;
    }

    // Public API
    return {
        initialize: function(contentSelector_, wrapperSelector_) {
            return ScrollSmoother.create({
                content: contentSelector_ || '.content-scroll',
                wrapper: wrapperSelector_ || '.viewport-wrapper',
                smooth: 2,
                effects: false,
                normalizeScroll: true,
                preventDefault: true
            });
        }
    };
})();

/* GSAP and Swiper Integration: gsapSwiper */
var gsapSwiper = {

    // Updates the swiper's state based on a progress value
    updateSwiperStateByProgress: function(progress_) {
        // Early return if Swiper is not initialized or the _swiper property is not set
        if (!this._swiper || !this._swiperInitialized) return;

        // Clamp progress value between 0 and 1
        progress_ = isNaN(progress_) ? 0 : Math.min(Math.max(progress_, 0), 1);

        // If scrubDir option is set to reverse (-1), invert progress
        if (this._options.scrubDir === -1) {
            progress_ = 1 - progress_;
        }

        // Calculate min and max translation values for the Swiper
        var minTranslation = this._swiper.minTranslate();
        var maxTranslation = this._swiper.maxTranslate();

        // Compute the current translation value based on the progress
        var currentTranslation = (maxTranslation - minTranslation) * progress_ + minTranslation;

        // Translate the Swiper to the calculated position without any transition duration
        this._swiper.translateTo(currentTranslation, 0);

        // Update the Swiper's active index and slide classes to reflect the change
        this._swiper.updateActiveIndex();
        this._swiper.updateSlidesClasses();

    },

    _initializeGsapAnimation: function() {
        if (this._isScrubActive && !this._gsapAnimation) {
            var self = this;
            this._gsapAnimation = gsap.to(this, {
                updateSwiperStateByProgress: 1,
                duration: 1,
                ease: 'none',
                scrollTrigger: {
                    id: 'pin-' + this._id.replace('_', '-'), // Replace '_' with '-' in this._id
                    trigger: this.DOM.trigger, // Element that triggers the scroll animation
                    pin: this.DOM.pin, // Element to pin during the scroll animation
                    pinSpacing: true, // Add spacing for the pinned element
                    scrub: 0.1, // Smooth scrubbing effect with 0.1 seconds lag
                    invalidateOnRefresh: true,
                    onRefreshInit: function() {
                        // Adjust Swiper size and update state on ScrollTrigger refresh initialization
                        if (self._swiper && self._swiperInitialized) {
                            self._swiper.updateSize(); // Update Swiper dimensions
                            self._update(); // Custom update method to adjust Swiper settings or animations
                        }
                    },
                    onRefresh: function() {
                        // Update or adjust Swiper on ScrollTrigger refresh event
                        if (self._swiper && self._swiperInitialized) {
                            self._update(); // Custom update method
                        }
                    },
                    start: function() {
                        // Calculate the start point for the ScrollTrigger animation
                        // Use the trigger element's height
                        // center center
                        return (self.DOM.trigger.offsetHeight * 0.5) + 'px ' + (utils.getVh() * 0.5) + 'px';
                    },
                    end: function() {
                        // Calculate the end point for the ScrollTrigger animation with a slow down factor
                        // The factor (0.5) slows down the animation, extending its end point to require more scrolling
                        var slowDownFactor = 0.5; // Adjust this value to control the animation's pace

                        if (self._swiper && self._swiperInitialized) {
                            // Calculate end point based on the greater of two values:
                            // 1. The swiper wrapper's offsetWidth,
                            // 2. The total length of the swiper slides multiplied by viewport height and the slow down factor.
                            // This calculation ensures the animation's duration is proportional to the content size.
                            return '+=' + Math.max(self.DOM.swiperWrapper.offsetWidth, (self._swiper.slides.length * (utils.getVh() * slowDownFactor))) + 'px';
                        }
                        // Default end point based on viewport height and the slow down factor if Swiper isn't initialized
                        return '+=' + (utils.getVh() * slowDownFactor) + 'px';
                    },

                    // markers: true,
                }
            });
        }
    },

    // Swiper initialization

    _initializeSwiper: function(selector_) {
        var swiperOptions = {
            init: false,
            runCallbacksOnInit: true,
            direction: 'horizontal',
            slidesPerView: 'auto',
            centeredSlides: this._centeredSlides,
            centeredSlidesBounds: false,
            slidesOffsetBefore: this._getSwiperSlidesOffset(), // Custom offset before the first slide
            slidesOffsetAfter: this._getSwiperSlidesOffsetAfterValue(), // Custom offset after the last slide
            spaceBetween: this._getSwiperSpaceBetween(), // Space between slides
            initialSlide: this._currentActiveSlideIndex,
            loop: false,
            speed: 700,
            roundLengths: false,
            preloadImages: false,
            touchMoveStopPropagation: false,
            threshold: utils.isTouch() ? 10 : 6,
            passiveListeners: true,
            preventClicks: true,
            watchSlidesProgress: true,
            watchSlidesVisibility: false,
            grabCursor: utils.isTouch() ? false : true,
            customTransition: true,
            pagination: false,
            slideToClickedSlide: false,
            virtualTranslate: false,
            watchOverflow: false,
            resistanceRatio: 0.85,
            on: {}
        }

        //Bind the event callback functions and assign them to the 'on' object
        swiperOptions.on.init = this._swiperInitCallback.bind(this);
        swiperOptions.on.setTransition = this._swiperSetTransitionCallback.bind(this);
        swiperOptions.on.progress = this._swiperProgressCallback.bind(this); // Optional for fade in/out slides
        swiperOptions.on.touchStart = this._swiperTouchStartCallback.bind(this);

        // if Scrub prevent Swiper to update on resize, prevent drag cursor and prevent swipping.
        if (this._isScrubActive) {
            swiperOptions.updateOnWindowResize = false;
            swiperOptions.grabCursor = false;
            utils.addClass(this.DOM.swiper, 'swiper-no-swiping');
        } else {
            this._bindResizeEventForSwiperUpdate();
            var swiperPagination = {
                el: this.DOM.swiperPagination,
                type: 'bullets',
                clickable: true,
            }

            swiperOptions.pagination = swiperPagination;

            // Navigation Arrows
            this._initializeSwiperNavigation();

            // Bind touch and transition event callbacks to check bounds after interactions for Navigation arrows (TODO)
            swiperOptions.on.touchEnd = this._swiperCheckBounds.bind(this);
            swiperOptions.on.transitionStart = this._swiperCheckBounds.bind(this);
            swiperOptions.on.transitionEnd = this._swiperCheckBounds.bind(this);
        }

        this._swiper = new Swiper(selector_, swiperOptions);

        // Instantiate Swiper with options and defer initialization to the next frame for better performance
        utils.nextTick(function() {
            this._swiper.init();
            this.updateSwiperStateByProgress(0);
            this._update();
        }, this);
    },

    _bindResizeEventForSwiperUpdate: function() {
        if (!utils.isTouch()) {
            window.addEventListener('resize', this._update.bind(this));
        } else {
            window.addEventListener('orientationchange', function() {
                utils.nextTick(function() {
                    this._update();
                }, this, 500);

            });

        }
    },

    // Initializes Swiper navigation elements and flags for navigation control
    _initializeSwiperNavigation: function() {
        // Check if navigation container exists
        if (!this.DOM.swiperNavigationContainer) return;

        // Store references to the next and previous buttons
        this.DOM.swiperNext = this.DOM.swiperNavigationContainer.querySelector('.swiper-next');
        this.DOM.swiperPrev = this.DOM.swiperNavigationContainer.querySelector('.swiper-prev');
        this._isSwiperNavigation = true; // Flag indicating that navigation is set up

        // Bind click events for navigation buttons
        this._bindSwiperNavigationEvents();
    },

    // Handles click events on Swiper navigation buttons to navigate slides
    _onClickSwiperNavigation: function(event) {
        // Exit if navigation is not set up or Swiper instance is unavailable
        if (!this._isSwiperNavigation || !this._swiper) return;

        var target = event.target.closest('.swiper-prev') || event.target.closest('.swiper-next');

        // Navigate to the previous or next slide based on which button was clicked
        if (target) {
            var action = target.classList.contains('swiper-prev') ? 'prev' : 'next';
            this._swiper.slideTo(this._swiper.activeIndex + (action === 'prev' ? -1 : 1));
        }
    },

    // Binds click event listeners to Swiper navigation buttons
    _bindSwiperNavigationEvents: function() {
        // Ensure there are navigation buttons to bind events to
        if (this.DOM.swiperNext && this.DOM.swiperPrev) {
            this.DOM.swiperNext.addEventListener('click', this._onClickSwiperNavigation.bind(this));
            this.DOM.swiperPrev.addEventListener('click', this._onClickSwiperNavigation.bind(this));
        }
    },

    // Swiper Callbacks
    _swiperInitCallback: function() {
        console.log('swiper:init', this._swiper.el);

        this._swiperInitialized = true;

        if (this._gsapAnimation && this._gsapAnimation.scrollTrigger && this._isScrubActive) {
            ScrollTrigger.refresh();
        }
    },

    // Sets transition speed for slides
    _swiperSetTransitionCallback: function(speed_) {
        if (!this._swiperInitialized || !this._swiper) return;
        var slides = this._swiper.slides;
        var l = slides.length;
        var slide, transitionStyle;
        for (var i = 0; i < l; i++) {
            slide = slides[i];
            if (slide) {
                transitionStyle = speed_ + 'ms';
                slide.style.transition = transitionStyle;
            }
        }
    },

    _swiperProgressCallback: function(progress_) {
        if (!this._swiperInitialized || !this._swiper) return;

        // Clamp progress value between 0 and 1
        progress_ = isNaN(progress_) ? 0 : Math.min(Math.max(progress_, 0), 1);
        if (this._options.scrubDir === -1) {
            progress_ = 1 - progress_;
        }

        // Progress on each Slide
        var slides = this._swiper.slides;
        var l = slides.length;
        var slide, slideProgress, opacity;

        for (var i = 0; i < l; i++) {
            slide = slides[i];
            if (slide) {
                if (window.innerWidth > this._mdBreakpoint) {
                    opacity = 1;
                } else {
                    // Clamp slideProgress value between -1 and 1
                    slideProgress = isNaN(slide.progress) ? -1 : Math.min(Math.max(slide.progress, -1), 1);
                    opacity = utils.interpolateRange(Math.abs(slideProgress), 0.25, 1, 1, 0.25);
                }
                slide.style.opacity = opacity;
            }
        }
    },

    // Resets transition on touch start
    _swiperTouchStartCallback: function() {
        if (!this._swiperInitialized || !this._swiper || this._isScrubActive) return;
        var slides = this._swiper.slides;
        var l = slides.length;
        var slide;
        for (var i = 0; i < l; i++) {
            slide = slides[i];
            if (slide) {
                slide.style.transition = '';
            }
        }
    },

    _swiperCheckBounds: function() {
        var progress = isNaN(this._swiper.progress) ? 0 : (Math.min(Math.max(this._swiper.progress, 0), 1));
        var isBeginning = (progress <= 0);
        var isEnd = (progress >= 1);
        this._updateSwiperNavigation(isBeginning, isEnd);
    },

    _update: function() {
        this._updateSwiper();
        this._updateTextBeforeWrapper();
        this._updateSwiperNavigationContainer();

    },

    _updateSwiper: function() {
        if (!this._swiperInitialized || !this._swiper) return;

        if (window.innerWidth < this._mdBreakpoint) {
            this._centeredSlides = false;
        } else {
            this._centeredSlides = this._options.centeredSlides;
        }

        this._swiper.transitionEnd(null);
        this._swiper.params.slidesOffsetBefore = this._getSwiperSlidesOffset();
        this._swiper.params.slidesOffsetAfter = this._getSwiperSlidesOffsetAfterValue();
        this._swiper.params.spaceBetween = this._getSwiperSpaceBetween();
        this._swiper.params.centeredSlides = this._centeredSlides;
        this._swiper.update();
        this._swiper.pagination && this._swiper.pagination.update();
        this._swiperProgressCallback(this._swiper.progress);
    },

    // Visibility of Swiper navigation buttons based on current slide position
    _updateSwiperNavigation: function(isBeginning, isEnd) {
        // Exit if navigation hasn't been initialized
        if (!this._isSwiperNavigation) return;

        // Determine the visibility class action based on the Swiper's position
        var actionForNext = isEnd ? 'addClass' : 'removeClass';
        var actionForPrev = isBeginning ? 'addClass' : 'removeClass';

        // Update the navigation buttons' visibility
        utils[actionForNext](this.DOM.swiperNext, 'hide');
        utils[actionForPrev](this.DOM.swiperPrev, 'hide');
    },

    // Function to get the space between Swiper slides.
    _getSwiperSpaceBetween: function() {
        // If swiperSpacing is not defined, return 0 to avoid errors.
        if (!this.DOM.swiperSpacing) {
            return 0;
        }
        // Return the offsetWidth of swiperSpacing, rounded up to the nearest whole number.
        return Math.ceil(this.DOM.swiperSpacing.offsetWidth);
    },

    // Function to get the offset value for Swiper slides based on the viewport and configuration.
    _getSwiperSlidesOffset: function() {
        var adjustedMaxWrapperSize = this._maxWrapperSize + 0.5;

        // Use early return for simpler logic flow.
        if (!this.DOM.swiperSpacing) return 0;

        var spacingOffset = Math.ceil(this.DOM.swiperSpacing.offsetWidth);

        // For narrower windows or specific configurations, determine offset based on conditions.
        if (window.innerWidth < adjustedMaxWrapperSize) {
            // Offset calculation for smaller screens or centered slides.
            return this._centeredSlides && window.innerWidth > this._mdBreakpoint ? 0 : spacingOffset;
        } else {
            // Offset calculation for larger screens with non-centered slides.
            if (this._centeredSlides) return 0;

            var additionalSpacing = spacingOffset * 2;
            var visibleAreaWidth = this._maxWrapperSize - additionalSpacing;
            var result = (document.body.clientWidth - visibleAreaWidth) * 0.5;

            // Ensure the result is not smaller than the additional spacing.
            return Math.max(result, additionalSpacing);
        }
    },

    // Function to calculate the after-value for Swiper slides offset, especially handling cases with insufficient slides.
    _getSwiperSlidesOffsetAfterValue: function() {
        var tmpOffset = this._getSwiperSlidesOffset();

        // Return early for centered slides or uninitialized Swiper, where offset adjustments aren't needed.
        if (this._centeredSlides || !this._swiperInitialized || !this._swiper) {
            return tmpOffset;
        }

        // Calculate the total width of all slides to determine if there are enough slides to fill the Swiper container.
        var totalWidth = 0;
        for (var i = 0; i < this._swiper.slides.length; i++) {
            var slide = this._swiper.slides[i];
            if (slide) {
                totalWidth += slide.offsetWidth;
            }
        }

        // Calculate the difference between the Swiper container's width and the total slides width.
        var diff = this._swiper.width - tmpOffset - totalWidth;

        // If there's a positive difference, it indicates insufficient slides to fill the Swiper width.
        // Adjust the offset accordingly to center or properly align the slides within the Swiper container.
        if (diff > 0) {
            // The adjustment compensates for the gap, ensuring slides are visually centered or aligned correctly.
            return -Math.round(diff + this.DOM.swiperSpacing.offsetWidth * (this._swiper.slides.length - 1)) - 1;
        } else {
            // No adjustment needed if there are enough slides to fill the Swiper container.
            return tmpOffset;
        }
    },

    _updateSwiperNavigationContainer: function() {
        // Exit early if essential elements or objects are missing.
        if (!this._swiper || !this.DOM.swiperNavigationContainer || !this.DOM.mediaContainerRef) {
            return;
        }

        this.DOM.swiperNavigationContainer.style.cssText = '--swiper-navigation-height: ' + this.DOM.mediaContainerRef.offsetHeight + 'px;';
    },

    // Function to update the CSS for text appearing before the Swiper wrapper.
    _updateTextBeforeWrapper: function() {
        // Exit early if essential elements or objects are missing.
        if (!this._swiper || !this.DOM.textBeforeWrapper || !this.DOM.mediaContainerRef) {
            return;
        }

        var bodyWidth = document.body.clientWidth; // Get the width of the body.
        var slideWidth = this.DOM.mediaContainerRef.offsetWidth; // Get the width of the media container.

        // Calculate the offset value only once to avoid repetitive calls.
        var swiperSlidesOffset = this._getSwiperSlidesOffset();

        // Calculate the X offset for the slide. If not centered, use the swiperSlidesOffset directly.
        var slideOffsetX = this._centeredSlides ? ((bodyWidth - slideWidth) * 0.5) + swiperSlidesOffset : swiperSlidesOffset;

        // Calculate the width difference, ensuring it doesn't go negative.
        var wDiff = Math.max(0, (bodyWidth - this._maxWrapperSize) * 0.5);

        // Construct the CSS text property with calculated values.
        this.DOM.textBeforeWrapper.style.cssText =
            '--swiper-text-before-width: ' + (bodyWidth - slideOffsetX - wDiff) + 'px; ' +
            '--swiper-text-before-margin-left: ' + slideOffsetX + 'px;';
    },

    _reset: function() {
        this.DOM = {};
        this._swiper = null;
        this._swiperInitialized = false;
        this._currentActiveSlideIndex = 0;
        this._isScrubActive = false;
        this._centeredSlides = true;
        this._isSwiperNavigation = false;

        this._gsapAnimation = null;

        this._options = {
            selector: null,
            centeredSlides: true,
            isScrubActive: false,
            isScrubOnTouchActive: false,
            scrubDir: 1,
        };
    },

    initialize: function(options_) {
        // Reset the object's properties to their default values
        this._reset();

        // Merge defaults with options_,
        this._options = Object.assign(this._options, options_);

        // Get the main element based on the provided selector
        this.DOM.el = document.querySelector(this._options.selector);

        // Verify if the element based on the selector exists
        if (!this.DOM.el) {
            console.warn('The selector option is not optional. Please provide a valid selector.');
            return;
        }

        this._id = this._options.selector.split('#')[1];

        this._maxWrapperSize = utils.getElCustomCssVar(this.DOM.el, '--max-wrapper-size', true, true);
        this._mdBreakpoint = utils.getElCustomCssVar(this.DOM.el, '--md-breakpoint', true, true);

        this.DOM.mediaContainerRef = this.DOM.el.querySelector('.media-container');
        this.DOM.textBeforeWrapper = this.DOM.el.querySelector('.text-before-wrapper');

        this.DOM.swiper = this.DOM.el.querySelector('.swiper-container');
        this.DOM.swiperSpacing = this.DOM.swiper.querySelector('.swiper-column-gap');
        this.DOM.swiperWrapper = this.DOM.swiper.querySelector('.swiper-wrapper');

        this._centeredSlides = this._options.centeredSlides;

        // Adjust options based on device capabilities
        this._isScrubActive = !utils.isTouch() && this._options.isScrubActive;
        if (utils.isTouch() && this._options.isScrubOnTouchActive) {
            this._isScrubActive = true;
        }

        // If scrub is active, add the data-scrub attribute and initialize GSAP animation
        if (this._isScrubActive) {
            this.DOM.el.dataset.scrub = 'true';
            this.DOM.pin = this.DOM.swiper;
            this.DOM.trigger = this.DOM.swiperWrapper; // this.DOM.mediaContainerRef;
            this._initializeGsapAnimation(); // Initialize GSAP animation
        } else {
            this.DOM.swiperPagination = this.DOM.el.querySelector('.swiper-pagination');
            this.DOM.swiperNavigationContainer = this.DOM.el.querySelector('.swiper-navigation-container');
        }

        this._initializeSwiper(this.DOM.swiper); // Initialize the Swiper.js instance

    },

};

var initialize = function() {
    document.addEventListener('DOMContentLoaded', function() {
        scroller && scroller.initialize();
        var gsapSwiperTest1 = Object.assign({}, gsapSwiper).initialize({
            selector: '#gsap_swiper_01',
            isScrubActive: true,
        });
        var gsapSwiperTest2 = Object.assign({}, gsapSwiper).initialize({
            selector: '#gsap_swiper_02',
            isScrubActive: false,
            centeredSlides: false,
        });
        var gsapSwiperTest3 = Object.assign({}, gsapSwiper).initialize({
            selector: '#gsap_swiper_03',
            isScrubActive: true,
            isScrubOnTouchActive: true,
            scrubDir: -1,
            centeredSlides: false,
        });
        var gsapSwiperTest4 = Object.assign({}, gsapSwiper).initialize({
            selector: '#gsap_swiper_04',
            isScrubActive: false,
            centeredSlides: true,
        });
    });

    if (utils.isTouch()) {
        window.addEventListener('orientationchange', function() {
            utils.nextTick(function() {
                console.log('orientation change');
                ScrollTrigger.refresh();
            }, this, 500);

        });
    }

};

initialize();