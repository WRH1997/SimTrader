const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const protoPath = "./resources/computeandstorage.proto";
const fetch = require('node-fetch');
const AWS = require('aws-sdk');
const keys = require('./resources/keys.json');
const ip = require('ip');
const randomKeyGen = require('random-key');


//configure AWS keys from keys.json file for S3 access
const accessKey = keys['accessKey'];
const secretKey = keys['secretKey'];
const sessionToken = keys['sessionToken'];


/*CITATION NOTE:
The following code that configures the gRPC server's options
and binds the proto-definitions to the gRPC server was adapted from the following source:
URL: https://nordicapis.com/how-to-create-an-api-using-grpc-and-node-js/
*/
const options = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
};
const protoPackage = protoLoader.loadSync(protoPath, options);
const protoObj = grpc.loadPackageDefinition(protoPackage)
const server = new grpc.Server();


//CHANGE WHEN /START IP RELEASED
const entryPointServer = "" + "/start";
const testServer = "https://jsonplaceholder.typicode.com/todos"
const bannerNo = "B00919848";

let currS3Uri = "";
let currFileKey = "";


//method to generate a random, unqiue key for our S3 file that will be stored
/*CITATTION NOTE:
The following method was adapted from the random-key module's npm doc:
URL: https://www.npmjs.com/package/random-key
*/
const keyGen = () => {
    currFileKey = randomKeyGen.generate();
    return currFileKey;
}


//method that sends banner and ip to professor's server's '/start' endpoint
function startChain(currIp){
    /*CITATION NOTE:
    The following code used to post a json containing my banner no and ip
    using fetch to the professor's /start endpoint was adapted from the following source:
    URL: https://blog.openreplay.com/a-guide-to-http-post-requests-in-javascript/
    */
    fetch(testServer, {
        method: "POST",
        headers: {"Content-type": "application/json"},
        body: JSON.stringify({"banner": bannerNo, "ip": currIp})
    })
    .then((response) => response.json())
    .then((output) => console.log(output));
}


//method that accepts {"data": "..."} and stores data's value into an
//S3 bucket named 'csci5409-a2-wrh1997'
async function storeData(call, callback){
    try{
        let userData = call.request.data;
        if(userData==null || userData.trim()==""){
            /*CITATION NOTE:
            The following code used to return an HTTP error status
            and message as the response was adapted from the following source:
            URL: https://github.com/avinassh/grpc-errors/blob/master/node/server.js
            */
            return callback({
                code: grpc.status.INTERNAL,
                message: "Incorrect Request Syntax!\nRequest to StoreData should be formatted as a "
                    + "JSON containing \'data\' key-value pair!"
            }); 
        }
        let uploadOptions = {
            Bucket: 'csci5409-a2-wrh1997',
            Body: userData,
            Key: keyGen()
        };
        let s3Client = new AWS.S3({
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                sessionToken: sessionToken
            }
        });
        let ret = await s3Client.upload(uploadOptions, function(err, data){
            //IMPLEMENT S3 ERROR HANDLING HERE?!
            if(err){
                throw "Error Uploading File to S3 Bucket: " + err;
            }
            if(data){
                console.log(data.Location);
            }
        }).promise();
        let retJson = {s3uri: ret.Location};
        currS3Uri = ret.Location;
        callback(null, retJson);
    }
    catch(error){
        return callback({
            code: grpc.status.INTERNAL,
            message: error
        });   
    }
}



