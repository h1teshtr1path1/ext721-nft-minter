import * as React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";

import Image from "../components/Image";
import { EXT } from "../../declarations/plethoraNft_backend";
import PlugConnect from '@psychedelic/plug-connect';


import { Actor, HttpAgent } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { AuthClient } from '@dfinity/auth-client';

const App = () => {
  const [name, setName] = useState("");
  const [nft, setNft] = useState(null);
  const [size, setSize] = useState(0);
  const [id, setId] = useState("");

  const [buffer, setBuffer] = useState(null);


  const handleNameChange = (event) => {
    const { value } = event.target;
    setName(value);
  };
  const handleSizeChange = (event) => {
    const { value } = event.target;
    setSize(value);
  };
  const handleIdChange = (event) => {
    const { value } = event.target;
    setId(value);
  };

  const handleMint = async (event) => {
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
          {/* nft image  */}
          <div>
            <h3>NFT image</h3>
            {nft && (
              <div>
                <img alt="not found" width={"250px"} src={URL.createObjectURL(nft)} />
                <button onClick={() => setNft(null)}>Remove</button>
              </div>
            )}
            <input
              type="file"
              name="myImage"
              onChange={(event) => {
                const reader = new window.FileReader()
                reader.readAsArrayBuffer(event.target.files[0])
                reader.onloadend = () => {
                  setBuffer(Buffer(reader.result))
                  setNft(event.target.files[0]);
                }
              }}
            />
            <button onClick={(event) => {
              console.log(buffer.toString())
            }}>Check Buffer in Console</button>
          </div>
        </div>
        <div>
          <button
            style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
            className=""
            onClick={handleMint}>
            Mint
          </button>
        </div>
      </div>
      <PlugConnect
        whitelist={[]}
        onConnectCallback={() => console.log("Some callback")}
      />
    </div>
  );
};

render(<App />, document.getElementById("app"));