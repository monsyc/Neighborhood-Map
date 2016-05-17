/** Globals  */
var map;
var markers = [];
var infoWindow;

/** Temperature API */
jQuery(document).ready(function($) {
  	$.ajax({
	  	url : "http://api.wunderground.com/api/d8483e016960a875/geolookup/conditions/q/CA/San_Diego.json",
	  	dataType : "jsonp",
	  	success : function(parsed_json) {
	  		var location = parsed_json['location']['city'];
	  		var temp_f = parsed_json['current_observation']['temp_f'];
	  		document.getElementById("temperature-box").innerHTML = ("Current temperature in " + location + " is " + temp_f +" °F"); },
        error: function (textStatus, errorThrown) {
            alert('Temperature API failed to load.');
        }
  	});
});

/** Makers Information */
var places = [
    {name:"Ghirardelli",  
    city: "San Diego",
    location:"643 5th Ave, San Diego, CA 92101",  
    phone:"(619) 234-2449",
    lat:32.713445,
    lng:-117.159899},

    {name:"Gaslamp Quarter Association",    
    city: "San Diego",     
    location:"614 5th Ave, San Diego, CA 92101",                       
    phone:"(619) 233-5227",         
    lat:32.711965,
    lng:-117.160322},

    {name:"Las Hadas Bar and Grill",   
    city: "San Diego",
    location:"560 4th Ave, San Diego, CA 92101",  
    phone:"(619) 696-3466",
    lat:32.7111707,
    lng:-117.1611935},

    {name:"Chocolat Cremeria",   
    city: "San Diego",
    location:"509 5th Ave, San Diego, CA 92101",  
    phone:"(619) 238-9400",
    lat:32.710702,
    lng:-117.159964},

    {name:"Ralphs",   
    city: "San Diego",
    location:"101 G St, San Diego, CA 92101",  
    phone:"(619) 595-1581",
    lat:32.7120875,
    lng:-117.1633436}
];

/** Knockout binding for 'myPlaces' and 'query' */
$(function() {
    var myPlaces = places;
    var viewModel = {
        myPlaces: ko.observableArray(myPlaces),
        setContent: function() {
            alert("value.name");
        },
        query: ko.observable(''),
        search: function(value) {
            console.log('search: ' + value);
            viewModel.myPlaces.removeAll();
            for(var x = 0; x < places.length; x++) {
                if(places[x].name.toLowerCase().indexOf(value.toLowerCase()) >= 0) {
                    console.log('visible: ' + places[x].name);
                    viewModel.myPlaces.push(places[x]);
                    markers[x].setVisible(true);
                } else {
                    console.log('invisible: ' + markers[x].title );
                    markers[x].setVisible(false);
                }
            }
        }
    };
    viewModel.query.subscribe(viewModel.search);
    ko.applyBindings(viewModel);
});

/** Initializes the google map and its markers. */
function initialize() {
    var bounds = new google.maps.LatLngBounds();
    var mapOptions = {
        mapTypeId: 'roadmap',
        zoom: 16
    };
                    
    // Display a map on the page
    map = new google.maps.Map(document.getElementById("map_canvas"), mapOptions);
    
    // Loop through our array of markers & place each one on the map  
    for( i = 0; i < places.length; i++ ) {
        var position = new google.maps.LatLng(places[i].lat, places[i].lng);
        bounds.extend(position);
        marker = new google.maps.Marker({
            position: position,
            animation: google.maps.Animation.DROP,
            title: places[i].name
        });
        // Display multiple markers on a map
        infoWindow = new google.maps.InfoWindow(), marker, i;

        markers.push(marker);
        
        // Allow each marker to have an info window    
        google.maps.event.addListener(markers[i], 'click', (function(marker, i) {
            return function() {
                showMarkerContent(marker, i);
            }
        })(markers[i], i));

        markers[i].setMap(map);
    }

    // Automatically center the map fitting all markers on the screen
    map.fitBounds(bounds);
}

/** Shows content when a list item is selected */
function showContent(name) {
    for(var x = 0; x < markers.length; x++) {
        if (markers[x].title.indexOf(name) >= 0){
            console.log('found: ' + name);
            markers[x].setAnimation(google.maps.Animation.BOUNCE);
            stopAnimation(markers[x]);
            showMarkerContent(markers[x], x);
        }
    }
}

/** Stops marker bounce animation */
function stopAnimation(marker) {
    setTimeout(function () {
        marker.setAnimation(null);
    }, 2000);
}

/** Shows info window of the selected marker. */
function showMarkerContent(marker, i) {
    try {
        infoWindow.setContent('<div id="info_content">' 
            + '<h3>' + places[i].name + '</h3>' 
            + '<p>' + places[i].city +'</p>' 
            + '<p>' + places[i].location +'</p>' 
            +'</div>');
        infoWindow.open(map, marker);
        showStreetView(i);
    } catch(err) {
        console.log('error: ' + err);
    }
}

/** Shows street view */
function showStreetView(i) {
    var panorama = new google.maps.StreetViewPanorama(
        document.getElementById('street_view'), {
            position: {lat: places[i].lat, lng: places[i].lng},
            pov: {
                heading: 34,
                pitch: 10
            }
        }
    );
    map.setStreetView(panorama);
}

/** Displays alert when google maps API failed to load */
function googleError() {
    alert("Google Maps API failed to load!");
}
