//
// source: https://www.geeksforgeeks.org/simple-swipe-with-vanilla-javascript/
//


var initialTouchX, initialTouchY, finalTouchX, finalTouchY, swipeElem, swipeCallbackLeft, swipeCallbackRight;
var swipeThreshold = 100; 

function handleTouch(elem, startX, endX, onSwipeLeft, onSwipeRight) {
    var horizontalDistance = 
    finalTouchX - initialTouchX;
    var verticalDistance = 
    finalTouchY - initialTouchY;

    if (Math.abs(horizontalDistance) > Math.abs(verticalDistance) && Math.abs(horizontalDistance) > swipeThreshold) {
        swipeElem.removeEventListener('touchstart', handleTouchStart);
		swipeElem.removeEventListener('touchend', handleTouchEnd);
		if (finalTouchX - initialTouchX < 0) {
			if(onSwipeLeft){
				onSwipeLeft(); 
				console.log('swipe left');
			}
        } else {
			if(onSwipeRight){
				onSwipeRight(); 
				console.log('swipe right');
			}
        }
    }
}

function handleTouchStart(event) {
	initialTouchX = event.touches[0].clientX;
	initialTouchY = event.touches[0].clientY;
}

function handleTouchEnd(event) {
	finalTouchX = event.changedTouches[0].clientX;
	finalTouchY = event.changedTouches[0].clientY;
	handleTouch(swipeElem, initialTouchX, finalTouchX, swipeCallbackLeft, swipeCallbackRight);
}

function configureSwipeEvents(elem, cbLeft, cbRight) {
	swipeElem = elem;
	swipeCallbackLeft = cbLeft;
	swipeCallbackRight = cbRight;
	elem.addEventListener ('touchstart', handleTouchStart);
    elem.addEventListener('touchend', handleTouchEnd);
};