define([],function(){
	var data={};
	
	// SYMPTOMS
	var symptomNames=['Difficulty concentrating',
	                  'Pain',
	                  'Lack of energy',
	                  'Cough',
	                  'Feeling nervous',
	                  'Dry mouth',
	                  'Nausea',
	                  'Feeling drowsy',
	                  'Tingling in hands/feet',
	                  'Difficulty sleeping',
	                  'Problems with urination',
	                  'Vomiting',
	                  'Shortness of breath',
	                  'Diarrhea',
	                  'Feeling sad',
	                  'Sweating',
	                  'Worrying',
	                  'Itching',
	                  'Lack of appetite',
	                  'Dizziness',
	                  'Difficulty swallowing',
	                  'Feeling irritable',
	                  'Changes in how food tastes',
	                  'Weight loss',
	                  'Hair loss',
	                  'Constipation',
	                  'Swelling in arms/legs',
	                  'Don\'t look like myself',
	                  'Skin changes'];
	
	var symptoms=[];
	symptomNames.sort();
	$(symptomNames).each(function(index,item){
		symptoms.push({
			name:item,
			types:'symptom',
			selected:false,
			dragging:false,
			x:0,
			y:0,
			w:0,
			h:0,
			dragX:0,
			dragY:0,
			index:index,
			zindex:0,
			connectOrigin:false,
			connectDestination:false
		});
	});
	
	data.db=symptoms;
	
	// States
	data.activeShape=null;
	
	// Line Definition
	data.lineStart={x:0,y:0};
	data.lineEnd={x:0,y:0};
	data.lineStartShape=null;
	data.lineEndShape=null;
	data.activeLine=null;
	
	// Connections
	data.lines=[];
	data.lineDetails={};
	
	// Groups
	data.groups=[];
	data.groupMode=false;
	data.activeGroup=null;
	
	
	return data;
});