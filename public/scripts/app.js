define([],function(){
	var module={};

    //jquery bug that logs deprecation message
    (function(){
        // remove layerX and layerY
        var all = $.event.props,
            len = all.length,
            res = [];
        while (len--) {
            var el = all[len];
            if (el != 'layerX' && el != 'layerY') res.push(el);
        }
        $.event.props = res;
    }());
	
	$(function(){
		$.app=module;
		
		module.hasTouch='ontouchstart' in window;
		
		
		$.log=function(item){
			if(console && !module.hasTouch){
				console.log(item);
			}
		};
		
		module.END_EV = module.hasTouch ? 'touchend' : 'mouseup';
		module.START_EV = module.hasTouch ? 'touchstart' : 'mousedown';
		module.MOVE_EV = module.hasTouch ? 'touchmove' : 'mousemove';
		
		
		// Block app from moving
		$(document).bind('touchmove',function(event){
			event.preventDefault();
		});
		
		// Respond to orientation changes
		$(document).bind('orientationchange',function(event){
			module.resize();
		});
		
		// Respond to Window Resizing
		$(window).bind('resize',function(event){
			module.resize();
		});
		
		
		
		
		require(['DrawPad'],function(drawPad){
			// init canvas
			drawPad.END_EV=module.END_EV;
			
			
			module.resize=function(){
				drawPad.resize();
			};
			
			drawPad.init($('#drawPad')[0]);
		});
	
	});		
	
	
	
	return module;
});