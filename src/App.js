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
import SdkLayerList from '@boundlessgeo/sdk/components/layer-list';
import { SdkLayerListItem } from '@boundlessgeo/sdk/components/layer-list';

import * as mapActions from '@boundlessgeo/sdk/actions/map';

import { Provider } from 'react-redux';
import '@boundlessgeo/sdk/stylesheet/sdk.scss';
import WMSPopup from './wmspopup';
import LayerList from './layerlist';
import AddWMSLayer from './addwmslayer';

/* eslint-disable no-underscore-dangle */
const store = createStore(combineReducers({
  map: SdkMapReducer,
}), window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(),
   applyMiddleware(thunkMiddleware));

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
        filter: ['==', 'priorita', '1'],
        paint: {
          'circle-radius': 5,
          'circle-color': '#f46b42',
          'circle-stroke-color': '#3a160b'
        }
      }));
    });
};



const addIdrometri = () => {
  let srsName = 'EPSG:3857';
  let typeName = 'Arpas:idropost';

  let url = `http://localhost:8080/geoserver/Arpas/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${typeName}&maxFeatures=200&outputFormat=application%2Fjson&srsName=${srsName}`;

  // let url = 'http://localhost:8080/geoserver/Arpas/ows?service=WFS&'+
  //            'version=1.0.0&request=GetFeature&typeName=Arpas:idropost&maxFeatures=200&' +
  //            'outputFormat=application%2Fjson&srsName=EPSG:3857';
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
  const urlLocal = 'http://192.168.18.131:8080/geoserver/ows?service=wms&version=1.3.0&request=GetCapabilities';
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
        const getMapUrlLocal = `http://192.168.18.131:8080/geoserver/ows?service=wms&version=1.3.0&request=GetMap&FORMAT=image/png&TRANSPARENT=TRUE&SRS=EPSG:900913&LAYERS=${layer.Name}&STYLES=&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}`;
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

const displayTable = () => {
  const features = store.getState().map.layers;
  console.log(features);
  console.log(store.getState().map);
  // Place the table on the page
  ReactDOM.render((
    <div >
     features
    </div>), document.getElementById('table'));
};

const App = () => (
<div>
  <SdkMap      
    store={store}
  />
  <div>
    <h4>Layers</h4>
    <LayerList store={store} />
    <div className="sdk-layerlist">
        <Provider store={store}>
          <SdkLayerList  />
        </Provider>
      </div>
    <button onClick={addWMS}>Add WMS Layer</button>
    <button onClick={addIdrometri}>Add IDROMETRI Layer</button>
    <button className="sdk-btn" onClick={displayTable}>Show the data in a table</button>
  </div>
</div>
);

export default App;


