import React, { Component } from 'react';
import './App.css';
import JSONViewer from 'react-json-viewer';
import JSONTree from 'react-json-tree'
import livDue from './liv_due.json';


let data = [
  {liv2: "A1.1", desc:"_a1.1", keyIs: "liv2", dentro: "A1"},
  {liv2: "A1.2", desc:"_a1.2", keyIs: "liv2", dentro: "A1"},
  {liv2: "B1.1", desc:"_b1.1", keyIs: "liv2", dentro: "B1"},
  {liv1: "A1", desc:"_a1", keyIs: "liv1", dentro: "A"},
  {liv1: "B1", desc:"_b1", keyIs: "liv1", dentro: "B"},
  {liv0: "A", desc:"_a", keyIs: "liv0"},
  {liv0: "B", desc:"_b", keyIs: "liv0"},
];

let inCarta = {tabella: "liv2", valori: ["A1.1", "B1.1", "A1.2"]};


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
  root: "liv0",
  leaf: "liv2",
  links: ["liv2","liv1","liv0"]
}

function getParentsOfVaules(state, tableKey, values) {
  const table = state[tableKey];
  if (!table) {
    return ["ERRORE"];  
  }
  
  const selectedFromTable = 
    values.map(value => {
        let {dentro, sort} = table[value];
        return Object.assign({value, dentro, sort});
      });


  function riduciFun(acc, v) {
    return acc;
  }
  const riassunto =  selectedFromTable.reduce(riduciFun, {});
  
  return selectedFromTable;
}

let data2 = getParentsOfVaules(dataNorma,"liv2", ["A1.1", "A1.2","B1.1"]);
let data1 = getParentsOfVaules(dataNorma,"liv1", ["A1", "B1"]);
let data0 = getParentsOfVaules(dataNorma,"liv0", ["A", "B"]);


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



let singolo = ["liv2", "A1.2"];

function fromDataNorma(data, ident) {
  let [tabella, key] = ident;
  let valore = data[tabella] && data[tabella][key];
  return valore;
}

console.log(fromDataNorma(dataNorma,singolo));

function estraiDentro(tabella) {
  let padri = new Set();
  tabella.forEach(function(element) {
    let padre = element.dentro;
    if (padre) {padri.add(padre)}
  }, this);
  return padri;
}

function estraiKey(element, keyIsIn) {
    let nameOfKeyField = element[keyIsIn];
    let key = element[nameOfKeyField];
    return key;
}


function trasforma(arr, sKey){
  let obj = {};
  arr.forEach(element => {
    let nameOfKey = element[sKey];
    let keyObj = element[nameOfKey];
    let keyTv = `${nameOfKey}/${keyObj}`;
    obj[keyTv] = element;
  });
  return obj;
}

let padri = estraiDentro(data);
let dataObj = trasforma(data, "keyIs");


console.log(padri);

class App extends Component {
  render() {
    return (
      <div className="App">
       {/* <JSONTree data={myTree}/> */}
       <JSONViewer json={data2}/>
      </div>
    );
  }
}

export default App;
