mapboxgl.accessToken = 'pk.eyJ1Ijoia2Zlc2xlciIsImEiOiJjazI3cG9jNTcwZ3VoM21sc3lhOHFtNnYzIn0.i6MLXYxFPfw96PdwMfIWnw';
secretToken = 'sk.eyJ1IjoibGVsemVpbnkiLCJhIjoiY2syOHZoZnlqMGV5bDNjbnI5ejllNnFzNyJ9.zcLcywC3GojHe1zvw_N23Q'
var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/dark-v10',
    center: [-103.59179687498357, 40.66995747013945],
    zoom: 3
});


function submitForm(){
    var address = document.getElementById("address").value;

    /*const Http = new XMLHttpRequest();
    const url = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'+ serialize(address) +'.json?types=address&access_token='+ secretToken;
    
    fetch(url).then(function(response) {
        response.text().then(function(text) {
            var x= JSON.parse(text);
            console.log(x.features[0].geometry.coordinates);
        });
    });*/
    
    
    var xhr = new XMLHttpRequest();
    xhr.open("POST",'/submit', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify({
            latitude: 50,
            longitude: 100,
            name: document.getElementById("name").value,
            description: document.getElementById("description").value,
            image: null,
            n_ratings: 32,
            rating: 3.5,
            type: 1
    }));

    
    menu = document.getElementById("menu");
    popup = document.getElementById("addStop");
    popup.style.display = "none";
    menu.style.display = "flex";
    getPoints();
}
function serialize(str){
    str = str.toString().split(" ");
    var ser = str[0];
    for(var i = 1; i < str.length; i++){
        var temp = "%" + str[i];
        ser += temp;
    }
    console.log(ser);
    return ser;
}

function getPoints(){
    const Http = new XMLHttpRequest();
    const url = '/points';
    var new_points = [];
    fetch(url).then(function(response) {
        response.text().then(function(text) {
          console.log(text);
          var x = JSON.parse(text);
          for(var j = 0; j < x.length; j++){

            // creating cards for each element
            var card = document.createElement('div');
            card.className = 'locationCard';
    
            var name = document.createElement('h3');
            name.innerHTML = x[j].name;
            for (var i = 0; i < 5; i++){
                var rating = document.createElement('i');
                if(x[j].rating >= 1){
                    rating.className = "fa fa-star";
                    x[j].rating --;
                }
                else{
                    rating.className = "fa fa-star-o";
                }
                name.appendChild(rating);
            }
            card.appendChild(name);
    
            var description = document.createElement('p');
            description.innerHTML = x[j].description;
            card.appendChild(description);
            document.getElementById('exploreContainer').appendChild(card);

            // adding points
            new_points.push({
                type:'FeatureCollection',
                features: [{
                    type: 'Feature',
                    geometry: {
                        type: 'Point',
                        coordinates:[x[j]["latitude"],x[j]["longitude"]]
                    },
                    properties: {
                        title: x[j]["name"],
                        description: x[j]["description"]
                    }
                }]
            })
            map.addSource("landmarks", {
                type:"geojson",
                data: new_points,
                cluster: true,
                clusterMaxZoom: 14, // Max zoom to cluster points on
                clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
            })
        }
        });
      });
}


map.on('load', function() {
    // Add a new source from our GeoJSON data and set the
    // 'cluster' option to true. GL-JS will add the point_count property to your source data.
    map.addSource("earthquakes", {
        type: "geojson",
        // Point to GeoJSON data. This example visualizes all M1.0+ earthquakes
        // from 12/22/15 to 1/21/16 as logged by USGS' Earthquake hazards program.
        data: "https://docs.mapbox.com/mapbox-gl-js/assets/earthquakes.geojson",
        cluster: true,
        clusterMaxZoom: 14, // Max zoom to cluster points on
        clusterRadius: 50 // Radius of each cluster when clustering points (defaults to 50)
    });
    var src = "earthquakes"

    getPoints();
    // while (map.getSource(src) == null) {};

    map.addLayer({
        id: "clusters",
        type: "circle",
        source: src,
        filter: ["has", "point_count"],
        paint: {
            // Use step expressions (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
            // with three steps to implement three types of circles:
            //   * Blue, 20px circles when point count is less than 100
            //   * Yellow, 30px circles when point count is between 100 and 750
            //   * Pink, 40px circles when point count is greater than or equal to 750
            "circle-color": [
                "step",
                ["get", "point_count"],
                "#05386B",
                100,
                "#379683",
                750,
                "#5CDB95"
            ],
            "circle-radius": [
                "step",
                ["get", "point_count"],
                20,
                100,
                30,
                750,
                40
            ]
        }
    });

    map.addLayer({
        id: "cluster-count",
        type: "symbol",
        source: src,
        filter: ["has", "point_count"],
        layout: {
            "text-field": "{point_count_abbreviated}",
            "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
            "text-size": 12
        }
    });

    map.addLayer({
        id: "unclustered-point",
        type: "circle",
        source: src,
        filter: ["!", ["has", "point_count"]],
        paint: {
            "circle-color": "#05386B",
            "circle-radius": 4,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#fff"
        }
    });

    // inspect a cluster on click
    map.on('click', 'clusters', function (e) {
        var features = map.queryRenderedFeatures(e.point, { layers: ['clusters'] });
        var clusterId = features[0].properties.cluster_id;
        map.getSource(src).getClusterExpansionZoom(clusterId, function (err, zoom) {
            if (err)
                return;

            map.easeTo({
                center: features[0].geometry.coordinates,
                zoom: zoom
            });
        });
    });

    map.on('mouseenter', 'clusters', function () {
        map.getCanvas().style.cursor = 'pointer';
    });
    map.on('mouseleave', 'clusters', function () {
        map.getCanvas().style.cursor = '';
    });
});


// var points = {
//   type: 'FeatureCollection',
//   features:[]
// }

// function add_point(latitude, longitude, name, description, image, n_ratings, rating, type) {
//   points.features.push(
//     {
//       type: 'Feature',
//       geometry: {
//         type: 'Point',
//         coordinates: [latitude, longitude]
//       },
//       properties: {
//         title: name,
//         description: description,
//         image: image,
//         n_ratings: n_ratings,
//         rating:rating,
//         type: type
//       }
//     }
//   )
// }