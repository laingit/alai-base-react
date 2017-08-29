import React, { Component } from 'react';
import './App.css';
import JSONViewer from 'react-json-viewer';
import JSONTree from 'react-json-tree'
import livDue from './liv_due.json';

let dataNorma = {
  liv2: {
    "A1.1": {desc:"_a1.1", dentro: "A1", sort: 1},
    "A1.2": {desc:"_a1.2", dentro: "A1", sort: 2},
    "B1.1": {desc:"_b1.1", dentro: "B1", sort: 1},
  },
  liv1: {
    "A1": {desc: "_a1", dentro: "A", sort:1},
    "B1": {desc: "_b1", dentro: "B", sort:1}
  },
  liv0: {
    "A": {desc: "_a", dentro: "root", sort:1},
    "B": {desc: "_b", dentro: "root", sort:2}
  },
  links: ["liv2","liv1","liv0"]
}

function getParentsOfVaules(state, tableKey, values) {
  const table = state[tableKey];
  if (!table) {
    throw "errore tabella non esiste: "  + tableKey;  
  }
  
  const selectedFromTable = 
    values.map(value => {
        let {dentro, sort} = table[value];
        return {tableKey, value, dentro, sort};
      });

  function riduciFun(acc, v) {
    let key = v.dentro;
    let presente = acc[key];
   
    if (presente) {
      presente.push(v);
      acc[key] = presente
    } else {
      acc[key]= [v];
    }
    return acc;
  }
  const riassunto =  selectedFromTable.reduce(riduciFun, {});

  function ordinaSelezionaCampi(obj, soloId = true) {
    let newObj = {};
    Object.keys(obj).map(key => {
      let lista = obj[key];
      // ordina in place
      lista.sort((obj1, obj2) => obj1.sort - obj2.sort);

      // seleziona i campi 
      let soloCampiSelezionati = lista.map(v => {
        let {tableKey, dentro, value, sort} = v;
        if (soloId) {
          return [tableKey, value]; // Id
        } else {
          return {tableKey, value}; // object
        }
      });

      newObj[key] = soloCampiSelezionati;
    });

    return newObj;
  }
  
  let soloId = true;
  return ordinaSelezionaCampi(riassunto, soloId);
}


function selezionaLegendaDaCartografati(dataNorma, listaCartografati) {
  let liv2 = getParentsOfVaules(dataNorma,"liv2", listaCartografati);
  let liv1 = getParentsOfVaules(dataNorma,"liv1", Object.keys(liv2));
  let liv0 = getParentsOfVaules(dataNorma,"liv0", Object.keys(liv1));

  return {liv0, liv1, liv2};
}

function getFromDataNorm(data, ident) {
  let [tabella, key] = ident;
  let valore = data[tabella] && data[tabella][key];
  return valore;
}

function createFlatten(dataNorm, legenda) {
  let root = [];
  let TABELLA = "liv0";
  let iDsLiv0 = legenda[TABELLA]["root"];
  
  if (iDsLiv0) {
    iDsLiv0.forEach( ident => {
      let [tableKey, value] = ident;
      let liv_value = getFromDataNorm(dataNorm, ident);
      let liv_value_completo = Object.assign({tableKey, value}, liv_value)
      root.push(liv_value_completo);
      TABELLA = "liv1";
      let iDsLiv1 = legenda[TABELLA][value];
      iDsLiv1.forEach( ident => {
        let [tableKey, value] = ident;
        let liv_value = getFromDataNorm(dataNorm, ident);
        let liv_value_completo = Object.assign({tableKey, value}, liv_value)
        root.push(liv_value_completo);
        TABELLA = "liv2";
        let iDsLiv2 = legenda[TABELLA][value]; // value = A1, A2, B1 Fkey liv2 - iDs liv1
        iDsLiv2.forEach( ident => {           // value = A1.1, A1.2 - iDs liv2
          let [tableKey, value] = ident;
          let liv_value = getFromDataNorm(dataNorm, ident);
          let liv_value_completo = Object.assign({tableKey, value}, liv_value)
          root.push(liv_value_completo);
        });
      });
    });
  }

  return root;
}


function createTree(dataNorm, legenda) {
  let root = [];
  let TABELLA = "liv0";
  let iDsLiv0 = legenda[TABELLA]["root"];
  
  if (iDsLiv0) {
    iDsLiv0.forEach( ident => {
      let [tableKey, value] = ident;
      let new0 = {value, children: []};
      TABELLA = "liv1";
      let iDsLiv1 = legenda[TABELLA][value];
      iDsLiv1.forEach( ident => {
        let [tableKey, value] = ident;
        let new1 = {value, children: []};
        new0.children.push(new1);
        TABELLA = "liv2";
        let iDsLiv2 = legenda[TABELLA][value]; // value = A1, A2, B1 Fkey liv2 - iDs liv1
        iDsLiv2.forEach( ident => {           // value = A1.1, A1.2 - iDs liv2
          let [tableKey, value] = ident;
          let new2 = {value};
          new1.children.push(new2);
        });
      });
      root.push(new0);
    });
  }
 
  return root;
}

let legCartofato = selezionaLegendaDaCartografati(dataNorma,[]);
let rootElaborato = createTree(dataNorma, legCartofato);


let myTree = [
  {
    value: {kind: "liv0", desc: "A"},
    children: [
      {
        value: "A1",
        children: [
          {
            value: "A1.1"
          },
          {
            value: "A1.2"
          }
        ]
      }
    ]
  },
  {
    value: {kind: "liv0", desc: "B"},
    children: [
      {
        value: "B1",
        children: [
          {
            value: "B1.1"
          }
        ]
      }
    ]
  },
]

// let data = [
//   {liv2: "A1.1", desc:"_a1.1", keyIs: "liv2", dentro: "A1"},
//   {liv2: "A1.2", desc:"_a1.2", keyIs: "liv2", dentro: "A1"},
//   {liv2: "B1.1", desc:"_b1.1", keyIs: "liv2", dentro: "B1"},
//   {liv1: "A1", desc:"_a1", keyIs: "liv1", dentro: "A"},
//   {liv1: "B1", desc:"_b1", keyIs: "liv1", dentro: "B"},
//   {liv0: "A", desc:"_a", keyIs: "liv0"},
//   {liv0: "B", desc:"_b", keyIs: "liv0"},
// ];


// function trasforma(arr, sKey){
//   let obj = {};
//   arr.forEach(element => {
//     let nameOfKey = element[sKey];
//     let keyObj = element[nameOfKey];
//     let keyTv = `${nameOfKey}/${keyObj}`;
//     obj[keyTv] = element;
//   });
//   return obj;
// }

// let dataObj = trasforma(data, "keyIs");

class App extends Component {
  render() {
    return (
      <div className="App">
       <JSONTree data={legCartofato}/>
       <JSONViewer json={rootElaborato}/> 
      </div>
    );
  }
}

export default App;


