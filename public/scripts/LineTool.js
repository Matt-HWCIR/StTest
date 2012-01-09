define(['data'],function(data){
	var module={};
	var dragging=false;
	module.drawPad=null;
	var lineNo=0;
	var lineWidth=15;
	module.showUnselected=false;
	
	
	module.draw=function(ctx){
		if(dragging  && data.lineStartShape){
			ctx.beginPath();
			ctx.strokeStyle='#5c8727';
			ctx.moveTo(data.lineStart.x,data.lineStart.y);
			ctx.lineTo(data.lineEnd.x,data.lineEnd.y);
			ctx.lineWidth=lineWidth;
			ctx.stroke();
		}
	};
	
	module.touchEnd=function(event){
		$.log('touchEnd');
		dragging=false;
		if(data.lineStartShape && data.lineEndShape){
			var existingLine=data.lines([{start:data.lineStartShape.name,end:data.lineEndShape.name},{start:data.lineEndShape.name,end:data.lineStartShape.name}]).first();
			if(!existingLine){
				data.lines.insert({id:lineNo,start:data.lineStartShape.name,end:data.lineEndShape.name,type:'line'});
				lineNo++;
				data.activeLine=data.lines({id:lineNo}).first();
				
			}
			
		}
		data.lineStartShape=null;
		data.lineEndShape=null;
		module.drawPad.invalidate();
	};
	
	
	
	module.doubleTap=function(event){
		if(data.activeLine){
			var doDelete=confirm('Are you sure you want to delete the connection from "'
					+data.activeLine.start+'" to "'+data.activeLine.end+'"?');
			if(doDelete){
				data.lines(data.activeLine).remove();
				data.activeLine=null;
				module.drawPad.invalidate();
			}
		}
	};
	
	
	module.tap=function(event){
		if(dragging)return; // only allow one selection
		if(module.drawPad.canDrawNewLine) {
			
		
			data.lineStartShape=module.drawPad.hitTest(module.drawPad.POSITION,data.db());
			
			if(data.lineStartShape){
				data.activeShape=data.lineStartShape;
				data.lineStart={x:module.drawPad.POSITION.x,y:module.drawPad.POSITION.y};
				data.lineEnd={x:module.drawPad.POSITION.x,y:module.drawPad.POSITION.y};
			}else{
				var hitLine=module.drawPad.hitTest(module.drawPad.POSITION,data.lines());
				if(hitLine){
					data.activeLine=hitLine;
				}
			}
		}
		module.drawPad.invalidate();
	};
	
	module.move=function(event){
		if(data.lineStartShape){
			dragging=true;
			data.lineEnd={x:module.drawPad.POSITION.x,y:module.drawPad.POSITION.y};
			data.lineEndShape=module.drawPad.hitTest(module.drawPad.POSITION,data.db({selected:true,name:{'!is':data.lineStartShape.name}}));
		}
		module.drawPad.invalidate();
	};
	
	return module;
});