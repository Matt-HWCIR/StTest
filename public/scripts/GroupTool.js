define(['data'],function(data){
	var module={};
	module.drawPad=null;
	var startX=0;
	var startY=0;
	var endX=0;
	var endY=0;
	
	module.showUnselected=false;
	
	module.draw=function(ctx){
		
	};
	
	module.touchEnd=function(event){
		
		dragging=false;
		module.drawPad.updateGroups();
		module.drawPad.invalidate();
		module.drawPad.setTool('Selector');
	};
	
	module.tap=function(event){
		data.activeGroup=null;
		
		startX=module.drawPad.POSITION.x;
		startY=module.drawPad.POSITION.y;
	};
	
	module.move=function(event){
		endX=module.drawPad.POSITION.x;
		endY=module.drawPad.POSITION.y;
		
		if(!data.activeGroup){
			module.newMode=false;
			var maxId=_.max(data.groups, function(t){ return t.id});
			var groupId=maxId+1;
			newGroup ={id:groupId,name:'Group',type:'group'};
			data.groups.push(newGroup);
			data.activeGroup=newGroup
		}
		
		if(data.activeGroup){
			data.activeGroup.x=Math.min(startX,endX);
			data.activeGroup.y=Math.min(startY,endY);
			data.activeGroup.w=Math.max(endX,startX)-Math.min(endX,startX);
			data.activeGroup.h=Math.max(endY,startY)-Math.min(endY,startY);
		}
		module.drawPad.invalidate();
	};
	
	return module;
});