
//--------------------MODEL--------------------//

// List of POIs + info

var icons = [
	'img/frog_orange.png',
	'img/frog_green.png'
];

var home = {
	'name': 'Blake\'s House',
	'lat': 32.759904, 
	'lng': -117.127454,
	'keywords': 'home, casa',
	'street': '4542 Boundary St',
	'city': 'San Diego',
	'icon': icons[0]
};

var pois = [
	home,
	{
		'name': 'Coin-Op Game Room',
		'lat': 32.7490327, 
		'lng': -117.1303769,
		'keywords': 'bar, video',
		'street': '3926 30th St',
		'city': 'San Diego',
		'icon': icons[0]
	},
	{
		'name': 'Soda Bar',
		'lat': 32.7398671,
		'lng': -117.1205925,
		'keywords': 'bar, music',
		'street': '3615 El Cajon Blvd',
		'city': 'San Diego',
		'icon': icons[0]
	},
	{
		'name': 'Seven Grand',
		'lat': 32.7486272, 
		'lng': -117.1286325,
		'keywords': 'bar, whiskey',
		'street': '3054 University Ave',
		'city': 'San Diego',
		'icon': icons[0]
	},
	{
		'name': 'Rigoberto\'s Taco Shop',
		'lat': 32.7216101, 
		'lng': -117.0858673,
		'keywords': 'food, mexican',
		'street': '2704 University Ave',
		'city': 'San Diego',
		'icon': icons[0]
	}
];




//--------------------VIEWMODEL--------------------//

function AppViewModel() {

	// create a reference to the current 'this'
	var self = this;

	// hide error message
	// document.getElementById("map-alt").style.visibility = "hidden";

	// define some observables to force refreshes
	this.poiList = ko.observableArray([home]);
	this.searchInput = ko.observable('Type keywords here');
	this.currentPoi = ko.observable(home);
	this.currentName = ko.computed(function() {
		return self.currentPoi().name;
	}, this);
	this.streetViewImgSrc = ko.computed(function() {
		var street = self.currentPoi().street;
		var city = self.currentPoi().city;
		var address = street.trim() + ', ' + city.trim();
		return 'https://maps.googleapis.com/maps/api/streetview?size=282x282&location="'+ address + '"';
    }, this);


	// define function to change which POI is shown in streetview image
	this.changeCurrentPoi = function(p) {
		self.currentPoi(p);
	};

	// find center of map
	var latMin = pois[0].lat;
	var latMax = pois[0].lat;
	var lngMin = pois[0].lng;
	var lngMax = pois[0].lng;
	for ( var i = 0; i < pois.length; i++ ) {
		if (pois[i].lat < latMin) {latMin = pois[i].lat;}
		if (pois[i].lat > latMax) {latMax = pois[i].lat;}
		if (pois[i].lng < lngMin) {lngMin = pois[i].lng;}
		if (pois[i].lng > lngMax) {lngMax = pois[i].lng;}
	}
	var latCenter = (latMin + latMax) / 2;
	var lngCenter = (lngMin + lngMax) / 2;

	// init map
	this.map = new google.maps.Map( document.getElementById( 'map-canvas' ),
		{
			center: { lat: latCenter, lng: lngCenter },
		 	zoom: 12
		}
	);


	// init markers
	var markers = [];
	this.initMarkers = function(data) {

		for ( var i = 0; i < markers.length; i++) {
			markers[i].setMap(null);
		}
		markers.length = 0;

		for ( var i = 0; i < data.length; i++ ) {

			var latLng = new google.maps.LatLng( data[i].lat, data[i].lng );
			var marker = new google.maps.Marker(
				{
					position: latLng,
					map: self.map,
					title: data[i].name,
					icon: icons[0]
				}
			);

			var p = data[i];
			google.maps.event.addListener(marker, 'click', function() {
			    self.changeCurrentPoi( p );
			});

			markers.push( marker );
		}
	}
	this.initMarkers(self.poiList());

	// define search function
	this.searchPois = function() {

		self.poiList.removeAll();
		for ( var i = 0; i < pois.length; i++ ) {

			var searchInputLC = self.searchInput().toLowerCase();
			var searchStringsLC = pois[i].name.toLowerCase() + pois[i].keywords.toLowerCase();

			if ( searchStringsLC.indexOf(searchInputLC) !== -1 ) {
				self.poiList.push( pois[i] );
			}
		}

		self.initMarkers(self.poiList());
	};
}

// apply all knockout bindings
ko.applyBindings(new AppViewModel());