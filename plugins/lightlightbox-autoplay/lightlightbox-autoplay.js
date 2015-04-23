/*!
 * lightLightbox Autoplay
 * A plugin example adding new autoplay functionality. Complete with a pause/play button using no external stylesheets or graphics.
 * Version: 1.0 (April 23rd, 2015)
 * requires jQuery, lightLightbox
 */

$(function() {

	if (typeof lightLightBox === 'undefined') {
		return;
	}

	//New variables
	lightLightBox.autoGalleryTimer = 0;
	lightLightBox.paused = false;

	//New controls/style
	lightLightBox.ids.playPause = "lightlightbox-playpause";
	lightLightBox.template.play = '<div style="margin-left: 2px; border-top: 10px solid transparent; border-bottom: 10px solid transparent; border-left: 10px solid white;"></div>';
	lightLightBox.template.pause = '<div style="margin-top: 2px; height: 16px; border-left: 3px solid white; border-right: 3px solid white; padding-left: 4px;"></div>';
	lightLightBox.template.playPauseCont = '<div id="' + lightLightBox.ids.playPause + '" style="position: absolute; width: 30px; height: 30px; padding: 5px 10px; bottom: 10px; left: 10px; color: #fff; background: #000; box-sizing: border-box; border-radius: 15px; cursor: pointer; background: rgba(0, 0, 0, ' + lightLightBox.options.overlayOpacity + ')">' + lightLightBox.template.pause + '</div>';

	//Move the caption to the right
	lightLightBox.template.caption = '<div id="' + lightLightBox.ids.caption + '" style="position: absolute; padding: 15px; bottom: 0; right: 0; color: #fff; background: #000; box-sizing: border-box; background: rgba(0, 0, 0, ' + lightLightBox.options.overlayOpacity + ')"></div>';

	//Called from interval
	lightLightBox.autoGallery = function () {
		if (lightLightBox.lightboxOpen && !lightLightBox.paused) {
			if (lightLightBox.autoGalleryTimer >= 4) {
				$('#' + lightLightBox.ids.nextButton).trigger('click');
				lightLightBox.autoGalleryTimer = 0;
			}
			lightLightBox.autoGalleryTimer++;
		} else {
			lightLightBox.autoGalleryTimer = 0;
		}
	};

	//When prev/next are clicked, reset timer.
	$( 'body' ).on( 'click', '#' + lightLightBox.ids.previousButton + ', #' + lightLightBox.ids.nextButton, function() {
		lightLightBox.autoGalleryTimer = 0;
	});

	//Pause/play click
	$( 'body' ).on( 'click', '#' + lightLightBox.ids.playPause, function() {
		if (lightLightBox.paused) {
			lightLightBox.paused = false;
			$(this).html(lightLightBox.template.pause);
			lightLightBox.autoGalleryTimer = 4; //Switch it quickly so there is a visual feedback of playing
		} else {
			lightLightBox.paused = true;
			$(this).html(lightLightBox.template.play);
		}
	});

	//Interval/timer
	setInterval(function() { lightLightBox.autoGallery(); }, 1000);

	//Add our new pause/play button to loadImage function
	lightLightBox.loadImage = (function() {
		var cached_function = lightLightBox.loadImage;
		return function() {
			cached_function.apply(this, arguments);
			$( lightLightBox.template.playPauseCont ).appendTo( '#' + lightLightBox.ids.imageCont );
			if (lightLightBox.paused) {
				$( '#' + lightLightBox.ids.playPause ).html(lightLightBox.template.play);
			} else {
				$( '#' + lightLightBox.ids.playPause ).html(lightLightBox.template.pause);
			}
		};
	}());

});
