define(['data','libs/MathUtils'],function(data,MathUtils){
	var module={};
	
	var checkImage=new Image();
	checkImage.src='images/check.png';
	var breakpointImage=new Image();
	breakpointImage.src='images/breakpoint.png';
	
	module.draw=function(group,ctx){
		var isActive=group==data.activeGroup;
		var radius=3.5;
		var x=group.x;
		var y=group.y;
		
		if(group.dragging){
			x=group.dragX;
			y=group.dragY;
		}
		if(_.isUndefined(x)){
			x=group.dragX;
		}
		if(_.isUndefined(y)){
			y=group.dragY;
		}

		if(_.isUndefined(x)){
			x=100;
		}
		if(_.isUndefined(y)){
			y=100;
		}
		
		var r=MathUtils.HexToR(group.color);
		var g=MathUtils.HexToG(group.color);
		var b=MathUtils.HexToB(group.color);
		
		ctx.lineWidth=2;
		ctx.strokeStyle='#ececec';
		ctx.fillStyle='rgba('+r+','+g+','+b+',.2)';
		ctx.beginPath();
		ctx.rect(x,y,group.w,group.h);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
		
		if(isActive){
			ctx.lineWidth=1;
			ctx.strokeStyle='#d9d9d9';
			ctx.fillStyle='#005695';
			ctx.beginPath();
			ctx.arc(x+group.w/2, y, radius, 0, 2 * Math.PI, false);
			ctx.fill();	
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(x+group.w/2, y+group.h, radius, 0, 2 * Math.PI, false);
			ctx.fill();	
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(x, y+group.h/2, radius, 0, 2 * Math.PI, false);
			ctx.fill();	
			ctx.stroke();
			
			ctx.beginPath();
			ctx.arc(x+group.w, y+group.h/2, radius, 0, 2 * Math.PI, false);
			ctx.fill();	
			ctx.stroke();
		}
		
		// write Group Name
		var yNameOffset=18;
		var xNameOffset=8;
		ctx.font="bold 13pt Calibri";
		ctx.textAlign='left';
		var groupName=group.name;
		if(!groupName){
			groupName='Group #'+group.id;
		}
		ctx.fillStyle="white";
		ctx.fillText(groupName,x+xNameOffset,y+yNameOffset+1);
		
		
		ctx.fillStyle="#2F2F2F";
		ctx.fillText(groupName,x+xNameOffset,y+yNameOffset);
		
		
		if(group.detailsEntered==true){
			ctx.drawImage(checkImage,x+group.w-15,y-9);	
		}else{
			ctx.drawImage(breakpointImage,x+group.w-15,y-9);
		}
		
		
		
	};
	
	return module;
});