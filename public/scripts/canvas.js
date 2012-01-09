define(['data'],function(data){
	var INTERVAL=20;
	var canvas, ghostCanvas;
	var HEIGHT,WEIGTH,stage;
	var module={};
	var canvasValid=false;
	var ctx,gctx;
	
	var symptomWidth=100;
	var symptomHeight=100;
	var symptomBuffer=10;
	var my=0;
	var mx=0;
	var mySel;
	var isDrag=false;
	var offsetx;
	var offsety;
	
	function clear(c) {
  		c.clearRect(0, 0, WIDTH, HEIGHT);
	}
	
	function invalidate(){
		canvasValid=false;
	}
	function getMouse(e) {
	      var element = canvas, offsetX = 0, offsetY = 0;

	      if (element.offsetParent) {
	        do {
	          offsetX += element.offsetLeft;
	          offsetY += element.offsetTop;
	        } while ((element = element.offsetParent));
	      }

	     

	      mx = e.pageX - offsetX;
	      my = e.pageY - offsetY;
	}

	
	function nextPosition(pos){
		var newX=pos.x+symptomBuffer+symptomWidth;
		if(newX<WIDTH){
			pos.x=pos.x+symptomBuffer+symptomWidth;
		}else{
			pos.x=symptomBuffer;
			pos.y=pos.y+symptomBuffer+symptomHeight;
		}
		if(pos.x>WIDTH || pos.y>HEIGHT){
			pos.x=-1;
			pos.y=-1;
		}
		return pos;
	}
	
	function isValidPosition(pos,symptoms){
		
		clear(gctx);
		gctx.fillStyle='black';
		$(symptoms).each(function(index,symptom){
			gctx.fillRect(symptom.x,symptom.y,symptomWidth,symptomHeight);
		});
		var imageData = gctx.getImageData(pos.x,pos.y, symptomWidth, symptomHeight);
		var isValid=true;
		for(var i=0; i<imageData.data.length; i++){
			if(imageData.data[i]>0){
				isValid=false;
				break;
			}
		}
		return isValid;
	}
	
	
	function findPosition(pos,symptoms){
		do{
			var isValid=symptomInBounds(pos.x,pos.y)
						&& isValidPosition(pos,symptoms); 
			if(isValid){
				break;
			}else{
				pos=nextPosition(pos);
			}
		
		}while(pos.x>-1);
	
		return pos;
	}
	
	function symptomInBounds(x,y){
		return x+symptomBuffer+symptomWidth<WIDTH
				&& y+symptomBuffer+symptomHeight<HEIGHT;
	}
	
	function drawSymptoms(context){
		context.fillStyle='#444444';
		var boxes=[];
		var pos;
		// reset x and y
		$(data.selectedSymptoms).each(function(index,symptom){
			var startPos={x:symptom.x?symptom.x:10,y:symptom.y?symptom.y:10,};
			pos=findPosition(startPos,boxes);
			symptom.x=pos.x;
			symptom.y=pos.y;
			
			boxes.push(symptom);
			
		});
		
		$(data.selectedSymptoms).each(function(index,symptom){
			context.fillRect(symptom.x,symptom.y,symptomWidth,symptomHeight);
		});
		
		
	}
	
	function draw(){
		if(canvasValid==false){
			clear(ctx);
			
			drawSymptoms(ctx);	
		
		
		
		
			canvasValid=true;
		}
		
	}
	
	function drawshape(context, shape, fill) {
		  context.fillStyle = fill;
		  
		  // We can skip the drawing of elements that have moved off the screen:
		  if (shape.x > WIDTH || shape.y > HEIGHT) return; 
		  if (shape.x + shape.w < 0 || shape.y + shape.h < 0) return;
		  
		  context.fillRect(shape.x,shape.y,shape.w,shape.h);
		}
	
	function myDown(e){
		getMouse(e);
		clear(gctx);
		var symptoms=data.selectedSymptoms;
		var l = symptoms.length;
		for (var i = l-1; i >= 0; i--) {
		    // draw shape onto ghost context
			var shape={
						x:symptoms[i].x,
						y:symptoms[i].y,
						w:symptomWidth,
						h:symptomHeight
					};
			
		    drawshape(gctx,shape, 'black');
		    
		    // get image data at the mouse x,y pixel
		    var imageData = gctx.getImageData(mx, my, 1, 1);
		    
		    // if the mouse pixel exists, select and break
		    if (imageData.data[3] > 0) {
		      mySel = symptoms[i];
		      offsetx = mx - mySel.x;
		      offsety = my - mySel.y;
		      mySel.x = mx - offsetx;
		      mySel.y = my - offsety;
		      isDrag = true;
		      invalidate();
		      clear(gctx);
		      return;
		    }
		}
	}
	
	function myMove(e){
		  if (isDrag){
		    getMouse(e);
		    
		    if(mx-offsetx<WIDTH-symptomWidth && mx-offsetx>=0){
		    	mySel.x = mx - offsetx;	
		    }
		    if(my-offsety<HEIGHT-symptomHeight && my-offsety>=0){
		    	mySel.y = my - offsety;
		    }
		    
		    // something is changing position so we better invalidate the canvas!
		    invalidate();
		  }
		}

	function addListeners(){
		
		$(canvas).bind($.app.END_EV,function(event){
			isDrag=false;
		});
		$(canvas).bind($.app.START_EV,function(event){
			myDown(event);
		});
		$(canvas).bind($.app.MOVE_EV,function(event){
			myMove(event);
		});
	}
	
	module.setCanvas=function(c){
		WIDTH=$(c).width();
		HEIGHT=$(c).height();
		
		if(WIDTH===undefined) return;
		if(!canvas){
			canvas=$('<canvas></canvas>')[0];
			ghostCanvas=$('<canvas></canvas>')[0];
			ctx=canvas.getContext("2d");
			gctx=canvas.getContext("2d");
			setInterval(draw,INTERVAL);
			
			addListeners();
			
		}
		if($(canvas).attr('width')!=WIDTH){
			$(canvas).attr('width',WIDTH);
			$(ghostCanvas).attr('width',WIDTH);
		}
		if($(canvas).attr('height')!=HEIGHT){
			$(canvas).attr('height',HEIGHT);
			$(ghostCanvas).attr('height',HEIGHT);
		}
		$(canvas).css('background-color','blue');
		
		if($(canvas).parent()!=c){
			$(c).append(canvas);
		}
	   	invalidate();
	}
	
	module.invalidate=function(){
		invalidate();
	}
	
	return module;
});