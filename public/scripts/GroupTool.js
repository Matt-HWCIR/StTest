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
			var maxId=data.groups().max('id');
			var groupId=maxId+1;
			data.groups.insert({id:groupId,name:'Group',type:'group',});
			data.activeGroup=data.groups({id:groupId,}).first();
		}
		
		if(data.activeGroup){
			data.groups(data.activeGroup).update({
				x:Math.min(startX,endX),
				y:Math.min(startY,endY),
				w:Math.max(endX,startX)-Math.min(endX,startX),
				h:Math.max(endY,startY)-Math.min(endY,startY),
			},false);
			data.activeGroup=data.groups(data.activeGroup).first();
		}
		module.drawPad.invalidate();
	};
	
	return module;
});