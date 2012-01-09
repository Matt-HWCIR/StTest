define(['SymptomShape','LineShape','GroupShape'],function(SymptomShape,LineShape,GroupShape){
	var module={};
	
	module.positionShape=function(shape,existingItems,ctx,maxWidth,maxHeight,startX,startY){
		
		var newPos={name:shape.name,x:startX,y:startY,w:shape.w,h:shape.h,buffer:shape.buffer};
		newPos=module.findPosition(newPos,existingItems,maxWidth,maxHeight,ctx,startX);
		shape.x=newPos.x;
		shape.y=newPos.y;
		shape.w=newPos.w;
		shape.h=newPos.h;
	};
	
	
	module.shapeInBounds=function(newShape,maxWidth,maxHeight){
		return newShape.x+newShape.w<=maxWidth
			&& newShape.y+newShape.h<=maxHeight;
	};
	
	module.findPosition=function(newShape,shapes,maxWidth,maxHeight,ctx,startX){
		do{
			var isValid=module.shapeInBounds(newShape,maxWidth,maxHeight)
						&& module.isValidPosition(ctx,newShape,shapes,maxWidth,maxHeight); 
			if(isValid){
				break;
			}else{
				module.nextPosition(newShape,maxWidth,maxHeight,startX);
			}
		}while(newShape.x>-1);
		return newShape;
	};
	
	module.nextPosition=function(newShape,maxWidth,maxHeight,startX){
		var newX=newShape.x+newShape.buffer+newShape.w;
		if(newX<=maxWidth){
			newShape.x=newShape.x+newShape.buffer+newShape.w;
		}else{
			newShape.x=startX;
			newShape.y=newShape.y+newShape.buffer+newShape.w;
		}
		if(newShape.x>=maxWidth || newShape.y>=maxHeight){
			newShape.x=-1*newShape.w-100;
			newShape.y=-1;
		}
		return newShape;
	};
	
	
	
	module.getMouse=function(canvas,event) {
		var e=event;
		if(e.originalEvent && e.originalEvent.touches){
			e=event.originalEvent.touches[0];
			//alert(event.originalEvent.touches[0].pageX);
		}
		
		var mousePos={};
		mousePos.offsetX = 0;
		mousePos.offsetY = 0;
	    var element = canvas;

	    if (element.offsetParent) {
	    	do {
	    		mousePos.offsetX += element.offsetLeft;
	    		mousePos.offsetY += element.offsetTop;
	    	} while ((element = element.offsetParent));
	    }
	    mousePos.x = e.pageX - mousePos.offsetX;
	    mousePos.y = e.pageY - mousePos.offsetY;
	    mousePos.w=1;
	    mousePos.h=1;
	    return mousePos;
	};
	
	module.clear=function(ctx,maxWidth,maxHeight){
		ctx.clearRect(0, 0, maxWidth, maxHeight);
	};

	module.hitTest=function(ctx,pos,shapes,maxWidth,maxHeight){
		var hitShape=null;
		
		shapes.each(function(shape){
			
			if(!hitShape){
				module.clear(ctx,maxWidth,maxHeight);
				if(shape.type=='line'){
					LineShape.draw(shape,ctx);
				}else if(shape.type=='group'){
					GroupShape.draw(shape,ctx);
				}else{
					SymptomShape.draw(shape,ctx,0,0,maxWidth,maxHeight);
				}
				var imageData = ctx.getImageData(pos.x,pos.y, pos.w, pos.h);
				for(var i=0; i<imageData.data.length; i++){
					if(imageData.data[i]>0){
						hitShape=shape;
						break;
					}
				}
			}
		});
		
		
		return hitShape;
	};
	
	module.isValidPosition=function(ctx,newShape,shapes,maxWidth,maxHeight){
		
		module.clear(ctx,maxWidth,maxHeight);
		ctx.fillStyle='black';
		$(shapes).each(function(index,shape){
			ctx.fillRect(shape.x,shape.y,shape.w,shape.h);
		});
		var imageData = ctx.getImageData(newShape.x,newShape.y, newShape.w, newShape.h);
		var isValid=true;
		for(var i=0; i<imageData.data.length; i++){
			if(imageData.data[i]>0){
				isValid=false;
				break;
			}
		}
		return isValid;
	};
	
	return module;
});