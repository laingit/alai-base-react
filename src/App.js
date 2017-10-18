/** WMS Example.
 *
 *  Shows how to interact with a Web Mapping Service.
 *
 */

import { createStore, combineReducers, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import React from 'react';
import ReactDOM from 'react-dom';
import WMSCapabilitiesFormat from 'ol/format/wmscapabilities';

import SdkMap from '@boundlessgeo/sdk/components/map';
import SdkMapReducer from '@boundlessgeo/sdk/reducers/map';
import * as mapActions from '@boundlessgeo/sdk/actions/map';

import '@boundlessgeo/sdk/stylesheet/sdk.scss';
import WMSPopup from './wmspopup';
import LayerList from './layerlist';
import AddWMSLayer from './addwmslayer';

/* eslint-disable no-underscore-dangle */
const store = createStore(combineReducers({
  map: SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
   applyMiddleware(thunkMiddleware));

// var vectorLayer =  new ol.layer.Image({
// source: new ol.source.ImageVector({
//     source: new ol.source.Vector({
//     url: 'http://localhost:8080/geoserver/Arpas/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Arpas:idropost&maxFeatures=200&outputFormat=application%2Fjson&srsName=EPSG:3857',
//     format: new ol.format.GeoJSON(),
//     }),
//     style: new ol.style.Style({
//       image: new ol.style.Circle({
//         fill: new ol.style.Fill({
//           color: 'rgba(255,0,0,0.8)'
//         }),
//         radius: 3,
//         stroke: new ol.style.Stroke({
//           color: '#000',
//           width: 1
//         })
//       })
//     })
// }),
// });

const addDataFromGeoJSON = (url, sourceName) => {
  // Fetch URL
  return fetch(url)
    .then(
      response => response.json(),
      error => console.error('An error occured.', error),
    )
    // addFeatures with the features, source name
    // .then(json => store.dispatch(mapActions.addFeatures(sourceName, json)));
    .then(json => {
      store.dispatch(mapActions.addSource(sourceName, {
        type: 'geojson',
        data: json
      }));
      store.dispatch(mapActions.addLayer({
        id: sourceName,
        source: sourceName,
        paint: {
          'circle-radius': 5,
          'circle-color': '#f46b42',
          'circle-stroke-color': '#3a160b',
        }
      }));
    });
};

const addIdrometri = () => {
  let url = 'http://localhost:8080/geoserver/Arpas/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=Arpas:idropost&maxFeatures=200&outputFormat=application%2Fjson&srsName=EPSG:3857';
  let sourceName = 'idrometri'
  addDataFromGeoJSON(url, sourceName);
}


store.dispatch(mapActions.setView([9, 40], 8));

// add the OSM source
store.dispatch(mapActions.addSource('osm', {
  type: 'raster',
  tileSize: 256,
  tiles: [
    'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png',
    'https://c.tile.openstreetmap.org/{z}/{x}/{y}.png',
  ],
}));

// and an OSM layer.
store.dispatch(mapActions.addLayer({
  id: 'osm',
  source: 'osm',
}));

// set the background color.
store.dispatch(mapActions.addLayer({
  id: 'background',
  type: 'background',
  paint: {
    'background-color': '#eee',
  },
}));

// retrieve GetCapabilities and give user ability to add a layer.
const addWMS = () => {
  // this requires CORS headers on the geoserver instance.
  //const urlBound = 'https://demo.boundlessgeo.com/geoserver/wms?service=WMS&request=GetCapabilities';
  const urlLocal = 'http://192.168.18.51:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities';
  //const urlRegione = 'http://webgis.regione.sardegna.it/geoserver/ows?service=WMS&request=GetCapabilities';
  fetch(urlLocal)
  .then(
    response => response.text(),
    error => console.error('An error occured.', error),
  )
  .then((xml) => {
    const info = new WMSCapabilitiesFormat().read(xml);
    const root = info.Capability.Layer;
    ReactDOM.render(<AddWMSLayer
      onAddLayer={(layer) => {
        // add a new source and layer
        //const getMapUrlBound = `https://demo.boundlessgeo.com/geoserver/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:900913&LAYERS=${layer.Name}&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
        const getMapUrlLocal = `http://192.168.18.51:8080/geoserver/ows?service=wms&version=1.3.0&request=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:900913&LAYERS=${layer.Name}&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
        //const getMapUrlRegione = `http://webgis.regione.sardegna.it/geoserver/ows?service=WMS&request=GetCapabilities&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:900913&LAYERS=${layer.Name}&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
        store.dispatch(mapActions.addSource(layer.Name, {
          type: 'raster',
          tileSize: 256,
          tiles: [getMapUrlLocal],
        }));
        store.dispatch(mapActions.addLayer({
          metadata: {
            'bnd:title': layer.Title,
            'bnd:queryable': layer.queryable,
          },
          id: layer.Name,
          source: layer.Name,
        }));
      }
    }
      layers={root.Layer}
    />, document.getElementById('add-wms'));
  });
};

const App = () => (
  <div>
  <SdkMap  
    includeFeaturesOnClick
    onClick={(map, xy, featuresPromise) => {
      // show a popup containing WMS GetFeatureInfo.
      featuresPromise.then((featureGroups) => {
        // setup an array for all the features returned in the promise.
        let features = [];

        // featureGroups is an array of objects. The key of each object
        // is a layer from the map.
        for (let g = 0, gg = featureGroups.length; g < gg; g++) {
          // collect every feature from each layer.
          const layers = Object.keys(featureGroups[g]);
          for (let l = 0, ll = layers.length; l < ll; l++) {
            const layer = layers[l];
            features = features.concat(featureGroups[g][layer]);
          }
        }
        if (features.length > 0) {
          map.addPopup(<WMSPopup
            coordinate={xy}
            closeable
            features={features}
          />);
        }
      });

    }}
    store={store}
  />

  <div>
    <h4>Layers</h4>
    <LayerList store={store} />
    
    <button onClick={addWMS}>Add WMS Layer</button>
    <button onClick={addIdrometri}>Add IDROMETRI Layer</button>
  </div>
</div>
);
  


export default App;


