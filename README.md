lightLightBox v1.0
==============

A single file, light, dynamic lightbox solution with ability to load images/HTML into a lightbox with gallery support. Support for IE7+, mobile/tablet browsers, zoom and automatic resizing (orientation change or browser resize).

Requires
--------------

jQuery.

Support
--------------

Everything? Well, besides <= IE6.

Usage
--------------

**Lightbox:** Simply add a rel="lightbox" to any link that has a href with an image link. Any alt attached a nested image/thumbnail will show as a caption in the lightbox. By default, an automatic gallery will be created with next/previous controls will be added for all found rel="lightbox" anchors. Example:
```html
<a href="test.jpg" rel="lightbox">
    <img src="test-thumbnail.jpg" alt="Test Picture" />
</a>
```

**Gallery:** Alternatively you can load multiple images without having defined anchors/thumbnails. Simply add a rel="gallery", assign a unique id, and include data-gallery in the form of url,caption;. Example:
```html
<a href="#" rel="gallery" id="test-gallery" data-gallery="test.jpg,Test Picture;test2.jpg,Test Picture #2">Gallery</a>
```

**Content:** Load HTML-based content in the lightbox using rel="content" and adjacent HTML element. Example:
```html
<a href="#" rel="content">Test</a>
<div style="display: none;" class="lightlightbox-content">
    <h1>Test</h1>
    <p>Test</p>
</div>
```

All contexts can be used simultaneously. Everything is loaded and listened to for dynamically, so any options can be changed, or links/images can be added with JavaScript on the fly.

Demo
--------------

[Demo Link](http://htmlpreview.github.io/?https://github.com/vaughnroyko/lightLightBox/blob/master/demo.html)

License
--------------

lightLightBox.js is licensed under the [MIT License](https://github.com/vaughnroyko/lightLightBox/blob/master/LICENSE).
