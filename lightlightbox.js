/*!
 * lightLightbox
 * A single file, light, dynamic lightbox solution with ability to load images/HTML into a lightbox with gallery support. Support for IE7+, mobile/tablet browsers, and zoom and automatic resizing.
 * Version: 1.2 (April 23rd, 2015)
 * requires jQuery
 */

var lightLightBox;

$(function () {

	var LightLightBox = function () {

		var that = this;

		//Options
		this.options = {
			overlayIndex: 101,
			overlayOpacity: 0.85,
			imagePadding: 100,
			caption: true
		};

		//Naming
		this.ids = {
			overlay: 'lightlightbox-overlay',
			imageId: 'lightlightbox-image',
			imageCont: 'lightlightbox-cont',
			closeButton: 'lightlightbox-close',
			nextButton: 'lightlightbox-next',
			previousButton: 'lightlightbox-prev',
			load: 'lightlightbox-loading',
			content: 'lightlightbox-content',
			caption: 'lightlightbox-caption'
		};

		//Styles and HTML
		this.controlStyle = 'position: absolute; cursor: pointer; margin-top: -36px; z-index: ' + ( this.options.overlayIndex + 3 ) + '; color: #fff; text-shadow: 0 0 10px #000; font-weight: 100; font-size: 48px; padding: 10px; ';

		this.template = {
			overlayHTML: '<div id="' + this.ids.overlay + '" style="display: none; top: 0; left: 0; z-index: ' + this.options.overlayIndex + '; background-color: #000; position: fixed; opacity: ' + this.options.overlayOpacity + '; filter: alpha(opacity=' + this.options.overlayOpacity * 100 + '); width: 100%; height: 100%;"></div>',
			imageBox: '<div id="' + this.ids.imageCont + '" style="font-family: Arial; visibility: hidden; top: 0; opacity: 0; filter: alpha(opacity=0); margin: auto; position: absolute; z-index: ' + ( this.options.overlayIndex + 1 ) + ';"><div id="' + this.ids.closeButton + '" style="position: absolute; cursor: pointer; top: -10px; right: -10px; z-index: ' + ( this.options.overlayIndex + 3 ) + '; color: #000; background: #fff; border-radius: 27px; padding: 0; height: 27px; width: 27px; text-align: center; line-height: 1.1; font-weight: 100; font-size: 27px; box-shadow: -3px 3px 15px #000;">&#215;</div></div>',
			loading: '<div id="' + this.ids.load + '" style="color: #fff; font-size: 26px; position: fixed; left: 0; top: 50%; text-align: center; width: 100%; z-index:' + ( this.options.overlayIndex + 2 ) + ';"><div style="width: 20px; display: inline-block;"><span style="display: none;">&bull;</span></div><div style="width: 20px; display: inline-block;"><span style="display: none;">&bull;</span></div><div style="width: 20px; display: inline-block;"><span style="display: none;">&bull;</span></div></div>',
			previousButton: '<div style="'+ this.controlStyle + 'left: -40px;" id="' + this.ids.previousButton + '">&lsaquo;</div>',
			nextButton: '<div style="'+ this.controlStyle + 'right: -40px;" id="' + this.ids.nextButton + '">&rsaquo;</div>',
			caption: '<div id="' + this.ids.caption + '" style="position: absolute; padding: 15px; bottom: 0; left: 0; color: #fff; background: #000; box-sizing: border-box; background: rgba(0, 0, 0, ' + this.options.overlayOpacity + ')"></div>'
		};

		//Initialize all variables
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

		//Hide any lightbox HTML content by default
		$( 'div.' + this.ids.content ).hide();

		//Function called to re-size and re-position the image
		this.resizeImage = function () {

			var scrollTop = $( window ).scrollTop();
			var scrollLeft = $( window ).scrollLeft();
			var viewportHeight = $( window ).height();
			var viewportWidth = $( window ).width();
			var zoomWidth = window.innerWidth - ( this.options.imagePadding );
			var zoomHeight = window.innerHeight - ( this.options.imagePadding / 2 );
			var fitting = false;
			var imageHeight = this.origImageHeight;
			var imageWidth = this.origImageWidth;
			var newImageWidth = imageWidth;
			var newImageHeight = imageHeight;

			//iOS/Safari zoom fix
			if ( zoomHeight && viewportHeight != zoomHeight ) {
				viewportHeight = zoomHeight;
			}
			if ( zoomWidth && viewportWidth != zoomWidth ) {
				viewportWidth = zoomWidth;
			}

			//Rescale the image and container proportionately
			if ( !that.noResize ) {
				while ( !fitting ) {
					if ( ( newImageWidth > viewportWidth ) ) {
						newImageWidth = ( viewportWidth - this.options.imagePadding );
						newImageHeight = ( imageHeight / imageWidth ) * newImageWidth;
					} else if ( ( newImageHeight > viewportHeight ) ) {
						newImageHeight = ( viewportHeight - this.options.imagePadding );
						//Only scale width if not content lightbox
						if ( this.context !== "content" ) {
							newImageWidth = ( imageWidth / imageHeight ) * newImageHeight;
						}
					} else {
						fitting = true;
					}
				}
			}

			var offsetHeight = scrollTop + ( viewportHeight / 2 ) - ( newImageHeight / 2 ) + ( this.options.imagePadding / 4 );
			var offsetWidth = scrollLeft + ( viewportWidth / 2 ) - ( newImageWidth / 2 ) + ( this.options.imagePadding / 2 );

			$( '#' + this.ids.imageCont ).css( 'top', Math.floor( offsetHeight ) );
			$( '#' + this.ids.imageCont ).css( 'left', Math.floor( offsetWidth - 10 ) );
			$( '#' + this.ids.nextButton ).css( 'top', Math.floor( newImageHeight / 2 ) );
			$( '#' + this.ids.previousButton ).css( 'top', Math.floor( newImageHeight / 2 ) );
			$( '#' + this.ids.imageCont ).width( Math.floor( newImageWidth ) );
			$( '#' + this.ids.imageCont ).height( Math.floor( newImageHeight ) );
			$( '#' + this.ids.imageId ).width( Math.floor( newImageWidth ) );
			$( '#' + this.ids.imageId ).height( Math.floor( newImageHeight ) );
		};

		//Fade loading animation markers in and out.
		this.loadingAnim = function () {
			if ( that.timer >= 3 ) {
				$( '#' + that.ids.load ).children().eq( that.timer - 3 ).children().fadeOut( 100 );
			} else {
				$( '#' + that.ids.load ).children().eq( that.timer ).children().fadeIn( 100 );
			}
			that.timer++;
			if ( that.timer >= 6 ) {
				that.timer = 0;
			}
		};

		//Set image options, animations, and variables
		this.setImage = function () {
			//Image uses visibility instead if display to fix IE not being able to get height or width on display: none elements
			$( '#' + this.ids.imageCont ).css( 'visibility', 'visible' );
			that.lightboxOpen = true;
			this.resizeImage();
			$( '#' + this.ids.imageCont ).animate( {opacity: 1}, 400 );
		};

		//Load an image
		this.loadImage = function ( imgURL, imgTitle, content, noResize ) {
			if (!that.lightboxOpen) {
				return;
			}
			$( 'body' ).append( this.template.imageBox );
			//No loading for content
			if ( this.context !== "content" ) {
				$( 'body' ).append( this.template.loading );
			}
			if ( this.galleryCount > 1 ) {
				$( this.template.nextButton ).appendTo( '#' + this.ids.imageCont );
				$( this.template.previousButton ).appendTo( '#' + this.ids.imageCont );
			}
			this.noResize = false;
			if ( !content ) {
				var loadintInt = setInterval( this.loadingAnim, 500 );
				//Make sure it's completely loaded before we try to get the dimensions or fade it in
				$( '<img id="' + this.ids.imageId + '" style="z-index: ' + ( this.options.overlayIndex + 2 ) + ';" src="'+ imgURL +'" alt="' + imgTitle + '">' ).load( function () {
					$( this ).appendTo( '#' + that.ids.imageCont );
					that.origImageWidth = $( this ).width();
					that.origImageHeight = $( this ).height();
					that.setImage();
					//Add captions
					if ( that.options.caption && imgTitle ) {
						$( that.template.caption ).appendTo( '#' + that.ids.imageCont );
						$( '#' + that.ids.caption ).text( imgTitle );
					}
					that.timer = 0;
					//Clear loading animation
					clearInterval( loadintInt );
					$( '#' + that.ids.load ).fadeOut( 200, function() { $( this ).remove(); } );
				});
			} else {
				//Content (HTML)
				$( '#' + this.ids.imageCont ).append( '<div id="' + this.ids.imageId + '" style="background: #fff; overflow-y: auto; z-index: ' + ( this.options.overlayIndex + 2 ) + ';">' + content + '</div>' );
				//Setting to force width/height and no resize
				if (noResize) {
					this.noResize = true;
					this.origImageWidth = noResize[0];
					this.origImageHeight = noResize[1];
				} else {
					this.origImageWidth = $( '#' + this.ids.imageId ).outerWidth() - this.options.imagePadding;
					this.origImageHeight = $( '#' + this.ids.imageId ).outerHeight() + 40;
				}
				this.setImage();
			}
		};

		//Find all links on the page for lightbox, gallery and content
		$( 'body' ).on( 'click', 'a[data-lightbox="content"], a[data-lightbox="gallery"], a[rel="lightbox"], a[data-lightbox="lightbox"]', function(e) {
			var imgURL = "";
			var imgTitle = "";
			var rel = $( this ).attr( 'rel' );
			if (!rel) {
				rel = $( this ).data( 'lightbox' );
			}
			var content = false;
			var noResize = false;
			if ( rel == 'lightbox' ) {
				//Lightbox
				imgURL = $( this ).attr( 'href' );
				imgTitle = $( this ).find( 'img' ).attr( 'alt' );
				if ( !imgTitle ) {
					imgTitle = "";
				}
				//Support both a rel and data lightbox attribute
				var lightboxCount = $( 'a[rel="lightbox"], a[data-lightbox="lightbox"]' );
				that.galleryCount = lightboxCount.length;
				that.currentImage = lightboxCount.index( this );
			} else if ( rel == 'gallery' ) {
				//Gallery
				that.subGalleryId = $( this ).attr( 'id' );
				var galleryData = $( this ).data( 'gallery' ).split( ';' );
				that.gallery[that.subGalleryId] = [];
				for ( var i = 0; i < galleryData.length; i++ ) {
					that.gallery[that.subGalleryId][i] = galleryData[i].split( ',' );
				}
				imgURL = that.gallery[that.subGalleryId][0][0];
				imgTitle = that.gallery[that.subGalleryId][0][1];
				that.galleryCount = that.gallery[that.subGalleryId].length;
				that.currentImage = 0;
			} else {
				//HTML Content
				var contentSelector = $( this ).next( 'div.' + that.ids.content );
				content = contentSelector.html();
				var width = contentSelector.data('width');
				var height = contentSelector.data('height');
				if (width && height) {
					noResize = [width, height];
				}
				that.galleryCount = 0;
			}
			that.lightboxOpen = true;
			that.context = rel;
			$( 'body' ).append( that.template.overlayHTML );
			$( '#' + that.ids.overlay ).fadeIn( 200 );
			that.loadImage( imgURL, imgTitle, content, noResize );
			e.preventDefault();
		});

		//When the browser is resized, we need to re-position and re-size the image
		$( window ).resize( function() {
			if ( that.lightboxOpen ) {
				that.resizeImage();
			}
		});

		//Fade out and remove the overlay/image/container if you click the close button or the overlay
		$( 'body' ).on( 'click', '#' + this.ids.overlay + ', #' + this.ids.closeButton, function() {
			$( '#' + that.ids.overlay ).fadeOut( 400, function() { $( this ).remove(); } );
			$( '#' + that.ids.imageCont ).fadeOut( 400, function() { $( this ).remove(); } );
			that.lightboxOpen = false;
		});

		//Next/Previous button
		$( 'body' ).on( 'click', '#' + this.ids.previousButton + ', #' + this.ids.nextButton, function() {
			that.lightboxOpen = true;
			if ( $( this ).attr( 'id' ) == that.ids.nextButton ) {
				//Next
				that.currentImage++;
				if ( that.currentImage > that.galleryCount-1 ) {
					that.currentImage = 0;
				}
			} else {
				//Prev
				that.currentImage--;
				if ( that.currentImage < 0 ) {
					that.currentImage = that.galleryCount-1;
				}
			}
			$( '#' + that.ids.imageCont ).fadeOut( function() {
				$( this ).remove();
				var imgURL, imgTitle;
				if ( that.context == "gallery" ) {
					imgURL = that.gallery[that.subGalleryId][that.currentImage][0];
					imgTitle = that.gallery[that.subGalleryId][that.currentImage][1];
				} else {
					var lightboxes = $( 'a[rel="lightbox"], a[data-lightbox="lightbox"]' );
					imgURL = lightboxes.eq( that.currentImage ).attr( 'href' );
					imgTitle = lightboxes.eq( that.currentImage ).find( 'img' ).attr( 'alt' );
				}
				that.loadImage( imgURL, imgTitle );
			});
		});

	};

	//This will intialize the lightBox without needing to call it specifically. You can get and set dynamically using the lightLightBox global (example: lightLightBox.imagePadding = 200)
	lightLightBox = new LightLightBox();

});
