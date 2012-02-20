define(['data'],function(data){
	var module={};
	var animatedObjects=[];
	
	module.containsAnimations=function(){
		return animatedObjects.length>0;
	};

	module.animateTo=function(object,properties,duration){
		var anOb=module.getAnimation(object);
		if(!anOb){
			anOb={};
			
			animatedObjects.push(anOb);
		}
		if(anOb.tween){
			anOb.tween.stop(false);
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
					_.each(_.keys(currValues),function(t){
						anOb.object[t]=currValues[t];
					});
					module.drawPad.invalidate();
					//$.log(anOb.object.name+':'+currValues.x+',toX:'+properties.x);
				},
				callback:function(){
					var currValues=anOb.tween.get();
					//$.log('done:'+anOb.object.name+':'+currValues.x+',toX:'+properties.x);
					_.each(_.keys(currValues),function(t){
						anOb.object[t]=currValues[t];
					});
					module.drawPad.invalidate();
				}
			}
		);
		
	};
	
	module.getAnimation=function(object){
		var anOb=null;
		for(var i=0;i<animatedObjects.length;i++){
			if(animatedObjects[i].object==object){
				return animatedObjects[i];
			}
		}
		return null;
	};

	return module;
});