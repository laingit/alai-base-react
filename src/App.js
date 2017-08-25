import React, { Component } from 'react';
import './App.css';
import JSONViewer from 'react-json-viewer';
import JSONTree from 'react-json-tree'
import livDue from './liv_due.json';


let data = [
  {liv2: "A1.1", desc:"_a1.1", keyIs: "liv2", in: "A1"},
  {liv2: "A1.2", desc:"_a1.2", keyIs: "liv2", in: "A1"},
  {liv1: "A1", desc:"_a1", keyIs: "liv1", in: "A"},
  {liv1: "B1", desc:"_b1", keyIs: "liv1", in: "B"},
  {liv0: "A", desc:"_a1", keyIs: "liv0", in: ""},
  {liv0: "B", desc:"_b1", keyIs: "liv0", in: ""},
];


const take = (array, n) => {
  var newArray = [];
  for (var index = 0; index < n ; index++) {
    var element = array[index];
    newArray.push(element);
  }
  return newArray;
}

const trasforma = (arr, sKey) => {
  let obj = {};
  arr.forEach(element => {
    let nameOfKey = element[sKey];
    let keyObj = element[nameOfKey];
    obj[keyObj] = element;
  });
  return obj;
}

data = trasforma(data, "keyIs");


console.log(data);

class App extends Component {
  render() {
    return (
      <div className="App">
       <JSONTree data={data}/>
       <JSONViewer json={data}/>
      </div>
    );
  }
}

export default App;
