// 1. Create a map object.
var mymap = L.map('map', {
    center: [47.7511, -120.7401],
    zoom: 7,
    maxZoom: 10,
    minZoom: 3,
    detectRetina: true});

// 2. Add a base map.
L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}.png').addTo(mymap);

// 3. Add airport GeoJSON Data
// Null variable that will hold cell tower data
var airports = null;


// 4. build up a set of colors from colorbrewer's dark2 category
var colors = chroma.scale('Dark2').mode('lch').colors(13);

// 5. dynamically append style classes to this page. This style classes will be used for colorize the markers.
for (i = 0; i < 13; i++) {
    $('head').append($("<style> .marker-color-" + (i + 1).toString() + " { color: " + colors[i] + "; font-size: 15px; text-shadow: 0 0 3px #ffffff;} </style>"));
}

// Get GeoJSON and put on it on the map when it loads
airports= L.geoJson.ajax("assets/airports.geojson", {
    // assign a function to the onEachFeature parameter of the cellTowers object.
    // Then each (point) feature will bind a popup window.
    // The content of the popup window is the value of `feature.properties.company`
    onEachFeature: function (feature, layer) {
        var l = feature.properties.AIRPT_NAME.toString()
        layer.bindPopup(l);
        return feature.properties.LOCCOUNTY;
    },
    pointToLayer: function (feature, latlng) {
        var id = 0;
        if (feature.properties.CNTL_TWR == "Y") { id = 0; }
        else if (feature.properties.CNTL_TWR == "N")  { id = 1; }
        else { id = 2;} // "Yakima MSA limited partnership"
        return L.marker(latlng, {icon: L.divIcon({className: 'fa fa-plane marker-color-' + (id + 1).toString() })});
    },
    attribution: 'Airport Location Data &copy; Data.gov | US States Data &copy; Mike Bostock of D3 | Base Map &copy; CartoDB | Made By Linli Shi'
}).addTo(mymap);

// 6. Set function for color ramp
colors = chroma.scale(['yellow', '008ae5']).colors(5);

function setColor(density) {
    var id = 0;
    if (density > 59) { id = 4; }
    else if (density > 26 && density <= 59) { id = 3; }
    else if (density > 15 && density <= 26) { id = 2; }
    else if (density > 8 &&  density <= 15) { id = 1; }
    else  { id = 0; }
    return colors[id];
}

// 7. Set style function that sets fill color.md property equal to cell tower density
function style(feature) {
    return {
        fillColor: setColor(feature.properties.count),
        fillOpacity: 0.6,
        weight: 2,
        opacity: 1,
        color: '#b4b4b4',
        dashArray: '4'
    };
}

// 8. Add county polygons
// create counties variable, and assign null to it.
var counties = null;
counties = L.geoJson.ajax("assets/us-states.geojson", {
    // onEachFeature: function (feature, layer) {
    //     var airptcount = feature.properties.count.toString()
    //     layer.bindPopup(<p>Number of Airports: </p>);
    //     return feature.properties.count;
    // },
    style: style
    
}).addTo(mymap);


// 9. Create Leaflet Control Object for Legend
var legend = L.control({position: 'topright'});

// 10. Function that runs when legend is added to map
legend.onAdd = function () {

    // Create Div Element and Populate it with HTML
    var div = L.DomUtil.create('div', 'legend');
    div.innerHTML += '<b>Number of Airports within Each State</b><br />';
    div.innerHTML += '<i style="background: ' + colors[4] + '; opacity: 0.5"></i><p> 59+ </p>';
    div.innerHTML += '<i style="background: ' + colors[3] + '; opacity: 0.5"></i><p> 26-58 </p>';
    div.innerHTML += '<i style="background: ' + colors[2] + '; opacity: 0.5"></i><p> 15-25 </p>';
    div.innerHTML += '<i style="background: ' + colors[1] + '; opacity: 0.5"></i><p> 8-14 </p>';
    div.innerHTML += '<i style="background: ' + colors[0] + '; opacity: 0.5"></i><p> 0-8 </p>';
    div.innerHTML += '<hr><b>Air Traffic Tower Availability<b><br />';
    div.innerHTML += '<i class="fa fa-plane marker-color-1"></i><p> Airport With Tower </p>';
    div.innerHTML += '<i class="fa fa-plane marker-color-2"></i><p> Airport Without Tower </p>';
    
    // Return the Legend div containing the HTML content
    return div;
};

// 11. Add a legend to map
legend.addTo(mymap);

// 12. Add a scale bar to map
L.control.scale({position: 'bottomleft'}).addTo(mymap);