//method that accepts {"data": "..."} and appends the data's value to
//the file stored using the StoreData call [NOTE: This means that the
//AppendData call must preceed the StoreData call since the URI of the
//stored file is stored in a variable when StoreData is called]
async function appendData(call, callback){
    try{
        //ERROR HANDLING WHEN APPEND CALLED BEFORE STOREDATA:
        //if AppendData is called before StoreData, an error response is returned
        if(currFileKey=="" || currS3Uri==""){
            return callback({
                code: grpc.status.INTERNAL,
                message: "NO URI OR KEY SET"
            }); 
        }
        let userData = call.request.data;
        if(userData==null || userData.trim()==""){
            return callback({
                code: grpc.status.INTERNAL,
                message: "Incorrect Request Syntax!\nRequest to AppendData should be formatted as a "
                    + "JSON containing \'data\' key-value pair!"
            }); 
        }
        let s3Client = new AWS.S3({
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                sessionToken: sessionToken
            }
        });
        let downloadOptions = {
            Bucket: 'csci5409-a2-wrh1997',
            Key: currFileKey
        };
        let existingContent = await s3Client.getObject(downloadOptions, function(err, data){
            if(err){
                throw err;
            }
            if(data){
                console.log(data.Body.toString());
            }
        }).promise();
        let existingContentStr = existingContent.Body.toString();
        let updatedContent = existingContentStr + userData;
        console.log(updatedContent);
        let uploadOptions = {
            Bucket: 'csci5409-a2-wrh1997',
            Body: updatedContent,
            Key: currFileKey
        }
        let ret = await s3Client.upload(uploadOptions, function(err, data){
            //IMPLEMENT S3 ERROR HANDLING HERE?!
            if(err){
                throw "Error Appending to S3: " + err;
            }
            if(data){
                console.log(data.Location);
            }
        }).promise();
        let retUri = ret.Location;
        callback(null, {s3uri: retUri});
    }
    catch(err){
        return callback({
            code: grpc.status.INTERNAL,
            message: err
        });   
    }
}



//method that accepts {"s3uri":"..."} and deletes the file specified from
//the S3 bucket. If file is not found, a error response is returned with code (gRPC:5 or HTTP:404)
//which correspond to grpc.status.NOT_FOUND
async function deleteData(call, callback){
    try{
        let deleteUri = call.request.s3uri;
        if(deleteUri.split('amazonaws.com/').length>1){
            deleteUri = deleteUri.split('amazonaws.com/')[1];
        }
        if(deleteUri.split('wrh1997/').length>1){
            deleteUri = deleteUri.split('wrh1997/')[1];
        }
        if(deleteUri==null || deleteUri==""){
            return callback({
                code: grpc.status.UNIMPLEMENTED,
                message: "Incorrect Request Syntax!\nRequest to DeleteData should be formatted as a JSON containing \'s3uri'\ key-value pair!"
            });
        }
        let s3Client = new AWS.S3({
            credentials: {
                accessKeyId: accessKey,
                secretAccessKey: secretKey,
                sessionToken: sessionToken
            }
        });
        //check file exists in bucket
        /*var params = {Bucket:'csci5409-a2-wrh1997', Key: deleteUri };
        s3Client.getObject(params).on('success', function(response) {
            console.log("Key was", response.request.params.Key);
          }).on('error',function(error){
               //error return a object with status code 404
               console.error(error)
          }).send();*/
        let fileExists = false;
        let checkOptions = {
            Bucket: 'csci5409-a2-wrh1997',
            Key: deleteUri
        };
        /*CITATION NOTE:
        The following code to check whether a file exists in an S3 bucket
        was adapted from the following source:
        URL: https://github.com/andrewrk/node-s3-client/issues/88
        */
        await s3Client.getObject(checkOptions).on('success', function(response){
            fileExists = true;
        }).on('error', function(response){
            fileExists = false;
        }).promise();
        if(!fileExists){
            return callback({
                code: grpc.status.NOT_FOUND,
                message: "File not found!"
            })
        }
        let deleteOptions = {
            Bucket: 'csci5409-a2-wrh1997',
            Key: deleteUri
        };
        await s3Client.deleteObject(deleteOptions, function(err, data){
            if(err){
                throw "Error Deleting from S3: " + err;
            }
            if(data){
                currFileKey = "";
                currS3Uri = "";
            }
        }).promise();
        callback(null, {});
    }
    catch(err){
        return callback({
            code: grpc.status.INTERNAL,
            message: err
        });   
    }
}


//method to start the server and begin the server chain by posting to professor's /start endpoint
function main(){
    let currIp = "ec2-174-129-140-210.compute-1.amazonaws.com:6000";//ip.address() + ":6000";
    /*CITATION NOTE:
    The following code used to bind services from the proto file to the functions 
    that implement it onto the gRPC server from the following source:
    URL: https://blog.logrocket.com/communicating-between-node-js-microservices-with-grpc/
    */
    server.addService(protoObj.EC2Operations.service, {
        StoreData: storeData,
        AppendData: appendData,
        DeleteFile: deleteData
    });
    server.bindAsync(`${currIp}`, grpc.ServerCredentials.createInsecure(), () => {
        console.log(`Server started on ${currIp}...`);
        server.start();
        startChain(currIp);
    });
}

main();