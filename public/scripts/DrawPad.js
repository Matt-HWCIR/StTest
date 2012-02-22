define(['data','DrawUtils','LineShape','SymptomShape','GroupShape','SelectorTool','LineTool','GroupTool','SymptomTray','SelectedTray','libs/animate','libs/data2xml'],
			function(data,DrawUtils,LineShape,SymptomShape,GroupShape,SelectorTool,LineTool,GroupTool,SymptomTray,SelectedTray,animate,data2xml){
	
	var module={};
	var container=null;
	var WIDTH=0;
	var HEIGHT=0;
	var canvas=null;
	var ghostCanvas=null;
	var ctx=null;
	var gctx=null;
	var isValid=false;
	var FPS=30;
	var INTERVAL=1000/FPS;
	var TOOL=SelectorTool;
	var SYMPTOM_TRAY_HEIGHT=110;
	var SYMTPOM_TRAY_Y_BUFFER=10;
	var SYMPTOM_BUFFER=30;
	var SYMPTOM_WIDTH=120;
	var SYMPTOM_HEIGHT=90;
	var symptomPage=0;
	var maxPages=0;
	var BODY_WIDTH;
	var currentPage='Intro';
	var chime=null;

	animate.drawPad=module;
	module.showTray=true;
	var participantNumber=null;
	module.canDrag=false;
	module.canChangeDirection=false;
	module.canEnterSymptomDetails=false;
	module.canDrawNewLine=false;
	module.canChangePriority=false;
	module.canChangeDirection=false;


	module.initChime=function(){
		// Do Something with Chime


	};

	module.playChime=function(){
		if(chime==null){
            try{
                chime=new Audio("sounds/Ping.wav");
                chime.load();
                chime.play();
            }catch(loadChimeError){
                console.log('**** Load Chime Error *****')
                console.log(loadChimeError);
            }

		}else{
			try{
                if(chime.currentTime>0){
                    chime.pause();
                    chime.currentTime=0;
                }else{
                    chime.load();
                }
				chime.play();
			}catch(x){
				console.log('**** error playing chime ****');
				console.log(x);
			}
		}
	};
	window.playChime=module.playChime;
	module.showSymptomsBar=function(shouldShow){
		SYMPTOMS_BAR=shouldShow;
		module.invalidate();
	};
	
	module.setTool=function(toolName){
		data.groupMode=false;
		switch(toolName){
			case 'Selector':
				TOOL=SelectorTool;
				break;
			case 'Line':
				TOOL=LineTool;
				break;
			case 'Group':
				data.groupMode=true;
				TOOL=GroupTool;
				break;
		}
		TOOL.drawPad=module;
		module.invalidate();
	};
	
	module.addGroup=function(){
		GroupTool.newMode=true;
	};
	
	module.ensureGroupIsInBounds=function(x,y,group){
		var bounds={};
		bounds.w=group.w;
		bounds.h=group.h;
		bounds.x=x;
		bounds.y=y;
		if(bounds.w<25){
			bounds.w=25;
		}
		if(bounds.h<25){
			bounds.h=25;
		}
		if(bounds.x<0){
			bounds.x=0;
		}
		if(bounds.y<0){
			bounds.y=0;
		}
		if(bounds.y>HEIGHT-50){
			bounds.y=HEIGHT-50;
		}
		return bounds;
		
	};

	module.hideKeyboard=function(){
		$('input').blur();
	};
	
	module.init=function(el){
		module.setTool('Line');
		container=el;
		WIDTH=$(container).width();
		HEIGHT=$(container).height();
		var options={
				width:WIDTH,
				height:HEIGHT,
				style:'position:absolute; left:0px;top:0px;'
			};
		canvas=$('<canvas></canvas>',options)[0];
		ctx=canvas.getContext("2d");
		
		ghostCanvas=$('<canvas></canvas>',options)[0];
		gctx=ghostCanvas.getContext("2d");
		
		$(container).append(canvas);
		
		// Add Listeners
		
		
		$(canvas).bind($.app.START_EV,function(event){
			var currTool=TOOL;
			var pos=DrawUtils.getMouse(canvas,event);
			if(pos.x>=0){
				module.POSITION=pos;

				if(currTool.tap)
					currTool.tap(event);
			}
		});
		
		$(canvas).bind($.app.END_EV,function(event){
			var currTool=TOOL;
			if(currTool.touchEnd)
				currTool.touchEnd(event);
		});
		
		$(canvas).bind($.app.MOVE_EV,function(event){
			var pos=DrawUtils.getMouse(canvas,event);
			if(pos.x>=0){
				module.POSITION=pos;	
			}
			
		});
		var _touchable=$(canvas).Touchable();
		
		
		 
		
		_touchable.bind('doubleTap',function(event){
			if(TOOL.doubleTap)
				TOOL.doubleTap(event);
			
		});
		
		
		_touchable.bind('tap',function(event){
			//if(TOOL.tap)
				//TOOL.tap(event);
			
		});
		
		_touchable.bind('touchablemove',function(event){
			if(TOOL.move)
				TOOL.move(event);
		});
		
		_touchable.bind('longTap',function(event){
			if(TOOL.longTap)
				TOOL.longTap(event);
		});

		$('#btnMoveShapes').live($.app.END_EV,function(event){
			var currText = $('#btnMoveShapes').text();
			if(currText == 'Mode: Draw Lines'){
				$('#btnMoveShapes').text('Mode: Drag Symptoms');
				module.setTool('Selector');
				module.canDrag=true;

			}else{
				$('#btnMoveShapes').text('Mode: Draw Lines');
				module.setTool('Line');
				module.canDrag=false;
			}
		});
		
		$('#introButton').bind($.app.END_EV,function(event){
			module.goToPage('Select');
		});
		$('#gotoIntro').bind($.app.END_EV,function(event){
			module.goToPage('Intro');
		});
		$('#continueButton').bind($.app.END_EV,function(event){
			module.nextPage();
		});
		$('#isAccurate').live($.app.END_EV,function(event){
			data.diagramIsAccurate=true;
			module.nextPage();
		});
		$('#notAccurate').live($.app.END_EV,function(event){
			module.showMakeChangesDialog();
		});
		$('#backButton').bind($.app.END_EV,function(event){
			module.prevPage();
		});
		$('#newGroupButton').live($.app.END_EV,function(event){
			module.createGroup();
		});
		$('#saveDialog').bind($.app.END_EV,function(event){
			if($('#symptomForm').is(':visible')){
				module.hideKeyboard();
				module.saveSymptom();
			}else if($('#lineForm').is(':visible')){
				module.hideKeyboard();
				module.saveLineDetails();
			}else if($('#groupForm').is(':visible')){
				module.hideKeyboard();
				module.saveGroup();
			}else if($('#makeChangesForm').is(':visible')){
				module.cancelDialog();
			}else{
				module.saveResults();
				module.cancelDialog();
				module.goToPage('Intro');
			}
			
		});
		$('#cancelDialog').bind($.app.END_EV,function(event){
			if($('#makeChangesForm').is(':visible')){
				data.diagramIsAccurate=false;
				module.saveResults();
				module.cancelDialog();
				module.goToPage('Intro');
			}else{
				module.cancelDialog();
			}

		});
		
		
		$('#participantNumber').keyup(function(event){
			participantNumber=$('#participantNumber').attr('value');
			if(participantNumber && participantNumber.length==3){
				$('#introButton').fadeIn();
			}else{
				$('#introButton').hide();
			}
			$('#sideBarId').html('Participant #'+participantNumber);
		});
		
	
		
		
		module.resize();
		setInterval(draw,INTERVAL);
		
		// Go To First Page
		module.goToPage('Intro');
		
//		REMOVE
//		module.goToPage('Groups')
//		var numTestItems =0;
//		_.each(data.db, function(item){
//			if(numTestItems<4){
//				item.selected=true;
//				item.detailsEntered=true;
//				numTestItems++;
//			}
//
//		});
//		module.invalidate();
//		END REMOVE
		
		
	};
	module.createGroup=function(){
		var colors=['#005695','#174496','#393817','#760a59','#713d92','#4c5025'].reverse();
		var maxOb=_.max(data.groups,function(t){return t.id});
		var maxId=0;
		if(maxOb){
			maxId=maxOb.id;
		}

		var colorIndex=maxId;
		if(!colorIndex || colorIndex>colors.length-1){
			colorIndex=0;
		}
		
		var groupId=maxId+1;
		maxzindex=1;
		var maxOb=_.max(data.groups,function(t){return t.zindex})
		if(maxOb){
			maxzindex=maxOb.zindex;
		}
		var offset = data.groups.length;
		var newgroup={id:groupId,type:'group',zindex:maxzindex,x:(100+offset*25),y:(100+offset*30),w:150,h:150,detailsEntered:false,color:colors[colorIndex]};
		data.groups.push(newgroup);
		data.activeGroup=newgroup;
		module.invalidate();
	};
	module.nextPage=function(){
		if(currentPage=='Select'){
			module.goToPage('SymptomDetail');
		}else if(currentPage=='SymptomDetail'){
			selecteditems = _.filter(data.db,function(item){return item.selected===true});
			if(selecteditems.length>1){
				module.goToPage('Connections');
			}else{
				module.goToPage('Review');
			}
		}else if(currentPage=='Connections'){
			if(data.lines.length>0){
				module.showLineDialog();
			}else{
				module.goToPage('Groups');
			}
		}else if(currentPage=='Cause'){
			module.goToPage('Groups');
		}else if(currentPage=='Groups'){
			var needsPriority=false;
			_.each(data.groups,function(item){
				var selecteditems = _.filter(data.db,function(t){return t.selected===true && t.groupId==item.id});
				if(selecteditems.length>1){
					needsPriority=true;
				}
			});
			if(needsPriority){
				module.goToPage('Priority');
			}else{
				module.goToPage('Review');
			}
		}else if(currentPage=='Priority'){
			module.goToPage('Review');
		}else if(currentPage=='Review'){
			module.showThankYouDialog();
		}
	};
	module.prevPage=function(){
		if(currentPage=='Select'){
			module.goToPage('Intro');
		}else if(currentPage=='SymptomDetail'){
			module.goToPage('Select');
		}else if(currentPage=='Connections'){
			module.goToPage('SymptomDetail');
		}else if(currentPage=='Cause'){
			module.goToPage('Connections');
		}else if(currentPage=='Groups'){
			if(data.lines.length==0){
				module.goToPage('Connections');
			}else{
				module.goToPage('Cause');
			}
		}else if(currentPage=='Priority'){
			module.goToPage('Groups');
		}else if(currentPage=='Priority'){
			module.goToPage('Groups');
		}else if(currentPage=='Review'){
			var selecteditems = _.filter(data.db,function(item){return item.selected===true});
			if(selecteditems.length>1){
				var needsPriority=false;
				_.filter(data.groups,function(item){
					var numItems = _.filter(data.db,function(t){return t.selected===true && t.groupId==item.id}).length;
					if(numItems>1){
						needsPriority=true;
					}
				});
				if(needsPriority){
					module.goToPage('Priority');
				}else{
					module.goToPage('Groups');
				}
			}else{
				module.goToPage('SymptomDetail');
			}
			
		}
	};
	
	module.saveResults=function(){
		var results={};
		results.participantNumber=participantNumber;
		results.diagramIsAccurate=data.diagramIsAccurate;
		results.symptom=[];
		results.group=[];
		results.line=[];
		results.symptomRelationships=
		{
			all:data.lineDetails.all,
			notAll:data.lineDetails.notAll,
			usually:data.lineDetails.usually,
			order:data.lineDetails.order,
			different:data.lineDetails.different,
			connected:data.lineDetails.connected

		};

		_.each(data.db,function(item){
			if(item.selected){
				results.symptom.push({
					name:item.name,
					cause:item.cause,
					better:item.better,
					worse:item.worse,
					drBetter:item.drBetter,
					drWorse:item.drWorse,
					effect:item.effect,
					topPriority:item.topPriority,
					groupName:item.groupName
				});
			}
		});
		_.each(data.groups,function(item){
			results.group.push({
				name:item.name,
				cause:item.cause,
				effect:item.effect
			});
		});
		_.each(data.lines,function(item){
			results.line.push({
				fromSymptom:item.start,
				toSymptom:item.end
			});
		});
		
		var xml=data2xml('results',results);

		var diagram=canvas.toDataURL('image/png');
		var dataToSend={
            xml:xml,
            participantNumber:participantNumber,
            diagram:diagram,
			surveyId:data.surveyId
        };
        var dataToSendStr=JSON.stringify(dataToSend);

        var settings={
            processData:false,
            url: 'saveFile',
            success: function(data){
                console.log('success');
            },
            error: function(err,textStatus,errorThrown){
                console.log('error saving data');
                console.log('error textStatus: '+textStatus);
                console.log('error errorThrown: '+errorThrown);
            },
            dataType:'json',
            contentType:'application/json',
            type:'POST',
            data:dataToSendStr
        };
        $.ajax(settings);
	};

	module.saveScreen=function(){
		var screenName=currentPage;
		if(screenName!='Intro' && screenName!=null && screenName!='Review'){

			if(data.reachedReview == true){
				screenName=screenName+'Revised';
			}


			var diagram=canvas.toDataURL('image/png');
			var dataToSend={
				screenName:screenName,
				participantNumber:participantNumber,
				surveyId:data.surveyId,
				diagram:diagram
			};
			var dataToSendStr=JSON.stringify(dataToSend);
			var settings={
				processData:false,
				url: 'saveScreen',
				success: function(data){
					console.log('success');
				},
				error: function(err,textStatus,errorThrown){
					console.log('error saving data');
					console.log('error textStatus: '+textStatus);
					console.log('error errorThrown: '+errorThrown);
				},
				dataType:'json',
				contentType:'application/json',
				type:'POST',
				data:dataToSendStr
			};
			$.ajax(settings);
		}
	};


	module.printDate=function() {
		var temp = new Date();
		var dateStr =
			module.padStr(temp.getFullYear()) +
			module.padStr(1 + temp.getMonth()) +
			module.padStr(temp.getDate()) +
			module.padStr(temp.getHours()) +
			module.padStr(temp.getMinutes()) +
			module.padStr(temp.getSeconds());
		return dateStr;
	}

	module.padStr=function(i) {
		return (i < 10) ? "0" + i : "" + i;
	};
	
	module.resetData=function(){

		ordereditems  = _.sortBy(data.db,function(t){return t.name});

		index=0;
		_.each(data.db,function(item){
			item.selected=false;
			item.dragging=false;
			item.topPriority=false;
			item.detailsEntered=false;
			item.cause='';
			item.better='';
			item.drBetter='';
			item.drWorse='';
			item.effect='';
			item.zindex=0;
			item.index = index;
			index++;
		});
		data.activeShape=null;
		data.activeGroup=null;
		data.activeLine=null;
		data.groups=[];
		data.lines=[];
		data.lineDetails={};
		data.reachedReview=false;
		data.diagramIsAccurate=false;
		data.surveyId=module.printDate();
		
		module.reposition(true);
		
		module.invalidate();
	};
	
	module.goToPage=function(pageName){
		module.canDrag=false;
		module.canEnterSymptomDetails=false;
		module.canChangeDirection=false;
		module.canDrawNewLine=false;
		module.canChangePriority=false;
		module.showTray=false;
		module.canChangeDirection=false;


		module.saveScreen();

		if(pageName=='Intro'){
			$('#participantNumber').attr('value','');
			$('#sideBarId').html('');
			partipantNumber=null;
			$('#introButton').hide();
			
			$('.intro').fadeIn();
			$('#pages').fadeOut();
			$('#sideBarTitle').text('');
			$('#sideBarText').html('');
			currentPage='Intro';
		}else{
			if(currentPage=='Intro'){
				module.resetData();
				currentPage=pageName;
				$('.intro').fadeOut();
				$('#pages').fadeIn(function(event){
					if(WIDTH==0){
						module.resize();
					}
					module.goToPage(pageName);
				});
			}else{

				if(pageName=='Select'){
					$('#sideBarTitle').text('Select Symptoms');
					$('#sideBarText').html('Drag the symptoms you have experienced in the past 24 hours into the main portion of the screen');
					module.setTool('Selector');
					module.showTray=true;
					currentPage=pageName;
					
					$('#continueButton').text('Continue');
					module.canDrag=true;
				}else if(pageName=='SymptomDetail'){
					$('#sideBarTitle').text('Symptom Details');
					$('#sideBarText').html('"Tap" on each Symptom to answer questions about each symptom');
					module.setTool('Selector');
					currentPage=pageName;
					module.canEnterSymptomDetails=true;
					$('#continueButton').text('Continue');
					
				}else if(pageName=='Connections'){
					$('#sideBarTitle').text('Related Symptoms?');
					$('#sideBarText').html('Draw lines between symptoms that you think are related to each other.<br/><br/>"Double tap" on a line to delete.<br/><br/>To rearrange the symptom squares, toggle between "drawing lines" and "dragging symptoms" by tapping on the button below.<br/><br/><button id="btnMoveShapes" style="margin-top:5px" class="btn info">Mode: Draw Lines</button>');
					module.setTool('Line');
					currentPage=pageName;
					module.canDrawNewLine=true;
					$('#continueButton').text('Continue');
					
				}else if(pageName=='Cause'){
					$('#sideBarTitle').text('Cause?');
					$('#sideBarText').html('Do you think that some of the symptoms cause other symptoms?  <br/><br/>If you think some of the symptoms cause other symptoms "Tap" on a line to indicate which symptom causes the other.<br/><br/>To change the direction of the arrow, tap on the line again.<br/><br/>To show a two-way arrow, tap on the line a third time.');
					module.setTool('Selector');
					currentPage=pageName;
					module.canChangeDirection=true;
					module.canDrawNewLine=false;
					module.canDrag=true;
					$('#continueButton').text('Continue');
					
				}else if(pageName=='Groups'){
					$('#sideBarTitle').text('Groups?');
					$('#sideBarText').html('Draw a rectangle around symptoms that occur together as a group. <button id="newGroupButton" style="margin-top:5px" class="btn info">Add New Group</button><br/><br/><p style="font-size:.85em">Drag on the sides of each rectangle as needed to change its size.  <br/><br/>Move the symptom squares as needed to fit them in the rectangles.<br/><br/>After you have drawn rectangles around the symptom groups "Double Tap" on each rectangle to answer questions about that group.<br/><br/>"Press and Hold" to delete a group.</p>');
					module.setTool('Selector');
					currentPage=pageName;
					module.canDrag=true;
					$('#continueButton').text('Continue');
				}else if(pageName=='Priority'){
					$('#sideBarTitle').text('Priority');
					$('#sideBarText').html('"Tap" on the symptom in each group that you think is most important in that group');
					module.canChangePriority=true;
					currentPage=pageName;
				}else if(pageName=='Review'){
					$('#sideBarTitle').text('Review');
					$('#sideBarText').html('Is this an accurate drawing of the symptoms you have experienced?<br/><br/><button id="isAccurate" style="margin-top:5px;width:75px" class="btn success">Yes</button><button id="notAccurate" style="margin-top:5px;margin-left:5px;width:75px" class="btn danger">No</button>');
					module.setTool('Selector');
					currentPage=pageName;
					$('#continueButton').text('Submit');
					data.reachedReview=true;
				}
			}
		}
		module.invalidate();
	};
	
	
	module.updateGroups=function(){
		selecteditems = _.filter(data.db,function(item){return item.selected===true});
		selecteditems = _.sortBy(selecteditems,function(item){return item.zindex}).reverse();
		_.each(selecteditems,function(item){
			var bounds={x:item.x+item.w/2,y:item.y+item.h/2,w:1,h:1};
			var group=module.hitTest(bounds,data.groups);
			var groupId=null;
			var groupColor=null;
			var groupName=null;
			if(group){
				groupColor=group.color;
				groupId=group.id;
				groupName=group.name;
			}
			item.groupId=groupId;
			item.groupColor=groupColor;
			item.groupName=groupName;
		});
	};
	
	function draw(){
		if(!isValid){
			// Clear
			DrawUtils.clear(ctx,WIDTH,HEIGHT);
			
			// Update any Positions
			//animate.animate();
			
			// Set Tray Bounds
			if(module.showTray){
				SelectedTray.HEIGHT=HEIGHT-SYMPTOM_TRAY_HEIGHT;
			}else{
				SelectedTray.HEIGHT=HEIGHT;
			}
		
			// Draw Selected Tray
			SelectedTray.draw(ctx);	
			
			// Draw Groups
			orderedgroups = _.sortBy(data.groups,function(t){return t.zindex});
			_.each(orderedgroups,function(item){
				GroupShape.draw(item,ctx);
			});
		
			// Draw Symptom Tray
			if(module.showTray){
				SymptomTray.draw(symptomPage>0,symptomPage<maxPages-1,ctx);
			}
			
			// Draw Active Line
			if(TOOL==LineTool){
				LineTool.draw(ctx);
			}
			
			// Draw Lines
			_.each(data.lines,function(item){
				LineShape.draw(item,ctx,gctx);
			});
			
			// Draw Selected Symptoms
			selecteditems=_.sortBy(data.db,function(item){ return item.zindex});
			_.each(selecteditems,function(item){
				if(item.selected){
					SymptomShape.draw(item,ctx,{x:SelectedTray.X,y:SelectedTray.y,w:SelectedTray.WIDTH,h:SelectedTray.h});	
				}else if(module.showTray){
					SymptomShape.draw(item,ctx,{x:SymptomTray.X,y:SymptomTray.y,w:SymptomTray.WIDTH,h:SymptomTray.h});	
				}
					
			});		
			
			// Update Buttons
			module.updateButtons();
			
			// see if we are animating
			if(!animate.containsAnimations()){
				isValid=true;	
			}
		}
	}
	
	module.updateButtons=function(){
		selecteditems = _.filter(data.db,function(item){return item.selected===true});
		detailsEnteredItems=_.filter(data.db,function(item){return item.selected===true && item.detailsEntered==true});
		if(currentPage=="Select"){
			if(selecteditems.length>0){
				$('#continueButton').show();
			}else{
				$('#continueButton').hide();
			}
			$('#backButton').text('Start Over');
			$('#backButton').show();
		}else if(currentPage=="SymptomDetail"){
			if(selecteditems.length==detailsEnteredItems.length){
				$('#continueButton').show();
			}else{
				$('#continueButton').hide();
			}
			$('#backButton').text('Back');
			$('#backButton').show();
		}else if(currentPage=="Connections"){
			$('#continueButton').show();
			$('#backButton').text('Back');
			$('#backButton').show();
		}else if(currentPage=="Cause"){
			$('#continueButton').show();
			$('#backButton').text('Back');
			$('#backButton').show();
		}else if(currentPage=="Groups"){
			detailsEnteredGroups= _.filter(data.groups,function(t){return t.detailsEntered});
			if(data.groups.length==detailsEnteredGroups.length){
				$('#continueButton').show();
			}else{
				$('#continueButton').hide();
			}
			$('#backButton').text('Back');
			$('#backButton').show();
		}else if(currentPage=="Priority"){
			var priorityEntered = true;

			_.each(data.groups,function(item){
				var selectedItems=_.filter(data.db,function(t){return t.selected===true && t.groupId===item.id});
				var hasPriority=_.filter(selectedItems,function(t){return t.topPriority==true}).length>0;
				if(!hasPriority && selectedItems.length>1){
					priorityEntered=false;
				}
			});
			if(priorityEntered){
				$('#continueButton').show();
			}else{
				$('#continueButton').hide();
			}
			$('#backButton').text('Back');
			$('#backButton').show();
		}else if(currentPage=="Review"){
			$('#continueButton').hide();
			$('#backButton').text('Back');
			$('#backButton').show();
		}
	
	};
	
	module.goBack=function(){
		symptomPage--;
		module.reposition(false,true);
		module.invalidate();
	};
	module.goNext=function(){
		symptomPage++;
		module.reposition(false,true);
		module.invalidate();
	};
	
	module.invalidate=function(){
		isValid=false;
	};
	module.resize=function(){
		BODY_WIDTH=$('body').width();
		WIDTH=$(container).width();
		HEIGHT=$(container).height();
		$(canvas).add(ghostCanvas)
			.attr('width',WIDTH)
			.attr('height',HEIGHT);
		
		// Symptom Tray
		SymptomTray.WIDTH=WIDTH;
		SymptomTray.HEIGHT=SYMPTOM_TRAY_HEIGHT;
		SymptomTray.X=0;
		SymptomTray.Y=HEIGHT-SYMPTOM_TRAY_HEIGHT;
		
		// SelectedTray
		SelectedTray.WIDTH=WIDTH;
		SelectedTray.HEIGHT=HEIGHT-SYMPTOM_TRAY_HEIGHT;
		SelectedTray.X=0;
		SelectedTray.Y=0;
		
		
		
		module.reposition(true);
		
		
		module.invalidate();
	};
	
	
	
	module.reposition=function(repositionSelectedItems,shouldAnimate){
		// Position Unselected Symptoms
		
		var unselectedCount=_.filter(data.db,function(item){return item.selected==false}).length;
		var y=HEIGHT-SYMPTOM_TRAY_HEIGHT+SYMTPOM_TRAY_Y_BUFFER;
		var h=SYMPTOM_TRAY_HEIGHT-SYMTPOM_TRAY_Y_BUFFER*2;
		var w=SYMPTOM_WIDTH;
		var trayContentWidth=WIDTH-80;
		var numTilesInPage=Math.floor(trayContentWidth/(w+SYMPTOM_BUFFER));
		var traySideMargins=WIDTH-(numTilesInPage*w)-(numTilesInPage-1)*SYMPTOM_BUFFER;
		var x=traySideMargins/2;
		
		maxPages=Math.ceil(unselectedCount/numTilesInPage);
		if(symptomPage>maxPages-1){
			symptomPage=maxPages-1;
		}
		if(symptomPage<0){
			symptomPage=0;
		}
		
		// find first item
		var firstItem=symptomPage*numTilesInPage+1;
		var firstVisible=(symptomPage-1)*numTilesInPage+1;
		var lastVisible=(symptomPage+1)*numTilesInPage+1;
		if(firstVisible<1){
			firstVisible=1;
		}
		
		var itemIndex=1;
		var animations=[];
		unselectedItems = _.filter(data.db,function(t){return t.selected==false});
		unselectedItems=_.sortBy(unselectedItems,function(t){return t.index});
		_.each(unselectedItems,function(item){
			var newX=x;
			var newY=y;
			if(itemIndex<firstItem){
				var leftOffset=firstItem-itemIndex;
				var leftX=-1*traySideMargins-(leftOffset*w)-(SYMPTOM_BUFFER*itemIndex);
				newX=leftX;
			}else if(itemIndex>=firstItem && itemIndex<numTilesInPage+firstItem){
				newX=x;
				x+=SYMPTOM_BUFFER+w;
			}else{
				var rightX=1*traySideMargins+((itemIndex-firstItem)*w)+(SYMPTOM_BUFFER*itemIndex);
				newX=rightX;
			}
			
			var isVisible=true;
			if(itemIndex<firstVisible || itemIndex>lastVisible){
				isVisible=false;
			}

			item.isVisible=isVisible;
			if(shouldAnimate!=true){
				item.x=newX;
				item.y=newY;
			}
			item.h=h;
			item.w=w;
			if(shouldAnimate==true){
				animations.push({item:item,props:{x:newX,y:newY},duration:300});
			}
			itemIndex++;
		});
		
		$.each(animations,function(index,an){
			animate.animateTo(an.item,an.props,an.duration);
		});

		
		
		// Determine Margins
		var numTiles=Math.floor(WIDTH/(SYMPTOM_WIDTH+SYMPTOM_BUFFER));
		var sideMargins=WIDTH-(numTiles*SYMPTOM_WIDTH)-(numTiles-1)*SYMPTOM_BUFFER;
		var startX=sideMargins/2;
		
		// Resize Selected Symptoms
		selecteditems=_.filter(data.db,function(t){return t.selected===true});
		_.each(selecteditems,function(item){
			w=SYMPTOM_WIDTH;
			h=SYMPTOM_HEIGHT;
			item.h=h;
			item.w=w;
		});
		
		// Position Selected Symptoms
		if(repositionSelectedItems){
			x=startX;
			y=SYMPTOM_BUFFER;
			w=SYMPTOM_WIDTH;
			h=SYMPTOM_HEIGHT;
			selecteditems=_.filter(data.db,function(t){return t.selected===true});
			selecteditems=_.sortBy(selecteditems,function(t){return t.index});
			_.each(selecteditems,function(item){
				item.x=x;
				item.y=y;
				item.h=h;
				item.w=w;
				x+=SYMPTOM_BUFFER+w;
				if(x+SYMPTOM_WIDTH>WIDTH){
					// move to next row
					x=startX;
					y=y+SYMPTOM_HEIGHT+SYMPTOM_BUFFER;
				}
			});	
		}
	};
	
	module.hitTest=function(hitBox,shapes){
		return DrawUtils.hitTest(gctx,hitBox,shapes,WIDTH,HEIGHT);
	};
	
	module.isInTray=function(x,y){
		var inTray=false;
		if(y>=SymptomTray.Y){
			inTray=true;
		}
		return inTray;
	};
	
	
	// Show Thank You
	module.showThankYouDialog=function(){
		
		module.saveResults();
		$('#dialogTitle').text('You Are Finished!');
		$('#lineForm').hide();
		$('#thankYouForm').show();
		$('#makeChangesForm').hide();
		$('#groupForm').hide();
		$('#symptomForm').hide();
		$('#cancelDialog').hide();
		$('#saveDialog').text('Continue');
		$('#dialog').modal({show:true,backdrop:'static'});
	};

	// Show Make Changes
	module.showMakeChangesDialog=function(){

		$('#dialogTitle').text('Make Changes?');
		$('#lineForm').hide();
		$('#thankYouForm').hide();
		$('#makeChangesForm').show();
		$('#groupForm').hide();
		$('#symptomForm').hide();
		$('#cancelDialog').show();
		$('#cancelDialog').text('No');
		$('#saveDialog').text('Yes');
		$('#dialog').modal({show:true,backdrop:'static'});
	};
	
	// Show Line Dialog
	module.showLineDialog=function(){
		$('#dialogTitle').text('Symptom Relationships?');
		$('#lineForm').show();
		$('#thankYouForm').hide();
		$('#makeChangesForm').hide();
		$('#groupForm').hide();
		$('#symptomForm').hide();
		$('#lineConnected').attr('value',data.lineDetails.connected?data.lineDetails.connected:'');
		$('#lineAll').attr('value',data.lineDetails.all?data.lineDetails.all:'');
		$('#lineNotAll').attr('value',data.lineDetails.notAll?data.lineDetails.notAll:'');
		$('#lineUsually').attr('value',data.lineDetails.usually?data.lineDetails.usually:'');
		$('#lineOrder').attr('value',data.lineDetails.order?data.lineDetails.order:'');
		$('#lineDifferent').attr('value',data.lineDetails.different?data.lineDetails.different:'');
		$('#cancelDialog').show();
		$('#cancelDialog').text('Cancel');
		$('#saveDialog').text('Save');
		$('#dialog').modal({show:true,backdrop:'static'});
		
	};
	
	// Cancel 
	module.cancelDialog=function(){
		module.hideKeyboard();
		$('#dialog').modal('hide');
	};
	
	// Show Symptom Dialog
	module.showSymptomDialog=function(){
		$('#dialogTitle').text(data.activeShape.name);
		$('#lineForm').hide();
		$('#symptomForm').show();
		$('#groupForm').hide();
		$('#thankYouForm').hide();
		$('#makeChangesForm').hide();
		$('#symptomCause').attr('value',data.activeShape.cause?data.activeShape.cause:'');
		$('#symptomBetter').attr('value',data.activeShape.better?data.activeShape.better:'');
		$('#symptomWorse').attr('value',data.activeShape.worse?data.activeShape.worse:'');
		$('#symptomDrBetter').attr('value',data.activeShape.drBetter?data.activeShape.drBetter:'');
		$('#symptomDrWorse').attr('value',data.activeShape.drWorse?data.activeShape.drWorse:'');
		$('#symptomEffect').attr('value',data.activeShape.effect?data.activeShape.effect:'');
		$('#cancelDialog').show();
		$('#cancelDialog').text('Cancel');
		$('#saveDialog').text('Save');
		$('#dialog').modal({show:true,backdrop:'static'});
		
		
	};
	
	// Show Group Dialog
	module.showGroupDialog=function(){
		$('#dialogTitle').text('Group Details');
		$('#lineForm').hide();
		$('#makeChangesForm').hide();
		$('#thankYouForm').hide();
		$('#groupForm').show();
		$('#symptomForm').hide();
		$('#groupCause').attr('value',data.activeGroup.cause?data.activeGroup.cause:'');
		$('#groupName').attr('value',data.activeGroup.name?data.activeGroup.name:'');
		$('#groupEffect').attr('value',data.activeGroup.effect?data.activeGroup.effect:'');
		$('#cancelDialog').show();
		$('#cancelDialog').text('Cancel');
		$('#saveDialog').text('Save');
		$('#dialog').modal({show:true,backdrop:'static'});
		
		
	};
	
	module.hasEmptyValue=function(values,keys){
		var containsEmptyValue=false;
		$.each(keys,function(index,key){
			if(values[key]!=null && values[key].length==0){
				containsEmptyValue=true;
			}
		});
		return containsEmptyValue;
	};
	

	// Save Group
	module.saveGroup=function(){
		data.activeGroup.cause=$('#groupCause').attr('value');
		data.activeGroup.name=$('#groupName').attr('value');
		data.activeGroup.effect=$('#groupEffect').attr('value');
		data.activeGroup.detailsEntered=true;

		$('#dialog').modal('hide');
		if(module.hasEmptyValue(data.activeGroup,['cause','name','effect'])){
			module.playChime();	
		}
		module.invalidate();
	};
	
	// Save Symptom
	module.saveSymptom=function(){
		data.activeShape.cause=$('#symptomCause').attr('value');
		data.activeShape.better=$('#symptomBetter').attr('value');
		data.activeShape.worse=$('#symptomWorse').attr('value');
		data.activeShape.drBetter=$('#symptomDrBetter').attr('value');
		data.activeShape.drWorse=$('#symptomDrWorse').attr('value');
		data.activeShape.effect=$('#symptomEffect').attr('value');
		data.activeShape.detailsEntered=true;
		$('#dialog').modal('hide');
		if(module.hasEmptyValue(data.activeShape,['cause','better','worse','drBetter','drWorse','effect'])){
			module.playChime();
		}
		module.invalidate();
	};
	
	// Save Symptom
	module.saveLineDetails=function(){
		data.lineDetails.connected=$('#lineConnected').attr('value');
		data.lineDetails.all=$('#lineAll').attr('value');
		data.lineDetails.notAll=$('#lineNotAll').attr('value');
		data.lineDetails.usually=$('#lineUsually').attr('value');
		data.lineDetails.order=$('#lineOrder').attr('value');
		data.lineDetails.different=$('#lineDifferent').attr('value');
		
		$('#dialog').modal('hide');
		module.invalidate();
		if(module.hasEmptyValue(data.lineDetails,['connected','all','notAll','usually','order','different'])){
			module.playChime();
		}
		module.goToPage('Cause');
	};
	
	
	return module;
});