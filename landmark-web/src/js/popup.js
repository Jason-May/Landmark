function toggleAction(action){
    menu = document.getElementById("menu");
    popup = document.getElementById(action);
    if(popup.style.display == "none"){
        popup.style.display = "block";
	    menu.style.display = "none";
    }
    else{
        popup.style.display = "none";
	    menu.style.display = "flex";
    }
}

function myMove() {
    var elem = document.getElementById("explore");
    var set_width = window.innerWidth * 0.33;
    if(elem.style.left == ""){
        elem.style.display = "block";
        var pos = -1 * set_width;
        var id = setInterval(frame, 0.5);
        function frame() {
          if (pos > -10) {
            elem.style.left = "0px";
            clearInterval(id);
          } else {
            pos += 30;
            elem.style.left = pos + "px"; 
          }
        }
    }
    else{
        elem.style.left = "";
        elem.style.display = "none";
    }
  }

  
var geojson = {
  type: 'FeatureCollection',
  features: [{
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-77.032, 38.913]
    },
    properties: {
      title: 'Mapbox',
      description: 'Washington, D.C.'
    }
  },
  {
    type: 'Feature',
    geometry: {
      type: 'Point',
      coordinates: [-122.414, 37.776]
    },
    properties: {
      title: 'Mapbox',
      description: 'San Francisco, California'
    }
  }]
};

function userPoint(){
  const Http = new XMLHttpRequest();
  const url = '/points';
  fetch(url).then(function(response) {
      response.text().then(function(text) {
        console.log(text);
        var x = JSON.parse(text);
        var i = 3;
        for(var j = 0; j < x.length; j++){
          geojson.features[i].type = 'Feature';
          geojson.features[i].geometry.type = 'Point';
          geojson.features[i].geometry.coordinates = "[" + x[j].latitude + ", " + x[j].longitude + "]";
          geojson.features[i].properties.title = x[j].name;
          geojson.features[i].properties.description = x[j].description;
        }
      });
    });
}

// add markers to map
geojson.features.forEach(function(marker) {
  // create a HTML element for each feature
  var el = document.createElement('div');
  el.className = 'marker';

  // make a marker for each feature and add to the map
  new mapboxgl.Marker(el)
    .setLngLat(marker.geometry.coordinates)
    .setPopup(new mapboxgl.Popup({ offset: 25 }) // add popups
    .setHTML('<h3>' + marker.properties.title + '</h3><p>' + marker.properties.description + '</p>'))
    .addTo(map);
});