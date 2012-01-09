var sunny=require('sunny');
var conn=sunny.Configuration.fromEnv().connection;
var containerName="LinderResearch";
var fs = require('fs');
var container = null;


function getContainer(){
    var request = conn.getContainer(containerName,{validate:true});
    request.on('error',function(err){
        console.log('Error getting bucket connection: '+err.message);
    });
    request.on('end',function(results,meta){
        container = results.container;
        console.log("Got container \"%s\".", container.name);
    });
    request.end();
}

exports.getFile=function(fileName,callback) {
    console.log('filename:' +fileName);
    var readStream = container.getBlob(fileName);
    var buf='';
    readStream.on('error', function(err){
        console.log('get file error '+err.message);
        callback(null,null);
    });
    readStream.on('data', function(chunk){
        buf+=chunk.toString('binary');
    });
    readStream.on('end', function(results,meta){
        callback(buf,meta,readStream);
    });
    readStream.end();
};

exports.convertToImage=function(rawData){
    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = rawData.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    return buf;
};

exports.putFile=function(fileName,data,callback) {

    //fs.writeFileSync(fileName,data);  // Save locally to test

    console.log('putting data: '+fileName);

    try{
        request = container.putBlob(fileName,{

        });
        request.on('error', function(err){
            console.log('error putting file: '+fileName);
            if(callback!=null){
                callback();
            }

        });
        request.on('end', function (results, meta) {
            blobObj = results.blob;
            console.log("Wrote data for: '%s'.", blobObj.name);
            if(callback!=null){
                callback(null);
            }

        });
        request.write(data);
        request.end();
    }catch(x){
        console.log('error putting file :');
        console.log(x);
        if(callback){
            callback();
        }
    }

}

// Init Container
console.log('getting container');
getContainer();