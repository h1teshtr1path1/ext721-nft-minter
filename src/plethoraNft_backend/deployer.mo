import A "mo:base/AssocList";
import Array "mo:base/Array";
import Blob "mo:base/Blob";
import Bool "mo:base/Bool";
import Buffer "mo:base/Buffer";
import Cycles "mo:base/ExperimentalCycles";
import Error "mo:base/Error";
import Hash "mo:base/Hash";
import Int "mo:base/Int";
import Int16 "mo:base/Int16";
import Int8 "mo:base/Int8";
import Iter "mo:base/Iter";
import List "mo:base/List";
import Nat "mo:base/Nat";
import Nat32 "mo:base/Nat32";
import Nat64 "mo:base/Nat64";
import Option "mo:base/Option";
import Prelude "mo:base/Prelude";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Time "mo:base/Time";
import Trie "mo:base/Trie";
import Trie2D "mo:base/Trie";

import NFT "./NFT/main";
import AID "./AccountIdentifier";
import ExtCore "./Core";
import ExtCommon "./Common";
import ExtAllowance "./Allowance";
import ExtNonFungible "./NonFungible";



actor Deployer {
    type AccountIdentifier = ExtCore.AccountIdentifier;
    type SubAccount = ExtCore.SubAccount;
    type User = ExtCore.User;
    type Balance = ExtCore.Balance;
    type TokenIdentifier = ExtCore.TokenIdentifier;
    type TokenIndex  = ExtCore.TokenIndex ;
    type Extension = ExtCore.Extension;
    type CommonError = ExtCore.CommonError;
    type BalanceRequest = ExtCore.BalanceRequest;
    type BalanceResponse = ExtCore.BalanceResponse;
    type TransferRequest = ExtCore.TransferRequest;
    type TransferResponse = ExtCore.TransferResponse;
    type AllowanceRequest = ExtAllowance.AllowanceRequest;
    type ApproveRequest = ExtAllowance.ApproveRequest;
    type Metadata = ExtCommon.Metadata;
    type MetadataIndex = ExtCommon.MetadataIndex;
    type MintRequest  = ExtNonFungible.MintRequest ;

    private stable var deployerID : Principal = Principal.fromText("7xo7b-caaaa-aaaal-abjtq-cai");
    private var init_minter : Principal = deployerID;

    private stable var collections : Trie.Trie<Text, Text> = Trie.empty(); //mapping of Collection CanisterID -> Collection Name
    private stable var addresses : [Text] = [];


    type NFT = NFT.nft; 
    public type canister_id = Principal;
    public type canister_settings = {
        freezing_threshold : ?Nat;
        controllers : ?[Principal];
        memory_allocation : ?Nat;
        compute_allocation : ?Nat;
    };
    public type definite_canister_settings = {
        freezing_threshold : Nat;
        controllers : [Principal];
        memory_allocation : Nat;
        compute_allocation : Nat;
    };
    public type user_id = Principal;
    public type wasm_module = Blob;

    private func key(x : Nat32) : Trie.Key<Nat32> {
        return { hash = x; key = x };
    };

    private func keyT(x : Text) : Trie.Key<Text> {
        return { hash = Text.hash(x); key = x };
    };

    //IC Management Canister.
    let IC = actor "aaaaa-aa" : actor {
        canister_status : shared { canister_id : canister_id } -> async {
        status : { #stopped; #stopping; #running };
        memory_size : Nat;
        cycles : Nat;
        settings : definite_canister_settings;
        module_hash : ?[Nat8];
        };
        create_canister : shared { settings : ?canister_settings } -> async {
        canister_id : canister_id;
        };
        delete_canister : shared { canister_id : canister_id } -> async ();
        deposit_cycles : shared { canister_id : canister_id } -> async ();
        install_code : shared {
            arg : Blob;
            wasm_module : wasm_module;
            mode : { #reinstall; #upgrade; #install };
            canister_id : canister_id;
        } -> async ();
        provisional_create_canister_with_cycles : shared {
            settings : ?canister_settings;
            amount : ?Nat;
        } -> async { canister_id : canister_id };
        provisional_top_up_canister : shared {
            canister_id : canister_id;
            amount : Nat;
        } -> async ();
        raw_rand : shared () -> async [Nat8];
        start_canister : shared { canister_id : canister_id } -> async ();
        stop_canister : shared { canister_id : canister_id } -> async ();
        uninstall_code : shared { canister_id : canister_id } -> async ();
        update_settings : shared {
            canister_id : Principal;
            settings : canister_settings;
        } -> async ();
    };

    public query func cycleBalance() : async Nat {
        Cycles.balance();
    };

    private func create_canister() : async (Text) {
        Cycles.add(1000000000000);
        let canister = await NFT.nft(init_minter);
        let _ = await updateCanister(canister);
        let canister_id = Principal.fromActor(canister);
        return Principal.toText(canister_id);
    };

    private func updateCanister(a: actor {}) : async () {
        let cid = { canister_id = Principal.fromActor(a)};
        var principal : Text = "2ot7t-idkzt-murdg-in2md-bmj2w-urej7-ft6wa-i4bd3-zglmv-pf42b-zqe";
        var owner : Text = "";
        var wallet_can : Text = "";
        
        await (IC.update_settings( {
        canister_id = cid.canister_id; 
        settings = { 
            controllers = ?[Principal.fromText(principal)];
            compute_allocation = null;
            memory_allocation = null; 
            freezing_threshold = ?31_540_000} })
        );
    };
    public func wallet_receive() : async Nat{
        Cycles.accept(Cycles.available())
    };

    public shared(msg) func create_collection(collectionName : Text) : async(Text){
        assert(msg.caller == Principal.fromText("vqin2-mfk7l-reqbt-el23g-7rolz-wbopf-csgja-s7xz3-6h3zz-iz2kf-xae") or msg.caller == Principal.fromText("cbwh3-4gje3-s7ubx-zo3je-jmylt-vrpll-fdhvd-a5br4-nyebl-njajh-rqe"));
        var canID : Text = await create_canister();
        collections := Trie.put(collections, keyT(canID), Text.equal, collectionName).0;
        return canID;
    };

    public query func getCollections() : async([Text]){
        var buffer : Buffer.Buffer<Text> = Buffer.Buffer<Text>(0);
        for((id, name) in Trie.iter(collections)){
            var data : Text = name #" -> " #id #" ,";
            buffer.add(data);
        };
        return buffer.toArray();
    };
    public func getRegistry(collection_canister_id : Text) : async([Text]){
        var buffer : Buffer.Buffer<Text> = Buffer.Buffer<Text>(0);
        let collection = actor (collection_canister_id) : actor { getRegistry : () -> async [(TokenIndex, AccountIdentifier)]};
        var _registry : [(TokenIndex, AccountIdentifier)] = await collection.getRegistry();
        for((index, add) in _registry.vals()){
            var data : Text = Nat32.toText(index) #" : " #add #" ,";
            buffer.add(data);
        };
        return buffer.toArray();
    };

    public query func getAddresses() : async ([Text]){
        return addresses;
    };


    public shared(msg) func batch_mint_to_address(collection_canister_id : Text, base64encoding : Text, mint_to : Text, mint_size : Nat32) : async([TokenIndex]){
        assert(msg.caller == Principal.fromText("vqin2-mfk7l-reqbt-el23g-7rolz-wbopf-csgja-s7xz3-6h3zz-iz2kf-xae") or msg.caller == Principal.fromText("cbwh3-4gje3-s7ubx-zo3je-jmylt-vrpll-fdhvd-a5br4-nyebl-njajh-rqe"));
        var indices : Buffer.Buffer<TokenIndex> = Buffer.Buffer<TokenIndex>(0);
        var i : Nat32 = 0;
        while(i < mint_size){
            var mintReq : MintRequest = {
                to = #principal (Principal.fromText(mint_to));
                metadata = ?base64encoding;
            };
            let collection = actor (collection_canister_id) : actor { mintNFT : (MintRequest) -> async (TokenIndex)};
            var token_id : TokenIndex = await collection.mintNFT(mintReq);
            indices.add(token_id);
            i +=1;
        };
        return indices.toArray();
    };

    public func fetch_collection_addresses(canister_id : Text) : async (){
        let collection = actor (canister_id) : actor { getRegistry : () -> async ([(TokenIndex, AccountIdentifier)])};
        var new_addresses : [(TokenIndex, AccountIdentifier)] = await collection.getRegistry();
        var buffer : Buffer.Buffer<Text> = Buffer.Buffer<Text>(0);
        for(unit in addresses.vals()){
            buffer.add(unit);
        };
        for((token_index, account_identifier)  in new_addresses.vals()){
            buffer.add(account_identifier);
        };
        addresses := buffer.toArray();
    };

    public shared(msg) func airdrop_to_addresses(collection_canister_id : Text, canid : Text, base64encoding : Text, mint_size : Nat32) : async ([TokenIndex]){
        assert(msg.caller == Principal.fromText("vqin2-mfk7l-reqbt-el23g-7rolz-wbopf-csgja-s7xz3-6h3zz-iz2kf-xae") or msg.caller == Principal.fromText("cbwh3-4gje3-s7ubx-zo3je-jmylt-vrpll-fdhvd-a5br4-nyebl-njajh-rqe"));
        var i : Nat = 0;
        var indices : Buffer.Buffer<TokenIndex> = Buffer.Buffer<TokenIndex>(0);
        let collection = actor (collection_canister_id) : actor { getRegistry : () -> async [(TokenIndex, AccountIdentifier)]};
        var fetched_addresses : [(TokenIndex, AccountIdentifier)] = await collection.getRegistry();
        var total_mints : Nat = Nat32.toNat(mint_size);
        if(fetched_addresses.size() < Nat32.toNat(mint_size)){
            total_mints := fetched_addresses.size();
        };
        while(i < total_mints){
            var id : (TokenIndex, AccountIdentifier) = fetched_addresses[i];
            var mintReq : MintRequest = {
                to = #address (id.1);
                metadata = ?base64encoding;
            };
            let c = actor (canid) : actor { mintNFT : (MintRequest) -> async (TokenIndex)};
            var token_id : TokenIndex = await c.mintNFT(mintReq);
            indices.add(token_id);
            i := i+1;
        };
        return indices.toArray();
    };

    public shared(msg) func clear_collection_registry() : async() {
        assert(msg.caller == Principal.fromText("2ot7t-idkzt-murdg-in2md-bmj2w-urej7-ft6wa-i4bd3-zglmv-pf42b-zqe"));
        collections := Trie.empty();
    };

    public shared({caller}) func show_token_nft(collection_canister_id : Text, token_index : TokenIndex) : async(Metadata){
        // assert(caller == Principal.fromText("vqin2-mfk7l-reqbt-el23g-7rolz-wbopf-csgja-s7xz3-6h3zz-iz2kf-xae") or caller == Principal.fromText("cbwh3-4gje3-s7ubx-zo3je-jmylt-vrpll-fdhvd-a5br4-nyebl-njajh-rqe"));
        
        let collection_ = actor (collection_canister_id) : actor { getTokensMetadata : () -> async [(MetadataIndex, Metadata)]};
        var indices : [(TokenIndex, MetadataIndex)] = await getTokens(collection_canister_id);
        var meta : Metadata = #nonfungible {
            metadata = null;
        };
        var m_index : ?MetadataIndex = null;
        label indiLoop for(val in indices.vals()){
            if(val.0 == token_index){
                m_index := ?val.1;
                break indiLoop;
            }
        };
        var data : [(MetadataIndex, Metadata)] = await getTokensMetadata(collection_canister_id);
        for(val in data.vals()){
            if(?val.0 == m_index and m_index != null){
                meta := val.1;
            }
        };
        return meta;
    };
    public shared({caller}) func getTokens(collection_canister_id : Text) : async [(TokenIndex, MetadataIndex)]{
        let collection = actor (collection_canister_id) : actor { getTokens : () -> async [(TokenIndex, MetadataIndex)]};
        return (await collection.getTokens());
    };
    public shared({caller}) func getTokensMetadata(collection_canister_id : Text) : async [(MetadataIndex, Metadata)]{
        let collection = actor (collection_canister_id) : actor { getTokensMetadata : () -> async [(MetadataIndex, Metadata)]};
        return (await collection.getTokensMetadata());
    };
};