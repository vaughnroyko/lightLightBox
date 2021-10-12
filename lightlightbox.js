/*!
 * lightLightbox v1.3.4 https://github.com/vaughnroyko/lightLightBox
 */

var LightLightBox = function() {

	that = this;

	// Options
	this.options = {
		overlayIndex: 101,
		overlayOpacity: 0.85,
		imagePadding: 50,
		transitionSpeed: '0.35s',
		transitionSpeedMS: 350, // Should be the same as transitionSpeed
		caption: true
	};

	// Naming
	this.ids = {
		overlay: 'lightlightbox-overlay',
		imageId: 'lightlightbox-image',
		imageCont: 'lightlightbox-cont',
		closeButton: 'lightlightbox-close',
		nextButton: 'lightlightbox-next',
		previousButton: 'lightlightbox-prev',
		load: 'lightlightbox-loading',
		content: 'lightlightbox-content',
		caption: 'lightlightbox-caption',
		container: 'lightlightbox-container'
	};

	// Styles and HTML
	this.controlStyle = 'position:absolute;cursor:pointer;margin-top:-36px;z-index:' + ( this.options.overlayIndex + 3 ) + ';color:#fff;text-shadow:0 0 10px #000;font-weight:100;font-size:48px;padding:10px;';
	this.transitions = '-webkit-transition:opacity ' + this.options.transitionSpeed + ' ease-in-out;-moz-transition:opacity ' + this.options.transitionSpeed + ' ease-in-out;-ms-transition:opacity ' + this.options.transitionSpeed + ' ease-in-out;-o-transition:opacity ' + this.options.transitionSpeed + ' ease-in-out;transition:opacity ' + this.options.transitionSpeed + ' ease-in-out;';
	this.unselectable = '-moz-user-select:none;-webkit-user-select:none;-ms-user-select:none;user-select:none;';
	this.invisible = 'visibility:hidden;opacity:0;';
	this.bullet = '<div style="width:20px;display:inline-block;"><span style="' + this.invisible + this.transitions + '">&bull;</span></div>';

	this.template = {
		overlayHTML: '<div id="' + this.ids.overlay + '" style="top:0;left:0;z-index:' + this.options.overlayIndex + ';background-color:#000;position:fixed;filter:alpha(opacity=' + this.options.overlayOpacity * 100 + ');width:100%;height:100%;' + this.invisible + this.transitions + '"></div>',
		imageBox: '<div id="' + this.ids.imageCont + '" style="font-family:Arial;top:0;margin:auto;position:absolute;z-index:' + ( this.options.overlayIndex + 2 ) + ';' + this.invisible + this.transitions + '"><div id="' + this.ids.closeButton + '" style="position:absolute;cursor:pointer;top:-10px;right:-10px;z-index:' + ( this.options.overlayIndex + 3 ) + ';color:#000;background:#fff;border-radius:27px;padding:0;height:27px;width:27px;text-align:center;line-height:1.1;font-weight:100;font-size:27px;box-shadow:-3px 3px 15px #000;' + this.unselectable + '">&#215;</div></div>',
		loading: '<div id="' + this.ids.load + '" style="color:#fff;font-size:26px;position:fixed;left:0;top:50%;text-align:center;width:100%;z-index:' + ( this.options.overlayIndex + 1 ) + ';' + this.invisible + this.unselectable + '">' + this.bullet + this.bullet + this.bullet + '</div>',
		previousButton: '<div style="'+ this.controlStyle + 'left:-40px;' + this.unselectable + '" id="' + this.ids.previousButton + '">&lsaquo;</div>',
		nextButton: '<div style="'+ this.controlStyle + 'right:-40px;' + this.unselectable + '" id="' + this.ids.nextButton + '">&rsaquo;</div>',
		caption: '<div id="' + this.ids.caption + '" style="position:absolute;padding:15px;bottom:0;left:0;color:#fff;background:#000;box-sizing:border-box;background:rgba(0,0,0,' + this.options.overlayOpacity + ')"></div>',
		container: '<div id="' + this.ids.container + '" style="position:static;"></div>'
	};

	// Initialize all variables
	this.origImageWidth = 0;
	this.origImageHeight = 0;
	this.timer = 0;
	this.galleryCount = 0;
	this.subGalleryId = false;
	this.currentImage = 0;
	this.lightboxOpen = false;
	this.gallery = [];
	this.context = "";
	this.noResize = false;
	this.loadingTimer = null;
	this.transitioning = false;
	this.lightboxGallery = [];
	this.image = new Image();

	// nextSibling can return non-elements in IE, add compat
	this.next = function(start) {
		var nextSib;
		if (!(nextSib = start.nextSibling)) {
			return false;
		}
		while (nextSib.nodeType != 1) {
			if (!(nextSib = nextSib.nextSibling)) {
				return false;
			}
		}
		return nextSib;
	};

	// Hide
	this.hide = function(element) {
		element.style.opacity = 0;
		setTimeout(function() {
			element.style.visibility = 'hidden';
		}, this.options.transitionSpeedMS);
	};

	// Show
	this.show = function(element, opacity) {
		element.style.opacity = opacity ? opacity : 1;
		element.style.visibility = 'visible';
	};

	// IE7 support for event listeners
	this.addEvent = function(event, element, func) {
		if (element.addEventListener) {
			element.addEventListener(event, func, false);
		} else if (element.attachEvent) {
			element.attachEvent("on" + event, func);
		} else {
			element[event] = func;
		}
	};

	this.getImageAttrInNode = function(node, attribute) {
		if (node) {
			for (var i = 0; i < node.length; i++) {
				if (node[i].tagName === "IMG") {
					return node[i].getAttribute( attribute );
				}
			}
		}
		return "";
	};

	this.hideScrollbars = function() {
		document.documentElement.style.overflow = 'hidden';
		document.body.scroll = 'no'; // IE
	};

	this.showScrollbars = function() {
		document.documentElement.style.overflow = 'auto';
		document.body.scroll = 'yes'; // IE
	};

	this.isLightboxLink = function(element) {
		return (element.getAttribute( "rel" ) && element.getAttribute( "rel" ) === "lightbox") || (element.getAttribute( "data-lightbox" ) && element.getAttribute( "data-lightbox" ) === "lightbox");
	};

	// Reduce minified size with our own helpers
	this.id = function(element) {
		return document.getElementById(element);
	};

	this.append = function(element, html) {
		element.insertAdjacentHTML('beforeend', html);
	};

	// Function called to re-size and re-position the image
	this.resizeImage = function() {
		if ( !this.lightboxOpen ) {
			return;
		}

		var padding = this.options.imagePadding;
		var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		var scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
		var viewportHeight = Math.max(document.documentElement.clientHeight, (window.innerHeight || 0)) - (padding / 2);
		var viewportWidth = Math.max(document.documentElement.clientWidth, (window.innerWidth || 0)) - padding;
		var imageHeight = this.origImageHeight;
		var imageWidth = this.origImageWidth;

		// If none set, try to infer width/height based on content (for context content)
		if (!imageHeight) {
			var imageIdElementNodes = this.id( this.ids.imageId ).childNodes;
			var childNode = imageIdElementNodes[1];
			if (!childNode) {
				childNode = imageIdElementNodes[0]; // IE compat
			}
			imageHeight = childNode.offsetHeight;
		}
		if (!imageWidth) {
			imageWidth = viewportWidth - padding;
		}

		var newImageWidth = imageWidth;
		var newImageHeight = imageHeight;

		// Rescale the image and container proportionately
		var fitting = false;
		if ( !this.noResize ) {
			while ( !fitting ) {
				if ( ( newImageWidth + padding > viewportWidth ) ) {
					newImageWidth = ( viewportWidth - padding );
					newImageHeight = ( imageHeight / imageWidth ) * newImageWidth;
				} else if ( ( newImageHeight + padding > viewportHeight ) ) {
					newImageHeight = ( viewportHeight - padding );
					// Only scale if non-content lightbox
					if ( this.context !== "content" ) {
						newImageWidth = ( imageWidth / imageHeight ) * newImageHeight;
					}
				} else {
					fitting = true;
				}
			}
		}

		var offsetHeight = scrollTop + ( viewportHeight / 2 ) - ( newImageHeight / 2 ) + ( padding / 4 );
		var offsetWidth = scrollLeft + ( viewportWidth / 2 ) - ( newImageWidth / 2 ) + ( padding / 2 );

		this.id( this.ids.imageCont ).style.top = Math.floor( offsetHeight ) + "px";
		this.id( this.ids.imageCont ).style.left = Math.floor( offsetWidth ) + "px";
		this.id( this.ids.imageCont ).style.width = Math.floor( newImageWidth ) + "px";
		this.id( this.ids.imageCont ).style.height = Math.floor( newImageHeight ) + "px";

		if ( this.galleryCount > 1 ) {
			this.id( this.ids.nextButton ).style.top = Math.floor( newImageHeight / 2 ) + "px";
			this.id( this.ids.previousButton ).style.top = Math.floor( newImageHeight / 2 ) + "px";
		}

		this.id( this.ids.imageId ).style.width = Math.floor( newImageWidth ) + "px";
		this.id( this.ids.imageId ).style.height = Math.floor( newImageHeight ) + "px";
	};

	// Fade loading animation markers in and out.
	this.loadingAnim = function() {
		if ( that.timer >= 3 ) {
			that.hide(that.id( that.ids.load ).childNodes[that.timer - 3].childNodes[0]);
		} else {
			that.show(that.id( that.ids.load ).childNodes[that.timer].childNodes[0]);
		}

		that.timer++;

		if ( that.timer >= 6 ) {
			that.timer = 0;
		}
	};

	// Set image options, animations, and variables
	this.setImage = function() {
		this.lightboxOpen = true;
		this.hideScrollbars();
		this.resizeImage();
		this.show(this.id( this.ids.imageCont ));
	};

	// Load an image
	this.loadImage = function ( imgURL, imgTitle, content, noResize ) {
		if (!this.lightboxOpen) {
			return;
		}

		this.noResize = false;

		if ( !content ) {
			this.show(this.id( this.ids.load ));
			this.loadingTimer = setInterval( this.loadingAnim, 400 );
			var imageHTML = '<img id="' + this.ids.imageId + '" style="z-index:' + ( this.options.overlayIndex + 2 ) + ';" src="' + imgURL + '" alt="' + imgTitle + '" width="0" height="0">';
			this.image = new Image();

			// Make sure it's completely loaded before we try to get the dimensions or fade it in
			this.image.onload = function() {
				that.addNavigation();
				that.stopLoading();

				that.append(that.id( that.ids.imageCont ), imageHTML);

				that.origImageWidth = that.image.width;
				that.origImageHeight = that.image.height;

				// Add captions
				if ( that.options.caption && imgTitle ) {
					that.append(that.id( that.ids.imageCont ), that.template.caption);
					that.append(that.id( that.ids.caption ), imgTitle);
				}

				that.setImage();
			};

			this.image.src = imgURL;
		} else {

			// Content (HTML)
			this.addNavigation();
			this.append(this.id( this.ids.imageCont ), '<div id="' + this.ids.imageId + '" style="background:#fff;overflow-y:auto;z-index:' + ( this.options.overlayIndex + 2 ) + ';">' + content + '</div>');

			// Setting to force width/height and no resize
			if (noResize) {
				this.noResize = true;
				this.origImageWidth = noResize[0];
				this.origImageHeight = noResize[1];
			} else {
				this.origImageWidth = null;
				this.origImageHeight = null;
				this.resizeImage();
			}

			this.setImage();
		}
	};

	this.stopLoading = function() {
		this.timer = 0;
		clearInterval( this.loadingTimer );
		this.hide(this.id( this.ids.load ));
		for (var i = 0; i < 3; i++) {
			this.hide(this.id( this.ids.load ).childNodes[i].childNodes[0]);
		}
	};

	this.addNavigation = function() {
		this.append(this.id( this.ids.container ), this.template.imageBox);

		if ( this.galleryCount > 1 ) {

			this.append(this.id( this.ids.imageCont ), this.template.nextButton);
			this.append(this.id( this.ids.imageCont ), this.template.previousButton);

			// Next/Previous button
			this.addEvent("click", this.id( this.ids.nextButton ), function() {
				that.navigate(true);
			});
			this.addEvent("click", this.id( this.ids.previousButton ), function() {
				that.navigate(false);
			});
		}

		// Close button
		this.addEvent("click", this.id( this.ids.closeButton ), function() {
			that.close();
		});
	};

	this.navigate = function(direction) {
		if (this.transitioning) {
			return;
		}
		this.lightboxOpen = true;
		this.hideScrollbars();

		if (direction) {
			// Next
			this.currentImage++;
			if ( this.currentImage > this.galleryCount-1 ) {
				this.currentImage = 0;
			}
		} else {
			// Prev
			this.currentImage--;
			if ( this.currentImage < 0 ) {
				this.currentImage = this.galleryCount-1;
			}
		}

		this.hide(this.id( this.ids.imageCont ));
		this.transitioning = true;
		setTimeout(function() {
			var imageCont = that.id( that.ids.imageCont );
			if (imageCont) {
				imageCont.outerHTML = "";
			}

			var imgURL, imgTitle;
			if ( that.context == "gallery" ) {
				imgURL = that.gallery[that.subGalleryId][that.currentImage][0];
				imgTitle = that.gallery[that.subGalleryId][that.currentImage][1];
			} else {
				imgURL = that.lightboxGallery[that.currentImage].getAttribute( 'href' );
				if (imgURL === "#" || imgURL === window.location.href + "#") {
					imgURL = that.getImageAttrInNode(that.lightboxGallery[that.currentImage].childNodes, 'src');
				}
				imgTitle = that.getImageAttrInNode(that.lightboxGallery[that.currentImage].childNodes, 'alt');
			}

			that.loadImage( imgURL, imgTitle );
			that.transitioning = false;

		}, this.options.transitionSpeedMS);
	};

	this.close = function() {
		this.stopLoading();
		this.hide(this.id( this.ids.overlay ));
		var imageCont = this.id( this.ids.imageCont );
		if (imageCont) {
			this.hide(this.id( this.ids.imageCont ));
		}
		this.lightboxOpen = false;
		this.showScrollbars();
		this.image.onload = null;
		setTimeout(function(){
			var imageCont = that.id( that.ids.imageCont );
			if (imageCont) {
				imageCont.outerHTML = "";
			}
		}, this.options.transitionSpeedMS);
	};

	this.imageClick = function(element, index) {
		var imgURL = "";
		var imgTitle = "";

		// Support both a rel and data lightbox attribute
		var rel = element.getAttribute( "rel" );
		if (!rel) {
			rel = element.getAttribute( "data-lightbox" );
		}

		var content = false;
		var noResize = false;

		if ( rel == 'lightbox' ) {

			// Lightbox
			imgURL = element.getAttribute( 'href' );
			if (imgURL === "#" || imgURL === window.location.href + "#") {
				imgURL = this.getImageAttrInNode(element.childNodes, 'src');
			}
			imgTitle = this.getImageAttrInNode(element.childNodes, 'alt');
			this.galleryCount = this.lightboxGallery.length;
			this.currentImage = index;

		} else if ( rel == 'gallery' ) {

			// Gallery
			this.subGalleryId = element.getAttribute( 'id' );
			var galleryData = element.getAttribute( "data-gallery" ).split( ';' );
			this.gallery[this.subGalleryId] = [];

			for ( var i = 0; i < galleryData.length; i++ ) {
				this.gallery[this.subGalleryId][i] = galleryData[i].split( ',' );
			}

			imgURL = this.gallery[this.subGalleryId][0][0];
			imgTitle = this.gallery[this.subGalleryId][0][1];
			this.galleryCount = this.gallery[this.subGalleryId].length;
			this.currentImage = 0;

		} else {

			// HTML Content
			var contentSelector = this.next( element );
			if (contentSelector) {
				content = contentSelector.innerHTML;
				var width = contentSelector.getAttribute('data-width');
				var height = contentSelector.getAttribute('data-height');

				if (width && height) {
					noResize = [width, height];
				}
			}

			this.galleryCount = 0;
		}

		this.lightboxOpen = true;
		this.context = rel;

		this.show( this.id( this.ids.overlay ), this.options.overlayOpacity );

		this.loadImage( imgURL, imgTitle, content, noResize );
	};

	// Init
	this.append(document.body, this.template.container);
	this.append(this.id( this.ids.container ), this.template.loading);
	this.append(this.id( this.ids.container ), this.template.overlayHTML);

	// Hide any lightbox HTML content by default

	// IE7/8 doesn't have getElementsByClassName, make our own
	var lightBoxContents = document.getElementsByTagName("*");
	for (var i = 0; i < lightBoxContents.length; i++) {
		var className = lightBoxContents[i].getAttribute('className');
		if (className) {
			var names = className.split(' ');
			for (var n = 0; n < names.length; n++) {
				if (names[n] == this.ids.content) {
					this.hide( lightBoxContents[i] );
				}
			}
		}
	}

	// Events

	// Dynamic clicking
	this.addEvent('click', document, function(event) {
		var elements = [event.target || event.srcElement, (event.target ? event.target.parentElement : undefined) || event.srcElement.parentElement];
		for (var i = 0; i < elements.length; i++) {
			if (elements[i]) {
				if (elements[i].tagName === "A") {
					var imageClick = false;
					if (that.isLightboxLink(elements[i])) {
						that.lightboxGallery = [];
						var anchors = document.getElementsByTagName("a");
						for (var a = 0; a < anchors.length; a++) {
							if (that.isLightboxLink(anchors[a])) {
								that.lightboxGallery.push(anchors[a]);
							}
						}
						var lightBoxAnchor = 0;
						for (var b = 0; b < anchors.length; b++) {
							if (that.isLightboxLink(anchors[b])) {
								if (elements[i] === anchors[b]) {
									that.imageClick(elements[i], lightBoxAnchor);
									imageClick = true;
								}
								lightBoxAnchor++;
							}
						}
					} else if (elements[i].getAttribute( "data-lightbox" ) && (elements[i].getAttribute( "data-lightbox" ) === "gallery" || elements[i].getAttribute( "data-lightbox" ) === "content")) {
						that.imageClick(elements[i]);
						imageClick = true;
					}

					if (imageClick) {
						if (event.preventDefault) {
							event.preventDefault();
						} else {
							event.returnValue = false;
						}
					}
				}
			}
		}
	});

	// When the browser is resized, we need to re-position and re-size the image
	this.addEvent("resize", window, function() {
		that.resizeImage();
	});

	// Close on overlay click
	this.addEvent("click", this.id( this.ids.overlay ), function() {
		that.close();
	});
};

// This will intialize the lightBox without needing to call it specifically. You can get and set dynamically using the lightLightBox global (example: lightLightBox.options.imagePadding = 200;)
document.addEventListener("DOMContentLoaded", function() {
	lightLightBox = new LightLightBox();
});