define(['data'],function(data){
	var module={};
	var animatedObjects=[];
	
	module.containsAnimations=function(){
		return animatedObjects.length>0;
	};
	
	module.animations=function(){
		return animatedObjects;
	};
	module.stop=function(object){
		var anOb=module.getAnimation(object);
		if(anOb && anOb.tween){
			anOb.tween.stop(true);
		};
	};
	module.animateTo=function(object,properties,duration){
		var anOb=module.getAnimation(object);
		if(!anOb){
			anOb={};
			
			animatedObjects.push(anOb);
		}
		if(anOb.tween){
			anOb.tween.stop(true);
		}else{
			anOb.tween=new Tweenable();
		}
		var startTime=new Date();
		anOb.object=object;
		anOb.start=startTime.getTime();
		anOb.duration=duration;
		anOb.isAnimating=true;
		anOb.properties=properties;
		anOb.startProperties={};
		for(prop in properties){
			anOb.startProperties[prop]=object[prop];
		}
		
		anOb.tween.tween(
			{
				from:anOb.startProperties,
				to:properties,
				duration:duration,
				easing:'easeInSine',
				step:function(){
					var currValues=anOb.tween.get();
					data.db(anOb.object).update(currValues);
					module.drawPad.invalidate();
					//$.log(anOb.object.name+':'+currValues.x+',toX:'+properties.x);
				},
				callback:function(){
					var currValues=anOb.tween.get();
					//$.log('done:'+anOb.object.name+':'+currValues.x+',toX:'+properties.x);
					data.db(anOb.object).update(currValues);
					module.drawPad.invalidate();
				}
			}
		);
		
	};
	
	module.getAnimation=function(object){
		var anOb=null;
		for(var i=0;i<animatedObjects.length;i++){
			var refOb=animatedObjects[i].object;
			if(refOb.___id==object.___id){
				anOb=refOb;
				break;
			}
		}
		return anOb;
	};
	
	module.animate=function(){
		var newArray=[];
		var newOb={};
		var startValue;
		var endValue;
		var delta=0;
		
		for(var i=0;i<animatedObjects.length;i++){
			var anOb=animatedObjects[i];
			var currTime=new Date();
			anOb.elapsed=currTime.getTime()-anOb.start;
			var ratio=anOb.elapsed/anOb.duration;
			if(ratio>=1){
				ratio=1;
			}else{
				// Keep for next loop
				newArray.push(anOb);
			}
			newOb={};
			for(prop in anOb.properties){
				endValue=anOb.properties[prop];
				startValue=anOb.startProperties[prop];
				
				if(startValue<endValue){
					delta=(endValue-startValue)*ratio;
					newOb[prop]=startValue+delta;
					if(newOb[prop]>endValue){
						newOb[prop]=endValue;
					}
				}else{
					delta=(startValue-endValue)*ratio;
					newOb[prop]=startValue-delta;
					if(newOb[prop]<endValue){
						newOb[prop]=endValue;
					}
				}
				
			}
			data.db(anOb.object).update(newOb,false);
		}
		animatedObjects=newArray;
	};
	return module;
});