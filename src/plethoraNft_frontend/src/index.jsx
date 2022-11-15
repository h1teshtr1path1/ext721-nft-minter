import * as React from "react";
import {useState, useEffect} from "react";
import { render } from "react-dom";

import { ext721 } from "../../declarations/ext721";
import PlugConnect from '@psychedelic/plug-connect';

const MyHello = () => {
  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [size, setSize] = useState(0);
  const [id, setId] = useState("");


  const handleNameChange = (event) =>{
    const {value} = event.target;
    setName(value);
  };
  const handleSizeChange = (event) =>{
    const {value} = event.target;
    setSize(value);
  };
  const handleImageChange = (event) =>{
    const {value} = event.target;
    setImage(value);
  };
  const handleIdChange = (event) =>{
    const {value} = event.target;
    setId(value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault()
  }




  return (
    <div style={{ "fontSize": "30px" }}>
      <div>
        <div>
          <div>Collection Name :</div>
            <div><input
                name="name"
                placeholder="Name"
                required
                onChange={handleNameChange}
                value={name}
              ></input>
            </div>
        </div>
        <div>
        <div>Collection Image(base64) :</div>
          <div><input
                name="Image"
                placeholder="Image"
                required
                onChange={handleImageChange}
                value={image}
              ></input></div>
        </div>
        <div>
        <div>Collection Size :</div>
          <div><input
                name="Size"
                placeholder="Size"
                required
                onChange={handleSizeChange}
                value={size}
              ></input></div>
        </div>
        <div>
        <div>NFT's Owner Principal ID :</div>
          <div><input
                name="Id"
                placeholder="Principal"
                required
                onChange={handleIdChange}
                value={id}
              ></input></div>
        </div>
        <div>
        <button style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop:20, marginBottom:20, width: 150, height:30 }} className="" onSubmit={handleSubmit}>Mint</button>
        </div>
      </div>
      <PlugConnect
        whitelist={[]}
        onConnectCallback={() => console.log("Some callback")}
      />
    </div>
  );
};

render(<MyHello />, document.getElementById("app"));