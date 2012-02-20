define(['data','libs/animate'],function(data,animate){
	var module={};
	
	var checkImage=new Image();
	checkImage.src='images/check.png';
	var breakpointImage=new Image();
	breakpointImage.src='images/breakpoint.png';
	var priorityImage=new Image();
	priorityImage.src='images/certificate.png';
	
	module.draw=function(symptom,ctx,bounds){
		
		var x=symptom.x;
		var y=symptom.y;
		
		var w=symptom.w;
		var h=symptom.h;
		
		// Check if in Bounds
		var inBounds=true;
		if(x>bounds.x+bounds.w || y>bounds.y+bounds.h ){
			inBounds=false;
		}
		
		if(symptom.dragging){
			x=symptom.dragX;
			y=symptom.dragY;
		}
		
		if(inBounds){
			ctx.beginPath();
			// Set Fill
			ctx.fillStyle='rgba(0,56,95,.45)';
			if(symptom.selected==true){
				ctx.fillStyle='rgba(0,86,149,1)';
				if(symptom.groupColor){
					ctx.fillStyle=symptom.groupColor;
				}
			}
			if(symptom.dragging==true){
				ctx.fillStyle="rgba(40,40,40,.15)";
			}
			ctx.rect(x,y,w,h);
			
			ctx.save();
			ctx.shadowOffsetX=4;
			ctx.shadowOffsetY=4;
			ctx.shadowBlur=15;
			ctx.shadowColor='black';
			ctx.fill();
			ctx.restore();
			
			// set stroke 
			ctx.lineWidth=2;
			ctx.strokeStyle='#d9d9d9';
			
			
			if(symptom==data.lineStartShape){
				ctx.strokeStyle='#f4f6f7';
			}else if(symptom==data.lineEndShape){
				ctx.strokeStyle='#fdd800';
			}
			ctx.stroke();
			
		
			
			
			ctx.font="13pt Arial";
			ctx.textAlign='center';
			ctx.textBaseline='middle';
			ctx.fillStyle='white';
			
			/*ctx.shadowOffsetX=1;
			ctx.shadowOffsetY=1;
			ctx.shadowBlur=1;
			ctx.shadowColor='black';*/

			
			var words=symptom.name.split(' ');
			var textY=y+h/2;
			var lineHeight=16;
			var textY=y+h/2-((lineHeight*words.length)/2-lineHeight/2);
			for(var i=0;i<words.length; i++){
				ctx.fillText(words[i],x+w/2,textY);	
				textY=textY+lineHeight;
			}

			// Clear Dropshadow
			ctx.shadowOffsetX=null;
			ctx.shadowOffsetY=null;
			ctx.shadowBlur=null;
			ctx.shadowColor=null;
			
			if(symptom.selected==true){
				if(symptom.detailsEntered==true){
					ctx.drawImage(checkImage,x+w-15,y-9);	
				}else{
					ctx.drawImage(breakpointImage,x+w-15,y-9);
				}
			}
			
			if(symptom.topPriority==true){
				ctx.drawImage(priorityImage,x+3,y+h-25);
			}
		}
	};
	
	return module;
});