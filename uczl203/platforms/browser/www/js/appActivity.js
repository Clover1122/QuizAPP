//uczl203---the following code is adapted from Claire Ellul Practical-week5
//https://github.com/claireellul/cegeg077-week5app/blob/master/ucfscde/www/js/appActivity.js

//add the variables
//store the map
var mymap;
//a global cariable to hold the http request
var client;
//a custom popup
var popup = L.popup();
//a variable to hold question point
var questionData;

var getGeoJSONLayer;

//a variable for clicked marker
var ClickedMarker;

//a variable to tell whether the answer chosen is correct or not
var trueAnswer;

//these are the code that runs when the quiz app starts
loadMap();
trackLocation();
getGeoJSONLayer();

// ***********************************
//the functions 
//loads leaflet map
function loadMap(){
		mymap = L.map('mapid').setView([51.505, -0.09], 13);
		// load the tiles
		L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
			maxZoom: 18,
			attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
				'<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
				'Imagery © <a href="http://mapbox.com">Mapbox</a>',
			id: 'mapbox.streets'
		}).addTo(mymap);
}

//the following code is adapted from Practical-Location based services via html5.pdf/step3
//track locations of user movement
function trackLocation() {
	if (navigator.geolocation) {
		navigator.geolocation.watchPosition(showPosition);
	} else {
		document.getElementById('showLocation').innerHTML = "Geolocation is not supported by this browser.";
	}
}

//show user location with points on the map
function showPosition(position) {
	//add a 50meters radius around the user's current position
    var radius = 50
    user = L.marker([position.coords.latitude, position.coords.longitude]).bindPopup("<b>Current location </b>").addTo(mymap);
    UserRadius = L.circle([position.coords.latitude, position.coords.longitude], radius).addTo(mymap);
}

//calculate the distance between user location and Warren Street Station
//the code is adapted from Practical-Location based services via HTML5.pdf/step3
function getDistance() {
	//getDistanceFromPoint is the function called once the distance has been found
	navigator.geolocation.getCurrentPosition(getDistanceFromPoint);
}

function getDistanceFromPoint(position) {
	//find the coordinates of a point using this website:
	//these are the coordinates for Warren Street
	var lat = 51.524616;
	var lng = -0.13818;
	//return the distance in kilometers
	var distance = calculateDistance(position.coords.latitude, position.coords.longitude, lat,lng, 'K');
	document.getElementById('showDistance').innerHTML = "Distance: " + distance;
}

//distance calculation-- the following code is adapted from https://www.htmlgoodies.com/beyond/javascript/calculate-the-distance-between-two-points-inyour-web-apps.html
function calculateDistance(lat1, lon1, lat2, lon2, unit) {
	var radlat1 = Math.PI * lat1/180;
	var radlat2 = Math.PI * lat2/180;
	var radlon1 = Math.PI * lon1/180;
	var radlon2 = Math.PI * lon2/180;
	var theta = lon1-lon2;
	var radtheta = Math.PI * theta/180;
	var subAngle = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
	subAngle = Math.acos(subAngle);
	subAngle = subAngle * 180/Math.PI; // convert the degree value returned by acos back to degrees from radians
	dist = (subAngle/360) * 2 * Math.PI * 3956; // ((subtended angle in degrees)/360) * 2 * pi * radius )
	//where radius of the earth is 3956 miles
	if (unit=="K") { dist = dist * 1.609344 ;} // convert miles to km
	if (unit=="N") { dist = dist * 0.8684 ;} // convert miles to nautical miles
	return dist;
}

//call the server--to get questionData from database
function getGeoJSONLayer() { 
    //set up the request 
	client = new XMLHttpRequest(); 
	//make the request to the URL 
	client.open('GET','http://developer.cege.ucl.ac.uk:30284/getquestionData'); 
	//tell the request what method to run that will listen for the response 
	client.onreadystatechange = QAResponse;
	//activate the request 
	client.send(); 
} 

//receive the response
function QAResponse() { 
    //wait for a response - if readyState is not 4 then keep waiting  
	if (client.readyState == 4) { 
	//get the data from the response 
	var respData = client.responseText; 
	//call a function that does something with the data 
	loadquestionData(respData); 
	} 
} 

