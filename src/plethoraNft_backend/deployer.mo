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



actor Deployer {

    private var init_minter : Principal = Principal.fromText("2ot7t-idkzt-murdg-in2md-bmj2w-urej7-ft6wa-i4bd3-zglmv-pf42b-zqe");
    private stable var nftCanister : Principal = Principal.fromText("7xo7b-caaaa-aaaal-abjtq-cai");


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

    public func create_canister() : async (Text) {
        Cycles.add(1000000000000);
        let canister = await NFT.nft(init_minter);
        let _ = await updateCanister(canister);
        let canister_id = Principal.fromActor(canister);
        
        nftCanister := canister_id;
        return Principal.toText(canister_id);
    };

    public func updateCanister(a: actor {}) : async () {
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
};