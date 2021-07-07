/*
 Description:    Convert RGF93 Lambert 93 to WGS84 ( GPS Coordinates Latitude / Longitude )
 Author:         Justin Baroux 
 Author URI:     https://www.linkedin.com/in/justin-baroux-11071b11a/
 Version:        1.0.0
 Date :          2019
*/

const fs = require('fs');

const FILENAME = "start.json";

console.log('\n##########################################################');
console.log('#####        STARTING ESRI TO GEOJSON PARSER         #####');
console.log('##########################################################\n')

const raw = fs.readFileSync(FILENAME);
const rawJSON = JSON.parse(raw);

let result = {
    type: "FeatureCollection",
    features: []
};

rawJSON.features.map(f => {
    console.log(`\n 🚅 VOIE : ${f.attributes.LIBELLE} 🚅`);

    const initialPath = f.geometry.paths;

    initialPath.map(p => {
        p.map((e, index) => {
            const convertion = lambert93toWGS84(e[0], e[1]);
            p[index] = [parseFloat(convertion.longitude.toFixed(7)), parseFloat(convertion.latitude.toFixed(7))];
        })
    });

    let feature = {
        type: "Feature",
        geometry: {
            type: "MultiLineString",
            coordinates: initialPath
        },
        properties: f.attributes
    }

    result.features.push(feature)
})

fs.writeFile("results.json", JSON.stringify(result), function (err) {
    if (err) throw err;

    console.log('\n##########################################################');
    console.log('#####          ENDING ESRI TO GEOJSON PARSER         #####');
    console.log('##########################################################\n')
});

Math.tanh = Math.tanh || function (x) {
    if (x === Infinity) {
        return 1;
    } else if (x === -Infinity) {
        return -1;
    } else {
        return (Math.exp(x) - Math.exp(-x)) / (Math.exp(x) + Math.exp(-x));
    }
};

Math.atanh = Math.atanh || function (x) {
    return Math.log((1 + x) / (1 - x)) / 2;
};

function lambert93toWGS84(lambertE, lambertN) {
    var constantes = {
        GRS80E: 0.081819191042816,
        LONG_0: 3,
        XS: 700000,
        YS: 12655612.0499,
        n: 0.7256077650532670,
        C: 11754255.4261
    }

    var delX = lambertE - constantes.XS;
    var delY = lambertN - constantes.YS;
    var gamma = Math.atan(-delX / delY);
    var R = Math.sqrt(delX * delX + delY * delY);
    var latiso = Math.log(constantes.C / R) / constantes.n;
    var sinPhiit0 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * Math.sin(1)));
    var sinPhiit1 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit0));
    var sinPhiit2 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit1));
    var sinPhiit3 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit2));
    var sinPhiit4 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit3));
    var sinPhiit5 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit4));
    var sinPhiit6 = Math.tanh(latiso + constantes.GRS80E * Math.atanh(constantes.GRS80E * sinPhiit5));

    var longRad = Math.asin(sinPhiit6);
    var latRad = gamma / constantes.n + constantes.LONG_0 / 180 * Math.PI;

    var longitude = latRad / Math.PI * 180;
    var latitude = longRad / Math.PI * 180;

    return { longitude: longitude, latitude: latitude };
}