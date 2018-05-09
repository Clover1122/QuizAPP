var client;

function startDataUpload() {
alert ("start data upload");

// Question Status
var Question_ID = document.getElementById("Question_ID").value;
var Question = document.getElementById("Question").value;
var Answer_1 = document.getElementById("Answer_1").value;
var Answer_2 = document.getElementById("Answer_2").value;
var Answer_3 = document.getElementById("Answer_3").value;
var Answer_4 = document.getElementById("Answer_4").value;
var Correct_Answer = document.getElementById("Correct_Answer").value;
var Location_Name = document.getElementById("Location_Name").value;

// Now get the geometry values
var Latitude = document.getElementById("Latitude").value;
var Longitude = document.getElementById("Longitude").value;
var postString = "Question_ID="+ Question_ID+ "Question="+ Question+ "&Answer_1="+ Answer_1+ "Answer_2="+ Answer_2+ "&Answer_3="+ Answer_3+ "&Answer_4="+ Answer_4+ "&Correct_Answer="+ Correct_Answer+ "&Location_Name="+ Location_Name; 

// Adding up all the constraints
postString = postString + "&Latitude=" + Latitude= + "&Longitude=" + Longitude;

// Pop-up box for showing what data have been uploaded
alert(Question_ID+ " "+ Question+ " "+ Answer_1 + " "+ Answer_2+ " "+Answer_3 + " "+ Answer_4+ " "+ Correct_Answer+ Latitude + " "+ Longitude + " "+ Location_Name);

processData(postString);

}

function processData(postString) {
client = new XMLHttpRequest();
client.open('POST','http://developer.cege.ucl.ac.uk:30284/uploadData',true);
client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
client.onreadystatechange = dataUploaded;
client.send(postString);

}
// create the code to wait for the response from the data server, and process the response once it is received

function dataUploaded() {
// this function listens out for the server to say that the data is ready - i.e. has state 4
if (client.readyState == 4) {
// change the DIV to show the response
document.getElementById("dataUploadResult").innerHTML = client.responseText;
}
}