define(['data','libs/MathUtils'],function(data,MathUtils){
	var module={};
	
	module.draw=function(line,ctx,gctx){
		
		var lineStartShape=_.find(data.db,function(t){return t.selected==true && t.name==line.start});
		var lineEndShape=_.find(data.db,function(t){return t.selected==true && t.name==line.end});
		
		if(lineStartShape && lineEndShape){
			var startX=lineStartShape.x;
			var startY=lineStartShape.y;
			if(lineStartShape.dragging){
				startX=lineStartShape.dragX;
				startY=lineStartShape.dragY;
			}
			
			var endX=lineEndShape.x;
			var endY=lineEndShape.y;
			if(lineEndShape.dragging){
				endX=lineEndShape.dragX;
				endY=lineEndShape.dragY;
			}
			
			// set to midpoints
			var startRect={x:startX,y:startY,w:lineStartShape.w,h:lineStartShape.h};
			var endRect={x:endX,y:endY,w:lineEndShape.w,h:lineEndShape.h};
			startX=startX+(lineStartShape.w/2);
			startY=startY+(lineStartShape.h/2);
			endX=endX+(lineEndShape.w/2);
			endY=endY+(lineEndShape.h/2);
			
			// adjust so they aren't behind boxes
			var pt1=MathUtils.findIntersection(startRect,endRect);
			var pt2=MathUtils.findIntersection(endRect,startRect);
			
			var isActive=false;
			if(data.activeLine){
				isActive=data.activeLine==line;
				
			}
			var showStartTip=false;
			var showEndTip=false;
			var startPt=pt1;
			var endPt=pt2;

			if(line.direction){
				if(line.direction=='EndToStart'){
					showEndTip=true;
				}else if(line.direction=='StartToEnd'){
					showStartTip=true;
				}else if(line.direction=='Both'){
					showEndTip=true;
					showStartTip=true;
				}
			}
			MathUtils.drawArrow(startPt,endPt,isActive,showStartTip,showEndTip,ctx);
		}
	};
	
	return module;
});