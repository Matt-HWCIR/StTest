define([],function(){
	
	var module={};
	
	
	module.findIntersection=function(from,to){
		var startPoint={x:from.x+from.w/2,y:from.y+from.h/2};
		var endPoint={x:to.x+to.w/2,y:to.y+to.h/2};
		var ip=null;
		
		//bottom
		ip=module.lineIntersectLine(startPoint,endPoint,{x:from.x,y:from.y+from.h},{x:from.x+from.w,y:from.y+from.h});
		if(ip==null){
			//top
			ip=module.lineIntersectLine(startPoint,endPoint,{x:from.x,y:from.y},{x:from.x+from.w,y:from.y});
		}
		if(ip==null){
			// left
			ip=module.lineIntersectLine(startPoint,endPoint,{x:from.x,y:from.y},{x:from.x,y:from.y+from.h});
		}
		if(ip==null){
			// right
			ip=module.lineIntersectLine(startPoint,endPoint,{x:from.x+from.w,y:from.y},{x:from.x+from.w,y:from.y+from.h});
		}
		return ip;
	};
	
	module.lineIntersectLine=function(A,B,E,F,as_seg){
		if(!as_seg)as_seg=true;
		var ip=null;
		var a1;
		var a2;
		var b1;
		var b2;
		var c1;
		var c2;
		
		a1= B.y-A.y;
		b1= A.x-B.x;
		c1= B.x*A.y - A.x*B.y;
		a2= F.y-E.y;
		b2= E.x-F.x;
		c2= F.x*E.y - E.x*F.y;
		
		var denom=a1*b2 - a2*b1;
		if (denom == 0) {
			return null;
		}
		ip={};
		ip.x=(b1*c2 - b2*c1)/denom;
		ip.y=(a2*c1 - a1*c2)/denom;
		
		//---------------------------------------------------
		//Do checks to see if intersection to endpoints
		//distance is longer than actual Segments.
		//Return null if it is with any.
		//---------------------------------------------------
		if(as_seg){
			if(Math.pow(ip.x - B.x, 2) + Math.pow(ip.y - B.y, 2) > Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2))
			{
				return null;
			}
			if(Math.pow(ip.x - A.x, 2) + Math.pow(ip.y - A.y, 2) > Math.pow(A.x - B.x, 2) + Math.pow(A.y - B.y, 2))
			{
				return null;
			}
			
			if(Math.pow(ip.x - F.x, 2) + Math.pow(ip.y - F.y, 2) > Math.pow(E.x - F.x, 2) + Math.pow(E.y - F.y, 2))
			{
				return null;
			}
			if(Math.pow(ip.x - E.x, 2) + Math.pow(ip.y - E.y, 2) > Math.pow(E.x - F.x, 2) + Math.pow(E.y - F.y, 2))
			{
				return null;
			}
		}
		return ip;
	};
	
	module.findOppositeSlope=function(start,end){
		var s=0;
		if(end.x-start.x==0){
			s=NaN;
		}else if(end.y-start.y==0){
			s=0;
		}else{
			s=(end.y-start.y)/(end.x-start.x);
			s=-1*1/s;
		}
		
		
		return Math.atan(s);
	};
	
	module.findPointOnSlope=function(slope,startPoint,distance){
		var pt={};
		if(isNaN(slope)){
			pt.x=startPoint.x+distance;
			pt.y=startPoint.y;
		}else if (slope==0){
			pt.x=startPoint.x;
			pt.y=startPoint.y+distance;
		}else{
			pt.x=startPoint.x+distance*Math.cos(slope);
			pt.y=startPoint.y+distance*Math.sin(slope);	
		}
		
		return pt;
	};
	
	module.findSlope=function(start,end){
		var s=0;
		
		if(end.x-start.x==0){
		}else if(end.y-start.y==0){
			s=NaN;
			
		}else{
			s=(end.y-start.y)/(end.x-start.x);
		}
		return Math.atan(s);
	};
	
	module.moveOnLine=function(start,end,distance){
		var s=module.findSlope(start,end);
		
		var pt=module.findPointOnSlope(s,start,distance);
		return pt;
	};
	
	
	module.moveOppositeLine=function(start,end,distance){
		var slope=module.findOppositeSlope(start,end);
		
		var endPoint=module.findPointOnSlope(slope,start,distance);
		return endPoint;
	};
	
	module.lineDistance=function(start,end){
		if(start!=null && end!=null){
			return Math.abs(Math.sqrt(Math.pow((end.x-start.x), 2)+
				Math.pow((end.y-start.y), 2)));
		}else{
			return 0;
		}
	};
	
	module.HexToR=function(h)  {return parseInt((module.cutHex(h)).substring(0,2),16);};
	module.HexToG=function(h)  {return parseInt((module.cutHex(h)).substring(2,4),16);};
	module.HexToB=function(h)  {return parseInt((module.cutHex(h)).substring(4,6),16);};
	module.cutHex=function(h)  {return (h.charAt(0)=="#") ? h.substring(1,7):h;};
	
	module.drawArrow=function(start, end,active,showTip,graphics){
		
		arrowWidth=18;
		arrowNarrowWidth=arrowWidth*.75;
		arrowWideWidth=arrowWidth*1.75;
		arrowLineWidth=2;
		arrowTipLength=30;
		
		
		
		
		if(!showTip){
			arrowWidth=arrowWidth-3;
			arrowNarrowWidth=arrowWidth;
			arrowWideWidth=arrowWidth;
			arrowTipLength=1;
		}
		
		
		var distance=module.lineDistance(start,end);
		var arrowStartLength=distance-arrowTipLength;
		if(start!=null && end!=null){
			if (start.x>end.x) {
				arrowStartLength=arrowStartLength*-1;
			}
		}else{
			return;
		}
		
		
		
		
		var arrowStart= module.moveOnLine(start,end,arrowStartLength);
		
		var bottom1= module.moveOppositeLine(start,end,-1*arrowWidth/2);
		var bottom2= module.moveOppositeLine(start,end,arrowWidth/2 );
	
		var topInside1= module.moveOppositeLine(arrowStart,end,-1*arrowNarrowWidth/2);
		var topInside2= module.moveOppositeLine(arrowStart,end,arrowNarrowWidth/2 );
	
		var topOutside1= module.moveOppositeLine(arrowStart,end,-1*arrowWideWidth/2);
		var topOutside2= module.moveOppositeLine(arrowStart,end, arrowWideWidth/2 );
		
	
		if(active==true){
			graphics.fillStyle="#5c8727";
			graphics.strokeStyle="#93a9b6";
		}else{
			graphics.fillStyle="5c8727";
			graphics.strokeStyle="#d9d9d9";
		}
		
		
		
		graphics.beginPath();
		
		graphics.moveTo(start.x,start.y);
		graphics.lineTo(bottom1.x,bottom1.y);
		graphics.lineTo(topInside1.x,topInside1.y);
		graphics.lineTo(topOutside1.x,topOutside1.y);
		graphics.lineTo(end.x,end.y);
		graphics.lineTo(topOutside2.x,topOutside2.y);
		graphics.lineTo(topInside2.x,topInside2.y);
		graphics.lineTo(bottom2.x,bottom2.y);
		graphics.lineTo(start.x,start.y);
		graphics.closePath();
		
		
		graphics.lineWidth=arrowLineWidth;
		graphics.fill();
		graphics.stroke();
		
		
	};
	
	
	return module;
	
});
