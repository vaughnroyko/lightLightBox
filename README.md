lightLightBox v1.3
==============

A tiny single file, dynamic lightbox solution with ability to load images/HTML into a lightbox with gallery support. Support for IE7+, mobile/tablet browsers, zoom, and automatic resizing (orientation change or browser resize).

Support
--------------

Mostly everything, including IE7 and above!

Usage
--------------

**Lightbox:** Simply add a rel="lightbox" or data-lightbox="lightbox" to any link that has a href with an image link. Any alt attribute attached in a nested image/thumbnail will show as a caption in the lightbox. By default, an automatic gallery will be created with next/previous controls between all the lightbox rel/attributes found. Example:
```html
<a href="test.jpg" rel="lightbox">
    <img src="test-thumbnail.jpg" alt="Test Picture" />
</a>
```

**Gallery:** Alternatively you can load multiple images without having defined anchors/thumbnails. Simply add a data-lightbox="gallery", assign a unique id, and include data-gallery in the form of "url,caption;url,caption". Example:
```html
<a href="#" data-lightbox="gallery" id="test-gallery" data-gallery="test.jpg,Test Picture;test2.jpg,Test Picture #2">Gallery</a>
```

**Content:** Load HTML-based content in the lightbox using data-lightbox="content" and adjacent HTML element with the "lightlightbox-content" class. Example:
```html
<a href="#" data-lightbox="content">Test</a>
<div style="display: none;" class="lightlightbox-content">
    <h1>Test</h1>
    <p>Test</p>
</div>
```

To force the size of the content lightbox (and disable dynamic resizing), use width and height data attributes, like so:
```html
<div style="display: none;" class="lightlightbox-content" data-width="250" data-height="250"></div>
```

All contexts can be used simultaneously. Everything is loaded and listened to for dynamically, so any options can be changed, or links/images can be added with JavaScript on the fly.

Demo
--------------

[Demo Link](http://htmlpreview.github.io/?https://github.com/vaughnroyko/lightLightBox/blob/master/demo.html)

Changelog
--------------

**Version: 1.3 (August 9th, 2018)**

* lightLightBox no longer requires jQuery.
* Improved content resizing by calculating the content's width and height more accurately.
* Animations now use CSS, removing them for all browsers without support for transitions.
* Fixed some issues where inconsistent effects/events would fire if rapidly loading a lightbox.
* Buttons and loading dots are no longer selectable/highlightable.
* Removed scrollbars/scrolling when a lightbox is opened (for better device compatibility for width calculations).
* Improved performance heavily.

**Version: 1.2 (April 22nd, 2015)**

* Attributes and rel selectors now use validated HTML/output. You will need to update all your HTML when moving to this version if you used gallery/content selectors previously.
* A content lightbox will now properly re-position itself if using a set width/height.
* Fixed a bug where an image would still load if you clicked on overlay (close) during a load.

License
--------------

lightLightBox.js is licensed under the [MIT License](https://github.com/vaughnroyko/lightLightBox/blob/master/LICENSE).
