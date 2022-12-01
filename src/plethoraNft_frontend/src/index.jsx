import * as React from "react";
import { useState, useEffect } from "react";
import { render } from "react-dom";

import { Audio } from 'react-loader-spinner'

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
  const [nft_collection, setNftCollection] = useState("");
  const [token_index, setTokenIndex] = useState(0);
  const [loader, setLoader] = useState(false);
  const [address, setAddress] = useState("");
  const [prevent, setPrevent] = useState(false);

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

  const handlePreventChange = (event) => {
    if (event.target.checked) {
      setPrevent(true);
    }
    else{
      setPrevent(false)
    }
  };

  //plug connection and method call
  const deployerCanisterId = '7xo7b-caaaa-aaaal-abjtq-cai'
  const whitelist = [deployerCanisterId];

  const deployerIDL = ({ IDL }) => {
    const TokenIndex = IDL.Nat32;
    const MetadataIndex = IDL.Nat32;
    const Metadata = IDL.Variant({
      'fungible' : IDL.Record({
        'decimals' : IDL.Nat8,
        'metadata' : IDL.Opt(IDL.Vec(IDL.Nat8)),
        'name' : IDL.Text,
        'symbol' : IDL.Text,
      }),
      'nonfungible' : IDL.Record({ 'metadata' : IDL.Opt(IDL.Text) }),
    });
    return IDL.Service({
      'airdrop_to_addresses' : IDL.Func(
          [IDL.Text, IDL.Text, IDL.Text, IDL.Nat32, IDL.Bool],
          [IDL.Vec(TokenIndex)],
          [],
        ),
      'batch_mint_to_address' : IDL.Func(
          [IDL.Text, IDL.Text, IDL.Text, IDL.Nat32],
          [IDL.Vec(TokenIndex)],
          [],
        ),
      'clear_collection_registry' : IDL.Func([], [], []),
      'create_collection' : IDL.Func([IDL.Text, IDL.Text], [IDL.Text], []),
      'cycleBalance' : IDL.Func([], [IDL.Nat], ['query']),
      'fetch_collection_addresses' : IDL.Func([IDL.Text], [], []),
      'getAddresses' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      'getCollections' : IDL.Func([], [IDL.Vec(IDL.Text)], ['query']),
      'getRegistry' : IDL.Func([IDL.Text], [IDL.Vec(IDL.Text)], []),
      'getTokens' : IDL.Func(
          [IDL.Text],
          [IDL.Vec(IDL.Tuple(TokenIndex, MetadataIndex))],
          [],
        ),
      'getTokensMetadata' : IDL.Func(
          [IDL.Text],
          [IDL.Vec(IDL.Tuple(MetadataIndex, Metadata))],
          [],
        ),
      'show_token_nft' : IDL.Func([IDL.Text, TokenIndex], [Metadata], []),
      'wallet_receive' : IDL.Func([], [IDL.Nat], []),
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
      setLoader(true)
      const collection = await deployerActor.getCollections();
      const sessionData = window.ic.plug.sessionManager.sessionData;
      console.log(sessionData);
      setCollections(collection);
      setLoader(false)
      console.log(prevent);
    }
    catch (err) {
      alert(err);
      setLoader(false)
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
      setLoader(true)
      const _registry = await deployerActor.getRegistry(String(canister));
      const sessionData = window.ic.plug.sessionManager.sessionData;
      console.log(sessionData);
      setRegistry(_registry);
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
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
    console.log(encoding);
    console.log(amt);
    try {
      setLoader(true)
      const mintedTokens = await deployerActor.batch_mint_to_address(String(canister), String(encoding), String(address), Number(amt));
      setTokens(mintedTokens);
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
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
    console.log(prevent);
    try {
      setLoader(true)
      const mintedTokens = await deployerActor.airdrop_to_addresses(String(nft_collection), String(canister), String(encoding), Number(amt), Boolean(prevent));
      setAtokens(mintedTokens);
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
    }
  };

  const handleCollectionCreation = async (event) => {
    const isConnected = await window.ic.plug.isConnected();
    if (!isConnected) {
      alert("Connect Plug Wallet!");
      return;
    }
    alert("You need to transfer [0.33763252 ICP -><-  1T cycles (NFT Collection Canister)] + [0.0001 ICP -><- Transaction Fees] to Provider for creation of new collection.");

    try {
      const params = {
        to: 'cbwh3-4gje3-s7ubx-zo3je-jmylt-vrpll-fdhvd-a5br4-nyebl-njajh-rqe',
        amount: 33773252,      //0.33773252
        memo: 'charges for new canister creation',
      };
      const result = await window.ic.plug.requestTransfer(params);
      console.log(result);
    }
    catch (err) {
      alert(err);
      console.log(err);
      return;
    }
    const deployerActor = await window.ic.plug.createActor({
      canisterId: deployerCanisterId,
      interfaceFactory: deployerIDL,
    });

    try {
      setLoader(true)
      const sessionData = window.ic.plug.sessionManager.sessionData;
      const canisterId = await deployerActor.create_collection(name, String(sessionData.principalId));
      alert("Here is your nft collection : " + canisterId + "and Owner : " + (sessionData.principalId));
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
    }
  };

  const show_token_nft = async (event) => {
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
      setLoader(true)
      const image = await deployerActor.show_token_nft(String(canister), Number(token_index));
      console.log(String(image.nonfungible.metadata));
      if (String(image.nonfungible.metadata) == "") {
        alert("Token Not Found!");
      }
      setNftCollection(String(image.nonfungible.metadata));
      setLoader(false)
    }
    catch (err) {
      alert(err);
      setLoader(false)
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
        <div style={{ display: "flex", justifyContent: "center", backgroundColor: "Black", position: "fixed", width: "100%" }}>
          <div style={{ marginRight: 50 }}>
            {
              loader && (<Audio
                height="30"
                width="30"
                radius="9"
                color='green'
                ariaLabel='three-dots-loading'
                wrapperStyle
                wrapperClass
              />)
            }
          </div>
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
        <div style={{ marginTop: 50 }}>
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
            List all created Collections and their Canister ID’s
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
          <div>Airdrop to Holders of an NFT Collection : </div>
          <div>
            {/* <div><input
              name="amt"
              type="number"
              placeholder="To how many?"
              required
              onChange={handleAmtChange}
            ></input></div> */}
            <label style={{ display: "flex" }}>
              <input
                type="checkbox"
                name="canisterID"
                onChange={handlePreventChange}
              ></input>
              <div style={{fontSize: 20}}>Prevent Duplicate Airdrop!</div>
            </label>
            <div><input
              name="canisterID"
              placeholder="Of which collection?"
              required
              onChange={(event) => setNftCollection(event.target.value)}
            ></input></div>
            <div><input
              name="canisterID"
              placeholder="To which collection?"
              required
              onChange={handleCanChange}

            ></input></div>
            <div style={{ display: "flex" }}>
              <div style={{ fontSize: 20 }}>
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



        <br></br>
        <br></br>




        <div>
          <div>Manually Mint to Address</div>
          <div>
            <div><input
              name="amt"
              type='number'
              placeholder="How many?"
              required
              onChange={handleAmtChange}
            ></input></div>
            <div><input
              name="Address"
              placeholder="To Whom?"
              required
              onChange={(event) => setAddress(event.target.value)}
            ></input></div>
            <div><input
              name="canisterID"
              placeholder="Collection Canister ID?"
              required
              onChange={handleCanChange}
            ></input></div>
            <div style={{ display: "flex" }}>
              <div style={{ fontSize: 20 }}>
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
          <div>
            Check Minted NFT using TokenIndex : of a Collection
          </div>
          <div><input
            name="canisterID"
            placeholder="Collection Canister ID?"
            required
            onChange={handleCanChange}
          ></input></div>
          <div><input
            name="token_index"
            placeholder="Token Index?"
            required
            onChange={(event) => setTokenIndex(event.target.value)}
          ></input></div>
          <div>
            <button
              style={{ backgroundColor: "transparent", cursor: 'pointer', marginTop: 20, marginBottom: 20, width: 150, height: 30 }}
              className=""
              onClick={show_token_nft}>
              NFT?
            </button>
            <div style={{ fontSize: 20, backgroundColor: "Yellow" }}>
              <img src={nft_collection}></img>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

render(<App />, document.getElementById("app"));