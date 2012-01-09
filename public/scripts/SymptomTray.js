define(['SymptomShape'],function(SymptomShape){
	var module={};
	
	var backImage=new Image();
	var nextImage=new Image();
	backImage.src='images/navigate_left.png';
	nextImage.src='images/navigate_right.png';

	
	module.BUFFER=20;
	module.WIDTH=100;
	module.HEIGHT=100;
	module.X=0;
	module.Y=0;
	module.BUTTON_BUFFER=5;
	module.BUTTON_WIDTH=32;
	module.BUTTON_HEIGHT=32;
	
	
	

	
	module.draw=function(showBack,showNext,ctx){
		
		ctx.beginPath();
		var grd=ctx.createLinearGradient(module.X,module.Y,module.X,module.Y+module.HEIGHT);
		grd.addColorStop(0,'rgba(40,40,40,.05)');
		grd.addColorStop(.6,'rgba(40,40,40,.25)');
		grd.addColorStop(1,"rgba(40,40,40,.15)");
		ctx.fillStyle=grd;
		ctx.rect(module.X,module.Y,module.WIDTH,module.HEIGHT);
		ctx.fill();
		var yPos=module.Y+module.HEIGHT/2-module.BUTTON_HEIGHT/2;
		if(showBack){
			ctx.drawImage(backImage,module.X+module.BUTTON_BUFFER,yPos);
		}
		if(showNext){
			ctx.drawImage(nextImage,module.WIDTH-module.BUTTON_BUFFER-module.BUTTON_WIDTH,yPos);
		}
		// draw border
		ctx.beginPath();
		ctx.moveTo(module.X,module.Y);
		ctx.strokeStyle="#EEE";
		ctx.lineTo(module.X+module.WIDTH,module.Y);
		ctx.lineWidth="1px";
		ctx.stroke();
	};
	
	module.hitBackButton=function(pos){
		var hitButton=false;
		if(pos.x<module.X+module.BUTTON_BUFFER+module.BUTTON_WIDTH && 
				pos.y>module.Y){
			hitButton=true;
		}
		return hitButton;
	};
	
	module.hitNextButton=function(pos){
		var hitButton=false;
		if(pos.x>module.X+module.WIDTH-module.BUTTON_BUFFER-module.BUTTON_WIDTH && 
				pos.y>module.Y){
			hitButton=true;
		}
		return hitButton;
	};
	
	return module;
});