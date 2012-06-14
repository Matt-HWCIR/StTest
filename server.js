//var cfg = require('./config');
var HOST = null; //"0.0.0.0";
var PORT = process.env.PORT || 3000;

var express = require('express');
var amz = require('./as3');
var utils = require('./utils');

// Create Server
var app = express.createServer();

// Configure
app.configure(function(){
    app.use(express.methodOverride());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.static(__dirname + '/public'));
});



app.get('/',function(req,res){
   res.redirect('/index.htm');
});

app.post('/saveFile',function(req,res){
    var pn=req.body.participantNumber;
    var surveyId=req.body.surveyId;
    var xmlFile=pn+'/'+surveyId+"/Results.xml";
    var pngFile=pn+'/'+surveyId+"/FinalDiagram.png";
    amz.putFile(xmlFile,req.body.xml);
    amz.putFile(pngFile,amz.convertToImage(req.body.diagram),function (err){
        res.send({error:err});
    });
});


app.post('/saveTextResults',function(req,res){
	var pn=req.body.participantNumber;
	var surveyId=req.body.surveyId;
	var xmlFile=pn+'/'+surveyId+"/Results.xml";
	amz.putFile(xmlFile,req.body.xml,function (err){
		res.send({error:err});
	});
});

app.post('/saveScreen',function(req,res){
	var pn=req.body.participantNumber;
	var surveyId=req.body.surveyId;
	var screenName = req.body.screenName;
	var pngFile=pn+'/'+surveyId+"/"+screenName+".png";
	amz.putFile(pngFile,amz.convertToImage(req.body.diagram),function (err){
		res.send({error:err});
	});
});


// Start Server
console.log('PORT: '+PORT);
console.log('HOST: '+HOST);
app.listen(PORT,HOST, function() {
    console.log("Listening on " + PORT);
});