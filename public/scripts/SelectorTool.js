define(['data','SymptomTray','libs/animate'],function(data,SymptomTray,animate){
	var module={};
	var dragging=false;
	var edgeBuffer=30;
	module.drawPad=null;
	module.showUnselected=true;
	
	
	module.changeDirection=function(){
		var hitLine=module.drawPad.hitTest(module.drawPad.POSITION,data.lines);
		if(hitLine){
			data.activeLine=hitLine;
		}
		if(data.activeLine  && module.drawPad.canChangeDirection==true){
			if(data.activeLine.direction=='StartToEnd'){
				data.activeLine.direction='EndToStart';
			}else if(data.activeLine.direction=='EndToStart'){
				data.activeLine.direction='Both';
			}else if(data.activeLine.direction=='Both'){
				data.activeLine.direction=null;
			}else{
				data.activeLine.direction='StartToEnd';
			}
			module.drawPad.invalidate();
		}
	};
	module.touchEnd=function(event){
		var x,y;
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
						data.lines = _.filter(data.lines,function(t){
							return t.start!=data.activeShape.name && t.end!=data.activeShape.name;
						}) ;
					}
					//  Find where we landed
					otheritems = _.filter(data.db,function(t){return t.name != data.activeShape.name});
					var hitShape=module.drawPad.hitTest(
							{x:x,y:y,w:data.activeShape.w,h:data.activeShape.h}
							,otheritems);
					
					if(hitShape){
						if(index>hitShape.index){
							index=hitShape.index-.001;
						}else{
							index=hitShape.index+.001;
						}

					}
				}
				
			}
			
			data.activeShape.dragging=false;
			data.activeShape.selected=selected;
			data.activeShape.x=x;
			data.activeShape.y=y;
			data.activeShape.index=index;
			module.drawPad.reposition(false,true);
		}else if(data.activeGroup){
			x=dragging?data.activeGroup.dragX:data.activeGroup.x;
			y=dragging?data.activeGroup.dragY:data.activeGroup.y;
			var bounds=module.drawPad.ensureGroupIsInBounds(x,y,data.activeGroup);
			data.activeGroup.dragging=false;
			data.activeGroup.x=bounds.x;
			data.activeGroup.y=bounds.y;
			data.activeGroup.w=bounds.w;
			data.activeGroup.h=bounds.h;
			
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
				data.groups = _.filter(data.groups, function(t){ return t !=data.activeGroup});
				data.activeGroup=null;
				module.drawPad.invalidate();
			}
		}
	};

	module.tap=function(event){
		if(dragging)return; // only allow one selection
		var hitItem=null;
		data.activeGroup=null;
		
		var shapes=data.db;
		if(module.drawPad.showTray==false){
			shapes=_.filter(data.db,function(t){ return t.selected==true});
			shapes =_.sortBy(shapes,function(t){return t.zindex}).reverse();
		}
		data.activeShape=module.drawPad.hitTest(module.drawPad.POSITION,shapes);
		
		if(module.drawPad.canChangePriority){
			if(data.activeShape){
				var groupId=data.activeShape.groupId;
				if(groupId){
					selecteditems=_.filter(data.db,function(t){ return t.selected===true && t.groupId===groupId});
					_.each(selecteditems,function(item){
						var topPriority=item===data.activeShape;
						item.topPriority=topPriority;
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
			var maxzindex=1;

			maxOb=_.max(data.db,function(t){return t.zindex});
			if(maxOb){
				maxzindex=maxOb.zindex+1;
			}

			console.log('shape: '+data.activeShape.name+' - index='+maxzindex);
			data.activeShape.zindex=maxzindex;
			data.activeShape.offsetX=module.drawPad.POSITION.x-data.activeShape.x;
			data.activeShape.offsetY=module.drawPad.POSITION.y-data.activeShape.y;

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

			orderedgroups = _.sortBy(data.groups,function(t){return t.zindex}).reverse();
			data.activeGroup=module.drawPad.hitTest(module.drawPad.POSITION,orderedgroups);
			
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

				var maxzindex=1;
				var maxOb=_.max(data.groups,function(t){return t.zindex});
				if(maxOb){
					maxzindex=maxOb.zindex+1;
				}
				data.activeGroup.zindex=maxzindex;
				data.activeGroup.offsetX=module.drawPad.POSITION.x-data.activeGroup.x;
				data.activeGroup.offsetY=module.drawPad.POSITION.y-data.activeGroup.y;
				data.activeGroup.startR=data.activeGroup.x+data.activeGroup.w;
				data.activeGroup.startL=data.activeGroup.x;
				data.activeGroup.startB=data.activeGroup.y+data.activeGroup.h;
				data.activeGroup.startT=data.activeGroup.y;
				data.activeGroup.startW=data.activeGroup.w;
				data.activeGroup.startH=data.activeGroup.h;
				data.activeGroup.anchor=anchor;
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
			data.activeShape.dragging=true;
			data.activeShape.dragX=module.drawPad.POSITION.x-data.activeShape.offsetX;
			data.activeShape.dragY=module.drawPad.POSITION.y-data.activeShape.offsetY;
			dragging=true;

		}else if (data.activeGroup){
			var options={
					dragging:true,
					dragX:module.drawPad.POSITION.x-data.activeGroup.offsetX,
					dragY:module.drawPad.POSITION.y-data.activeGroup.offsetY
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
			_.each(_.keys(options),function(t){
				data.activeGroup[t]=options[t];
			});
			dragging=true;
		}
		module.drawPad.invalidate();
	};
	
	return module;
});