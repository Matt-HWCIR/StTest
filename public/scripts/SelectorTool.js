define(['data','SymptomTray','libs/animate'],function(data,SymptomTray,animate){
	var module={};
	var dragging=false;
	var edgeBuffer=30;
	module.drawPad=null;
	module.showUnselected=true;
	
	
	module.changeDirection=function(){
		var hitLine=module.drawPad.hitTest(module.drawPad.POSITION,data.lines());
		if(hitLine){
			data.activeLine=hitLine;
		}
		if(data.activeLine  && module.drawPad.canChangeDirection==true){
			if(data.activeLine.direction=='StartToEnd'){
				data.lines(data.activeLine).update({direction:'EndToStart'});
			}else if(data.activeLine.direction=='EndToStart'){
				data.lines(data.activeLine).update({direction:null});
			}else{
				data.lines(data.activeLine).update({direction:'StartToEnd'});
			}
			module.drawPad.invalidate();
		}
	};
	module.touchEnd=function(event){
		var x,y;
		$.log('touchEnd');
		if(data.activeShape){
			x=dragging?data.activeShape.dragX:data.activeShape.x;
			y=dragging?data.activeShape.dragY:data.activeShape.y;
			var selected=data.activeShape.selected;
			var index=data.activeShape.index;
			
			if(dragging){
				var midX=x+data.activeShape.w/2;
				var midY=y+data.activeShape.h/2;
				
				if(module.drawPad.showTray){
					selected=!(module.drawPad.isInTray(midX,midY));
					
					if(!selected){
						data.lines([{start:data.activeShape.name},{end:data.activeShape.name}]).remove();
					}	
					//  Find where we landed
					var hitShape=module.drawPad.hitTest(
							{x:x,y:y,w:data.activeShape.w,h:data.activeShape.h}
							,data.db({'name':{'!is':data.activeShape.name}}));
					
					if(hitShape){
						if(index>hitShape.index){
							index=hitShape.index-.001;
						}else{
							index=hitShape.index+.001;
						}
					}
				}
				
			}
			
			data.db(data.activeShape).update({
				dragging:false,
				selected:selected,
				x:x,
				y:y,
				index:index
			});
			
			data.activeShape=data.db(data.activeShape).first();
		
			
			module.drawPad.reposition(false,true);
		}else if(data.activeGroup){
			x=dragging?data.activeGroup.dragX:data.activeGroup.x;
			y=dragging?data.activeGroup.dragY:data.activeGroup.y;
			var bounds=module.drawPad.ensureGroupIsInBounds(x,y,data.activeGroup);
			data.groups(data.activeGroup).update({
				dragging:false,
				x:bounds.x,
				y:bounds.y,
				w:bounds.w,
				h:bounds.h
			});
			data.activeGroup=data.groups(data.activeGroup).first();
			
		}
		dragging=false;
		
		module.drawPad.updateGroups();
		module.drawPad.invalidate();
	};
	
	module.doubleTap=function(event){
		if(data.activeGroup){
			module.drawPad.showGroupDialog();
		};
	};
	
	module.longTap=function(event){
		if(data.activeGroup){
			var groupName=data.activeGroup.name;
			if(!groupName){
				groupName='Group #'+data.activeGroup.id;
			}
			var doDelete=confirm('Are you sure you want to delete the group "'
					+groupName+'"?');
			if(doDelete){
				data.groups(data.activeGroup).remove();
				data.activeGroup=null;
				module.drawPad.invalidate();
			}
		}
	};

	module.tap=function(event){
		$.log('tap');
		
		if(dragging)return; // only allow one selection
		var hitItem=null;
		data.activeGroup=null;
		
		var shapes=data.db();
		if(module.drawPad.showTray==false){
			shapes=data.db({selected:true});
		}
		data.activeShape=module.drawPad.hitTest(module.drawPad.POSITION,shapes);
		
		if(module.drawPad.canChangePriority){
			if(data.activeShape){
				var groupId=data.activeShape.groupId;
				if(groupId){
					data.db({selected:true,groupId:groupId,}).each(function(item){
						var topPriority=item==data.activeShape;
						data.db(item).update({topPriority:topPriority});
					});
				}
				module.drawPad.invalidate();
			}
			//exit out
			data.activeShape=null;
			return;
		}
		
		if(data.activeShape){
			hitItem=data.activeShape;
			var maxzindex=data.groups().max('zindex')+1;;
			
			data.db(data.activeShape).update({
				zindex:maxzindex,
				offsetX:module.drawPad.POSITION.x-data.activeShape.x,
				offsetY:module.drawPad.POSITION.y-data.activeShape.y,
			});	
			data.activeShape=data.db(data.activeShape).first();
			if(module.drawPad.canEnterSymptomDetails==true){
				module.drawPad.showSymptomDialog();	
			}
		}
		
		// see if we are on a line
		if(!hitItem){
			/*var hitLine=module.drawPad.hitTest(module.drawPad.POSITION,data.lines());
			if(hitLine){
				data.activeLine=hitLine;
				hitItem=data.activeLine;
			}*/
			
			if(module.drawPad.canChangeDirection){
				module.changeDirection();
			}
		}
		
		// see if we are on a group
		if(!hitItem){
				
			data.activeGroup=module.drawPad.hitTest(module.drawPad.POSITION,data.groups().order("zindex desc"));
			
			if(data.activeGroup){
				hitItem=data.activeGroup;
				// see if we are on an edge
				var offsetX=module.drawPad.POSITION.x-data.activeGroup.x;
				var offsetY=module.drawPad.POSITION.y-data.activeGroup.y;
				var anchor=null;
				if(offsetX<edgeBuffer){
					anchor='left';
				}else if(offsetX>data.activeGroup.w-edgeBuffer){
					anchor='right';
				}else if(offsetY<edgeBuffer){
					anchor='top';
				}else if(offsetY>data.activeGroup.h-edgeBuffer){
					anchor='bottom';
				}
				
				var maxzindex=data.groups().max('zindex')+1;;
				data.groups(data.activeGroup).update({
					zindex:maxzindex,
					offsetX:module.drawPad.POSITION.x-data.activeGroup.x,
					offsetY:module.drawPad.POSITION.y-data.activeGroup.y,
					startR:data.activeGroup.x+data.activeGroup.w,
					startL:data.activeGroup.x,
					startB:data.activeGroup.y+data.activeGroup.h,
					startT:data.activeGroup.y,
					startW:data.activeGroup.w,
					startH:data.activeGroup.h,
					anchor:anchor
				});
				data.activeGroup=data.groups(data.activeGroup).first();
			}
		}
		
		// see if we hit next button
		if(!hitItem){
			if(SymptomTray.hitBackButton(module.drawPad.POSITION)){
				module.drawPad.goBack();
			}else if(SymptomTray.hitNextButton(module.drawPad.POSITION)){
				module.drawPad.goNext();
			}
		}
		
		
		module.drawPad.invalidate();
	};
	
	module.move=function(event){
		// Exit if we can't drag
		if(module.drawPad.canDrag==false) return;
		
		if(data.activeShape){
			data.db(data.activeShape).update({
				dragging:true,
				dragX:module.drawPad.POSITION.x-data.activeShape.offsetX,
				dragY:module.drawPad.POSITION.y-data.activeShape.offsetY
			},false);
			dragging=true;
			data.activeShape=data.db(data.activeShape).first();
		}else if (data.activeGroup){
			var options={
					dragging:true,
					dragX:module.drawPad.POSITION.x-data.activeGroup.offsetX,
					dragY:module.drawPad.POSITION.y-data.activeGroup.offsetY,
				};
			var deltaX=module.drawPad.POSITION.x;
			var deltaY=module.drawPad.POSITION.y;
			
			if(data.activeGroup.anchor=='left'){
				options.dragY=data.activeGroup.y;
				if(deltaX<data.activeGroup.startR){
					options.dragX=deltaX;
					options.w=data.activeGroup.startR-deltaX;
				}else{
					options.w=deltaX-data.activeGroup.startR;
					options.dragX=data.activeGroup.startR;
				}
			}else if(data.activeGroup.anchor=='right'){
				options.dragY=data.activeGroup.y;
				if(deltaX>data.activeGroup.startL){
					options.dragX=data.activeGroup.startL;
					options.w=deltaX-data.activeGroup.startL;
				}else{
					options.w=data.activeGroup.startL-deltaX;
					options.dragX=deltaX;
				}
			}else if(data.activeGroup.anchor=='top'){
				options.dragX=data.activeGroup.x;
				if(deltaY<data.activeGroup.startB){
					options.dragY=deltaY;
					options.h=data.activeGroup.startB-deltaY;
				}else{
					options.h=deltaY-data.activeGroup.startB;
					options.dragY=data.activeGroup.startB;
				}
			}else if(data.activeGroup.anchor=='bottom'){
				options.dragX=data.activeGroup.x;
				if(deltaY>data.activeGroup.startT){
					options.dragY=data.activeGroup.startT;
					options.h=deltaY-data.activeGroup.startT;
				}else{
					options.h=data.activeGroup.startT-deltaY;
					options.dragY=deltaY;
				}
			}
			data.groups(data.activeGroup).update(options,false);
			data.activeGroup=data.groups(data.activeGroup).first();
			dragging=true;
		}
		module.drawPad.invalidate();
	};
	
	return module;
});