//use the following coad to convert received data to GeoJSON
//then show them on the leaflet map
//a list to store question point makers
QuMarker = [];
function loadquestionData(respData) { 
    // convert the text received from the server to JSON  
	var QAjson = JSON.parse(respData); 
	// load the geoJSON layer 
	var questionData = L.geoJson(QAjson, 
	    { 
		// use point to layer to create the points 
		pointToLayer: function (feature, latlng) 
		{
			PTLMarker = L.marker(latlng)
			PTLMarker.bindPopup("<b>" + feature.properties.location_name + "</b>");
			QuMarker.push(PTLMarker);
			return PTLMarker;
			},
		}).addTo(mymap);  
	mymap.fitBounds(questionData.getBounds()); 
} 

//the following code is used to alert user when they click a question point without their 50m radius
function QuestionClosed(){
	QuDistCheck(QuMarker);
}
//now check the distance between user and each question point
//the following code is adapted from Practical-Saving data to the server.pdf/Processing GeoJSON
function QuDistCheck(qMark){
	//get user's coordinates
	latlng = user.getLatLng();
	alert("Please check whether you are near a question point or not:)--within 50m");
	//use a loop to test if question points are within 25m(from user's location)
	for(var i=0; i<qMark.length; i++){
		CurrentM = qMark[i];
		CurrentM_coor = CurrentM.getLatLng();
		
		var Dist = calculateDistance(CurrentM_coor.lat, CurrentM_coor.lng, latlng.lat, latlng.lng);
		if (Dist <=25){
			qMark.on('click', onMapClick);
		}else{
			qMark[i].bindPopup("Please move closer to the question point:)");
		}
	}
}

//show where the user clicks
function onMapClick(e) {
	ClickedQuestion(this);
	ClickedMarker = this;
}

//then the question setted will show after the question point is clicked
function ClickedQuestion(clickedqu){
	//questions div is replaced by leaflet map div
	document.getElementById('questions').style.display = 'block';
	document.getElementById('mapid').style.display = 'none';
	//show the question setted
	document.getElementById("question").value = clickedqu.feature.properties.question;
	document.getElementById("answer_1").value = clickedqu.feature.properties.answer_1;
	document.getElementById("answer_2").value = clickedqu.feature.properties.answer_2;
	document.getElementById("answer_3").value = clickedqu.feature.properties.answer_3;
	document.getElementById("answer_4").value = clickedqu.feature.properties.answer_4;
	//now create radio button answer and make sure all buttons unchecked at the beginning
	document.getElementById("radioCheck1").checked = false;
	document.getElementById("radioCheck2").checked = false;
	document.getElementById("radioCheck3").checked = false;
	document.getElementById("radioCheck4").checked = false;
	ClickedMarker = clickedqu;
}

//receive the answer chosen
function AnswerSubmitted(){
	var an1 = document.getElementById("radioCheck1").checked;
	var an2 = document.getElementById("radioCheck2").checked;
	var an3 = document.getElementById("radioCheck3").checked;
	var an4 = document.getElementById("radioCheck4").checked;
	
	//before user select an answer
	if (an1 == false && an2 == false && an3 == false $$ an4 == false){
		alert("Please click one answer :)");
	}else{
		AnswerUpload();
	}

//the following code is used to give user a response about whether the answer is correct or not
function AnswerUpload(){
	alert("Answer Submitting...")
	
	//define the correct answer
	var CA = ClickedMarker.feature.properties.correct_answer;
	//define the question
	var question = document.getElementById("question").value;
	//define the answer chosen
	var answer;
	//then upload the answer chosen to the database
	var postString = "question=" + question;
	
	if (document.getElementById("radioCheck1").checked) {
		answer = 1;
        postString = postString + "&answer=" + answer;
    }
    if (document.getElementById("radioCheck2").checked) {
		answer = 2;
    	postString = postString + "&answer=" + answer;
    }
	if (document.getElementById("radioCheck3").checked) {
		answer = 3;
		postString = postString + "&answer=" + answer;
	}
	if (document.getElementById("radioCheck4").checked) {
		answer = 4;
		postString = postString + "&answer=" + answer;
	}
	
	//show whether true or false
	if (answer == CA){
		alert("Ohhh Correct!!");
		trueAnswer = true;
	}else{
		alert("Ohhh your answer " + answer + " is not correct:( \n The correct answer is " + CA);
		trueAnswer = false;
	}
	postString = postString + "&correct_answer=" + CA;
	processAnswer(postString);
}

//now upload the answer to database
function processAnswer(postString){
	client = new XMLHttpRequest();
	client.open('POST','http://developer.cege.ucl.ac.uk:30284/AnswerUpload',true);
	client.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	client.onreadystatechange = answerSub;  
	client.send(postString);
}

//receive and process the response
function answerSub(){
	if (client.readyState == 4){
		document.getElementById('questions').style.display = 'none';
		document.getElementById('mapid').style.display = 'block';
	}
}