import * as React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";

import PlugConnect from '@psychedelic/plug-connect';


const App = () => {
  const [collections, setCollections] = useState([]);
  const [amt, setAmt] = useState(0);
  const [canister, setCanister] = useState("");
  const [encoding, setEncoding] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [atokens, setAtokens] = useState([]);
  const [wallet, setWallet] = useState("");
  const [name, setName] = useState("");
  const [connect, setConnect] = useState("Please Connect you Wallet!");
  const [registry, setRegistry] = useState([]);
  const [nft, setNft] = useState(null);

  const candidLink = "https://a4gq6-oaaaa-aaaab-qaa4q-cai.raw.ic0.app/?id=m4xcd-5iaaa-aaaal-abkua-cai";

  const handleAmtChange = (event) => {
    const { value } = event.target;
    setAmt(value);
  };
  const handleCanChange = (event) => {
    const { value } = event.target;
    setCanister(value);
  };
  const handleEncodingChange = (event) => {
    const { value } = event.target;
    setEncoding(value);
  };

  //plug connection and method call
  const deployerCanisterId = '7xo7b-caaaa-aaaal-abjtq-cai'
  const whitelist = [deployerCanisterId];

  const deployerIDL = ({ IDL }) => {
    const TokenIndex = IDL.Nat32;
    return IDL.Service({
      'airdrop_to_addresses': IDL.Func(
        [IDL.Text, IDL.Text, IDL.Nat32],
        [IDL.Vec(TokenIndex)],
        [],
      ),
      'batch_mint_to_address': IDL.Func(
        [IDL.Text, IDL.Text, IDL.Text, IDL.Nat32],
        [IDL.Vec(TokenIndex)],
        [],
      ),
      'clear_collection_registry': IDL.Func([], [], []),
      'create_collection': IDL.Func([IDL.Text], [IDL.Text], []),
      'cycleBalance': IDL.Func([], [IDL.Nat], ['query']),
      'fetch_collection_addresses': IDL.Func([IDL.Text], [], []),
      'getAddresses': IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      'getCollections': IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      'getRegistry': IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], []),
      'wallet_receive': IDL.Func([], [IDL.Nat], []),
    });
  };


  const getAllCollections = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const deployerActor = await window.ic.plug.createActor({
      canisterId: deployerCanisterId,
      interfaceFactory: deployerIDL,
    });

    try {
      const collection = await deployerActor.getCollections();
      const sessionData = window.ic.plug.sessionManager.sessionData;
      console.log(sessionData);
      setCollections(collection);
    }
    catch (err) {
      alert(err);
    }
  };
  const getRegistry = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const deployerActor = await window.ic.plug.createActor({
      canisterId: deployerCanisterId,
      interfaceFactory: deployerIDL,
    });

    try {
      const _registry = await deployerActor.getRegistry(String(canister));
      const sessionData = window.ic.plug.sessionManager.sessionData;
      console.log(sessionData);
      setRegistry(_registry);
    }
    catch (err) {
      alert(err);
    }
  };

  const batch_mint = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const deployerActor = await window.ic.plug.createActor({
      canisterId: deployerCanisterId,
      interfaceFactory: deployerIDL,
    });
    const sessionData = window.ic.plug.sessionManager.sessionData;
    console.log(canister);
    console.log(sessionData.principalId);
    console.log(encoding);
    console.log(amt);
    try {
      const mintedTokens = await deployerActor.batch_mint_to_address(String(canister), String(encoding), String(sessionData.principalId), Number(amt));
      setTokens(mintedTokens);
    }
    catch (err) {
      alert(err);
    }
  };

  const airdrop = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const deployerActor = await window.ic.plug.createActor({
      canisterId: deployerCanisterId,
      interfaceFactory: deployerIDL,
    });
    const sessionData = window.ic.plug.sessionManager.sessionData;
    console.log(canister);
    console.log(sessionData.principalId);
    console.log(encoding);
    console.log(amt);
    try {
      const mintedTokens = await deployerActor.airdrop_to_addresses(String(canister), String(encoding), Number(amt));
      setAtokens(mintedTokens);
    }
    catch (err) {
      alert(err);
    }
  };

  const handleCollectionCreation = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    const deployerActor = await window.ic.plug.createActor({
      canisterId: deployerCanisterId,
      interfaceFactory: deployerIDL,
    });

    try {
      const canisterId = await deployerActor.create_collection(name);
      alert(canisterId);
    }
    catch (err) {
      alert(err);
    }
  };

  useEffect(() => {
    async function checkConnection() {
      const isConnected = await window.ic.plug.isConnected();
      if (isConnected) {
        setConnect("Connected!");
      }
    }
    checkConnection();
  }, []);


  return (
    <div style={{ "fontSize": "30px" }}>
      <div>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <div style={{ color: "Green", backgroundColor: "Yellow", marginRight: 100 }}>
            {connect}
          </div>
          <div>
            <PlugConnect
              whitelist={whitelist}
              onConnectCallback={() => { setWallet(window.ic.plug.principalId) }}
            />
          </div>
        </div>
        <br></br>
        <div>
          <div>Create Collection: (To create a new NFT collection)</div>
          <div><input
            name="name"
            placeholder="Collection Name"
            required
            onChange={(event) => setName(event.target.value)}
            value={name}
          ></input>
          </div>
          <button
            style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
            className=""
            onClick={handleCollectionCreation}>
            Create Collection!
          </button>
        </div>
        <br></br>
        <div>
          <div>
            Check all Nft Collection Name and Collection Canister ID's
          </div>
          <div>
            <button
              style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
              className=""
              onClick={getAllCollections}>
              All NFT Collection?
            </button>
            <div style={{ fontSize: 30, color: "Green", backgroundColor: "Yellow" }}>{collections}</div>
          </div>
        </div>
        <br></br>

        <div>
          <div>
            Check Token Registry of Collection
          </div>
          <div><input
            name="canisterID"
            placeholder="Collection Canister ID?"
            required
            onChange={handleCanChange}
          ></input></div>
          <div>
            <button
              style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
              className=""
              onClick={getRegistry}>
              Registry?
            </button>
            <div style={{ fontSize: 20, backgroundColor: "Yellow" }}>
              {registry}
            </div>
          </div>

        </div>
        <br></br>
        <br></br>




        <div>
          <div>Batch Mint to Yourself : (Mint multiple Nft's to your Plug address!)</div>
          <div>
            <div><input
              name="amt"
              type='number'
              placeholder="How many?"
              required
              onChange={handleAmtChange}
            ></input></div>
            <div><input
              name="canisterID"
              placeholder="Collection Canister ID?"
              required
              onChange={handleCanChange}
            ></input></div>
            <div style={{display:"flex"}}>
              <div style={{fontSize:20}}>
                NFT image
              </div>
              <div>
              {nft && (
                <div>
                  <img alt="not found" width={"200px"} src={URL.createObjectURL(nft)} />
                  <button onClick={() => setNft(null)}>Remove</button>
                </div>
              )}
              <input
                type="file"
                name="myImage"
                onChange={(event) => {
                  const file = event.target.files[0];
                  const reader = new window.FileReader()
                  reader.onloadend = () => {
                    setNft(event.target.files[0]);
                    setEncoding(reader.result)
                    console.log(reader.result)
                  }
                  reader.readAsDataURL(file);
                }}
              />
              </div>
            </div>
            <button
              style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
              className=""
              onClick={batch_mint}>
              Batch mint!
            </button>
            <div style={{ color: "Green", backgroundColor: "Yellow" }}>{tokens}</div>
          </div>
        </div>
        <br></br>
        <br></br>

        <div>
          <div>Airdrop to Addresses : (Airdrop NFT to fetched addresses from different collection)</div>
          <div>
            <div><input
              name="amt"
              type="number"
              placeholder="To how many?"
              required
              onChange={handleAmtChange}
            ></input></div>
            <div><input
              name="canisterID"
              placeholder="Collection Canister ID?"
              required
              onChange={handleCanChange}

            ></input></div>
            <div style={{display:"flex"}}>
              <div style={{fontSize:20}}>
                NFT image
              </div>
              <div>
              {nft && (
                <div>
                  <img alt="not found" width={"200px"} src={URL.createObjectURL(nft)} />
                  <button onClick={() => setNft(null)}>Remove</button>
                </div>
              )}
              <input
                type="file"
                name="myImage"
                onChange={(event) => {
                  const file = event.target.files[0];
                  const reader = new window.FileReader()
                  reader.onloadend = () => {
                    setNft(event.target.files[0]);
                    setEncoding(reader.result)
                    console.log(reader.result)
                  }
                  reader.readAsDataURL(file);
                }}
              />
              </div>
            </div>
            <button
              style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
              className=""
              onClick={airdrop}>
              Airdrop!
            </button>
            <div style={{ color: "Green", backgroundColor: "Yellow" }}>{atokens}</div>
          </div>
        </div>
        {/* <div>
          nft image 
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
        </div> */}
      </div>

    </div>
  );
};

render(<App />, document.getElementById("app"));