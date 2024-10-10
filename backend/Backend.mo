import Buffer "mo:base/Buffer";
import Error "mo:base/Error";
import D "mo:base/Debug";
import ExperimentalCycles "mo:base/ExperimentalCycles";
import Result "mo:base/Result";

import Principal "mo:base/Principal";
import Time "mo:base/Time";
import Timer "mo:base/Timer";

import CertifiedData "mo:base/CertifiedData";
import Nat64 "mo:base/Nat64";
import CertTree "mo:cert/CertTree";

import ICRC1 "mo:icrc1-mo/ICRC1";
import Account "mo:icrc1-mo/ICRC1/Account";
import ICRC2 "mo:icrc2-mo/ICRC2";
import ICRC3 "mo:icrc3-mo/";
import ICRC4 "mo:icrc4-mo/ICRC4";

///DKP Token
import Types "Types";
import Blob "mo:base/Blob";
import Int "mo:base/Int";
import ICPTypes "ICPTypes";

//game variables
import Array "mo:base/Array";

shared ({ caller = _owner }) actor class Token(
  args : ?{
    icrc1 : ?ICRC1.InitArgs;
    icrc2 : ?ICRC2.InitArgs;
    icrc3 : ICRC3.InitArgs; //already typed nullable
    icrc4 : ?ICRC4.InitArgs;
  }
) = this {

  let Set = ICRC1.Set;
  let Map = ICRC1.Map;

  //let ICPLedger : ICPTypes.Service = actor ("ryjl3-tyaaa-aaaaa-aaaba-cai");
  let DKPLedger : ICPTypes.Service = actor ("zfcdd-tqaaa-aaaaq-aaaga-cai"); //ic0
  // let backendCanisterID : String = "hjfd4-eqaaa-aaaam-adkmq-cai"; // ic0
  // let DKPLedger : ICPTypes.Service = actor ("bd3sg-teaaa-aaaaa-qaaba-cai"); // local

  type Account = ICRC1.Account;

  let settings : Types.Settings = {
    dkp_fee_d8 = 100_000;
    dpw_fee_d12 = 1250;
    dkp_swap_fee_d8 = 25_0000_0000; // Fee of 25 DKP when swapping to DPW
    d8_to_d12 = 10_000;
    conversion_factor = 800_000;
  };

  let default_icrc1_args : ICRC1.InitArgs = {
    name = ?"Dragon Paladin Wizard";
    symbol = ?"DPW";
    logo = ?"data:image/jpg;base64,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";
    decimals = 12;
    fee = ? #Fixed(settings.dpw_fee_d12);
    minting_account = ?{
      owner = _owner;
      subaccount = null;
    };
    max_supply = null;
    min_burn_amount = ?10000;
    max_memo = ?32;
    advanced_settings = null;
    metadata = null;
    fee_collector = null;
    transaction_window = null;
    permitted_drift = null;
    max_accounts = ?100000000;
    settle_to_accounts = ?99999000;
  };

  let default_icrc2_args : ICRC2.InitArgs = {
    max_approvals_per_account = ?10000;
    max_allowance = ? #TotalSupply;
    fee = ? #ICRC1;
    advanced_settings = null;
    max_approvals = ?10000000;
    settle_to_approvals = ?9990000;
  };

  let default_icrc3_args : ICRC3.InitArgs = ?{
    maxActiveRecords = 3000;
    settleToRecords = 2000;
    maxRecordsInArchiveInstance = 100000000;
    maxArchivePages = 62500;
    archiveIndexType = #Stable;
    maxRecordsToArchive = 8000;
    archiveCycles = 6_000_000_000_000;
    archiveControllers = null; //??[put cycle ops prinicpal here];
    supportedBlocks = [
      {
        block_type = "1xfer";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      },
      {
        block_type = "2xfer";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      },
      {
        block_type = "2approve";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      },
      {
        block_type = "1mint";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      },
      {
        block_type = "1burn";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      },
    ];
  };

  let default_icrc4_args : ICRC4.InitArgs = {
    max_balances = ?200;
    max_transfers = ?200;
    fee = ? #ICRC1;
  };

  let icrc1_args : ICRC1.InitArgs = switch (args) {
    case (null) default_icrc1_args;
    case (?args) {
      switch (args.icrc1) {
        case (null) default_icrc1_args;
        case (?val) {
          {
            val with minting_account = switch (
              val.minting_account
            ) {
              case (?val) ?val;
              case (null) {
                ?{
                  owner = _owner;
                  subaccount = null;
                };
              };
            };
          };
        };
      };
    };
  };

  let icrc2_args : ICRC2.InitArgs = switch (args) {
    case (null) default_icrc2_args;
    case (?args) {
      switch (args.icrc2) {
        case (null) default_icrc2_args;
        case (?val) val;
      };
    };
  };

  let icrc3_args : ICRC3.InitArgs = switch (args) {
    case (null) default_icrc3_args;
    case (?args) {
      switch (args.icrc3) {
        case (null) default_icrc3_args;
        case (?val) ?val;
      };
    };
  };

  let icrc4_args : ICRC4.InitArgs = switch (args) {
    case (null) default_icrc4_args;
    case (?args) {
      switch (args.icrc4) {
        case (null) default_icrc4_args;
        case (?val) val;
      };
    };
  };

  stable let icrc1_migration_state = ICRC1.init(ICRC1.initialState(), #v0_1_0(#id), ?icrc1_args, _owner);
  stable let icrc2_migration_state = ICRC2.init(ICRC2.initialState(), #v0_1_0(#id), ?icrc2_args, _owner);
  stable let icrc4_migration_state = ICRC4.init(ICRC4.initialState(), #v0_1_0(#id), ?icrc4_args, _owner);
  stable let icrc3_migration_state = ICRC3.init(ICRC3.initialState(), #v0_1_0(#id), icrc3_args, _owner);
  stable let cert_store : CertTree.Store = CertTree.newStore();
  let ct = CertTree.Ops(cert_store);

  stable var owner = _owner;

  let #v0_1_0(#data(icrc1_state_current)) = icrc1_migration_state;

  private var _icrc1 : ?ICRC1.ICRC1 = null;

  private func get_icrc1_state() : ICRC1.CurrentState {
    return icrc1_state_current;
  };

  private func get_icrc1_environment() : ICRC1.Environment {
    {
      get_time = null;
      get_fee = null;
      add_ledger_transaction = ?icrc3().add_record;
      can_transfer = null; //set to a function to intercept and add validation logic for transfers
    };
  };

  func icrc1() : ICRC1.ICRC1 {
    switch (_icrc1) {
      case (null) {
        let initclass : ICRC1.ICRC1 = ICRC1.ICRC1(?icrc1_migration_state, Principal.fromActor(this), get_icrc1_environment());
        ignore initclass.register_supported_standards({
          name = "ICRC-3";
          url = "https://github.com/dfinity/ICRC/ICRCs/icrc-3/";
        });
        ignore initclass.register_supported_standards({
          name = "ICRC-10";
          url = "https://github.com/dfinity/ICRC/ICRCs/icrc-10/";
        });
        _icrc1 := ?initclass;
        initclass;
      };
      case (?val) val;
    };
  };

  let #v0_1_0(#data(icrc2_state_current)) = icrc2_migration_state;

  private var _icrc2 : ?ICRC2.ICRC2 = null;

  private func get_icrc2_state() : ICRC2.CurrentState {
    return icrc2_state_current;
  };

  private func get_icrc2_environment() : ICRC2.Environment {
    {
      icrc1 = icrc1();
      get_fee = null;
      can_approve = null; //set to a function to intercept and add validation logic for approvals
      can_transfer_from = null; //set to a function to intercept and add validation logic for transfer froms
    };
  };

  func icrc2() : ICRC2.ICRC2 {
    switch (_icrc2) {
      case (null) {
        let initclass : ICRC2.ICRC2 = ICRC2.ICRC2(?icrc2_migration_state, Principal.fromActor(this), get_icrc2_environment());
        _icrc2 := ?initclass;
        initclass;
      };
      case (?val) val;
    };
  };

  let #v0_1_0(#data(icrc4_state_current)) = icrc4_migration_state;

  private var _icrc4 : ?ICRC4.ICRC4 = null;

  private func get_icrc4_state() : ICRC4.CurrentState {
    return icrc4_state_current;
  };

  private func get_icrc4_environment() : ICRC4.Environment {
    {
      icrc1 = icrc1();
      get_fee = null;
      can_approve = null; //set to a function to intercept and add validation logic for approvals
      can_transfer_from = null; //set to a function to intercept and add validation logic for transfer froms
    };
  };

  func icrc4() : ICRC4.ICRC4 {
    switch (_icrc4) {
      case (null) {
        let initclass : ICRC4.ICRC4 = ICRC4.ICRC4(?icrc4_migration_state, Principal.fromActor(this), get_icrc4_environment());
        _icrc4 := ?initclass;
        initclass;
      };
      case (?val) val;
    };
  };

  let #v0_1_0(#data(icrc3_state_current)) = icrc3_migration_state;

  private var _icrc3 : ?ICRC3.ICRC3 = null;

  private func get_icrc3_state() : ICRC3.CurrentState {
    return icrc3_state_current;
  };

  func get_state() : ICRC3.CurrentState {
    return icrc3_state_current;
  };

  private func get_icrc3_environment() : ICRC3.Environment {
    ?{
      updated_certification = ?updated_certification;
      get_certificate_store = ?get_certificate_store;
    };
  };

  func ensure_block_types(icrc3Class : ICRC3.ICRC3) : () {
    let supportedBlocks = Buffer.fromIter<ICRC3.BlockType>(icrc3Class.supported_block_types().vals());

    let blockequal = func(a : { block_type : Text }, b : { block_type : Text }) : Bool {
      a.block_type == b.block_type;
    };

    if (Buffer.indexOf<ICRC3.BlockType>({ block_type = "1xfer"; url = "" }, supportedBlocks, blockequal) == null) {
      supportedBlocks.add({
        block_type = "1xfer";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      });
    };

    if (Buffer.indexOf<ICRC3.BlockType>({ block_type = "2xfer"; url = "" }, supportedBlocks, blockequal) == null) {
      supportedBlocks.add({
        block_type = "2xfer";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      });
    };

    if (Buffer.indexOf<ICRC3.BlockType>({ block_type = "2approve"; url = "" }, supportedBlocks, blockequal) == null) {
      supportedBlocks.add({
        block_type = "2approve";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      });
    };

    if (Buffer.indexOf<ICRC3.BlockType>({ block_type = "1mint"; url = "" }, supportedBlocks, blockequal) == null) {
      supportedBlocks.add({
        block_type = "1mint";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      });
    };

    if (Buffer.indexOf<ICRC3.BlockType>({ block_type = "1burn"; url = "" }, supportedBlocks, blockequal) == null) {
      supportedBlocks.add({
        block_type = "1burn";
        url = "https://github.com/dfinity/ICRC-1/tree/main/standards/ICRC-3";
      });
    };

    icrc3Class.update_supported_blocks(Buffer.toArray(supportedBlocks));
  };

  func icrc3() : ICRC3.ICRC3 {
    switch (_icrc3) {
      case (null) {
        let initclass : ICRC3.ICRC3 = ICRC3.ICRC3(?icrc3_migration_state, Principal.fromActor(this), get_icrc3_environment());
        _icrc3 := ?initclass;
        ensure_block_types(initclass);

        initclass;
      };
      case (?val) val;
    };
  };

  private func updated_certification(cert : Blob, lastIndex : Nat) : Bool {

    // D.print("updating the certification " # debug_show(CertifiedData.getCertificate(), ct.treeHash()));
    ct.setCertifiedData();
    // D.print("did the certification " # debug_show(CertifiedData.getCertificate()));
    return true;
  };

  private func get_certificate_store() : CertTree.Store {
    // D.print("returning cert store " # debug_show(cert_store));
    return cert_store;
  };

  /// Functions for the ICRC1 token standard
  public shared query func icrc1_name() : async Text {
    icrc1().name();
  };

  public shared query func icrc1_symbol() : async Text {
    icrc1().symbol();
  };

  public shared query func icrc1_decimals() : async Nat8 {
    icrc1().decimals();
  };

  public shared query func icrc1_fee() : async ICRC1.Balance {
    icrc1().fee();
  };

  public shared query func icrc1_metadata() : async [ICRC1.MetaDatum] {
    icrc1().metadata();
  };

  public shared query func icrc1_total_supply() : async ICRC1.Balance {
    icrc1().total_supply();
  };

  public shared query func icrc1_minting_account() : async ?ICRC1.Account {
    ?icrc1().minting_account();
  };

  public shared query func icrc1_balance_of(args : ICRC1.Account) : async ICRC1.Balance {
    icrc1().balance_of(args);
  };

  public shared query func icrc1_supported_standards() : async [ICRC1.SupportedStandard] {
    icrc1().supported_standards();
  };

  public shared query func icrc10_supported_standards() : async [ICRC1.SupportedStandard] {
    icrc1().supported_standards();
  };

  public shared ({ caller }) func icrc1_transfer(args : ICRC1.TransferArgs) : async ICRC1.TransferResult {
    switch (await* icrc1().transfer_tokens(caller, args, false, null)) {
      case (#trappable(val)) val;
      case (#awaited(val)) val;
      case (#err(#trappable(err))) D.trap(err);
      case (#err(#awaited(err))) D.trap(err);
    };
  };

  private func time64() : Nat64 {
    Nat64.fromNat(Int.abs(Time.now()));
  };

  // let ONE_DAY = 86_400_000_000_000;

  stable var lastError : (Text, Int) = ("null", 0);

  public query (msg) func getLastError() : async (Text, Int) {
    if (msg.caller != owner) {
      return ("Unauthorized", 0);
    };
    lastError;
  };

  private func refund(caller : Principal, subaccount : ?[Nat8], amount : Nat, e : Text) : async* Result.Result<(Nat, Nat), Text> {
    try {
      let result = await DKPLedger.icrc1_transfer({
        from_subaccount = null;
        fee = null;
        to = {
          owner = caller;
          subaccount = subaccount;
        };
        memo = ?Blob.toArray("\64\6b\70\20\72\65\74\75\72\6e" : Blob); //"dkp return"
        created_at_time = ?time64();
        amount = amount;
      });
    } catch (e) {
      return #err("stuck funds");
    };

    return #err("cannot transfer to minter " # e);
  };

  public shared ({ caller }) func deposit(subaccount : ?[Nat8], amount : Nat) : async Result.Result<(Nat, Nat), Text> {
    log.add(debug_show (Time.now()) # "trying deposit " # debug_show (subaccount));

    if (amount < settings.dkp_fee_d8) {
      return #err("amount too low");
    };

    let result = try {
      await DKPLedger.icrc2_transfer_from({
        to = {
          owner = Principal.fromActor(this);
          subaccount = null;
        };
        fee = null;
        spender_subaccount = null;
        from = {
          owner = caller;
          subaccount = subaccount;
        };
        memo = ?Blob.toArray("\64\6b\70\20\64\65\70\6f\73\69\74" : Blob); //"dkp deposit"
        created_at_time = ?time64();
        amount = amount;
      });
    } catch (e) {
      log.add(debug_show (Time.now()) # "trying transfer from " # Error.message(e));
      D.trap("cannot transfer from failed" # Error.message(e));
    };

    let block = switch (result) {
      case (#Ok(block)) block;
      case (#Err(err)) {
        D.trap("cannot transfer from failed" # debug_show (err));
      };
    };

    //let mintingAmount = amount;
    let mintingAmount = Int.abs(((amount - settings.dkp_swap_fee_d8) * settings.d8_to_d12) / settings.conversion_factor);

    let newtokens = await* icrc1().mint_tokens(
      icrc1().get_state().minting_account.owner,
      {
        to = {
          owner = caller;
          subaccount = switch (subaccount) {
            case (null) null;
            case (?val) ?Blob.fromArray(val);
          };
        };
        amount = mintingAmount; // The number of tokens to mint.
        created_at_time = ?time64();
        memo = ?("\44\50\57\20\4d\69\6e\74" : Blob); // DPW Mint
      },
    );

    log.add(debug_show (Time.now()) # "trying mint from mint " # debug_show (newtokens));

    let mint = switch (newtokens) {
      case (#trappable(#Ok(val))) val;
      case (#awaited(#Ok(val))) val;
      case (#trappable(#Err(err))) {
        return await* refund(caller, subaccount, amount, debug_show (err));

      };
      case (#awaited(#Err(err))) {
        return await* refund(caller, subaccount, amount, debug_show (err));
      };
      case (#err(#trappable(err))) {
        return await* refund(caller, subaccount, amount, debug_show (err));
      };
      case (#err(#awaited(err))) {
        return await* refund(caller, subaccount, amount, debug_show (err));
      };
    };

    return #ok((block, mint));
  };

  public shared ({ caller }) func withdraw(subaccount : ?[Nat8], amount : Nat) : async Result.Result<(Nat, Nat), Text> {
    log.add(debug_show (Time.now()) # "trying withdraw " # debug_show (subaccount));

    if (amount <= (settings.dpw_fee_d12 * 2)) {
      // Accounting for sending dkp to the user from this canister. We pay the fee.
      return #err("amount too low");
    };

    let burnResult = await* icrc1().burn(
      caller,
      {
        from_subaccount = switch (subaccount) {
          case (null) null;
          case (?val) ?Blob.fromArray(val);
        }; // The subaccount from which tokens are burned.
        amount = amount; // The number of tokens to burn.
        memo = ?("\44\50\57\20\57\69\74\68\64\72\61\77" : Blob); // DPW Withdraw
        created_at_time = ?time64(); // The time the burn operation was created.
      },
    );

    let parse = switch (burnResult) {
      case (#Ok(val)) val;
      case (#Err((err))) return #err(debug_show (err));
    };

    //let old_balance_d8 : T.Balance = Int.abs(old_balance_d12 / settings.d8_to_d12); // from sneed swap
    let returnAmount = Int.abs((amount - settings.dpw_fee_d12) * settings.conversion_factor / settings.d8_to_d12); // hope this work

    let result = try {
      await DKPLedger.icrc1_transfer({
        to = {
          owner = caller;
          subaccount = subaccount;
        };
        fee = null;
        from_subaccount = null;
        memo = ?Blob.toArray("\44\50\57\20\57\69\74\68\64\72\61\77"); // DPW Withdraw
        created_at_time = ?time64();
        amount = returnAmount;
      });
    } catch (e) {
      //put back

      let remintResult = await* icrc1().mint(
        caller,
        {
          to = {
            owner = caller;
            subaccount = switch (subaccount) {
              case (null) null;
              case (?val) ?Blob.fromArray(val);
            }; // The subaccount from which tokens are burned.
          };
          amount = amount; // The number of tokens to burn.
          memo = ?("\44\50\57\20\57\69\74\68\64\72\61\77" : Blob); // DPW Withdraw
          created_at_time = ?time64(); // The time the burn operation was created.
        },
      );
      log.add(debug_show (Time.now()) # "trying withdraw from " # Error.message(e));
      return #err("cannot withdraw - failed and refunded " # Error.message(e));
    };

    let block = switch (result) {
      case (#Ok(block)) block;
      case (#Err(err)) {
        let remintResult = await* icrc1().mint(
          caller,
          {
            to = {
              owner = caller;
              subaccount = switch (subaccount) {
                case (null) null;
                case (?val) ?Blob.fromArray(val);
              }; // The subaccount from which tokens are burned.
            };
            amount = amount; // The number of tokens to burn.
            memo = ?("\44\50\57\20\57\69\74\68\64\72\61\77" : Blob); // DPW Withdraw
            created_at_time = ?time64(); // The time the burn operation was created.
          },
        );
        log.add(debug_show (Time.now()) # "trying withdraw from " # debug_show (err));
        return #err("cannot withdraw - failed" # debug_show (err));
      };
    };

    return #ok((parse, block));
  };

  public type Stats = {
    totalSupply : Nat;
    holders : Nat;
  };

  public query func stats() : async Stats {
    return {
      totalSupply = icrc1().total_supply();
      holders = ICRC1.Map.size(icrc1().get_state().accounts);
    };
  };

  public query func holders(min : ?Nat, max : ?Nat, prev : ?ICRC1.Account, take : ?Nat) : async [(ICRC1.Account, Nat)] {

    let results = ICRC1.Vector.new<(ICRC1.Account, Nat)>();
    let (bFound_, targetAccount) = switch (prev) {
      case (null)(true, { owner = Principal.fromActor(this); subaccount = null });
      case (?val)(false, val);
    };

    var bFound : Bool = bFound_;

    let takeVal = switch (take) {
      case (null) 1000; //default take
      case (?val) val;
    };

    label search for (thisAccount in ICRC1.Map.entries(icrc1().get_state().accounts)) {
      if (bFound) {
        if (ICRC1.Vector.size(results) >= takeVal) {
          break search;
        };

      } else {
        if (ICRC1.account_eq(targetAccount, thisAccount.0)) {
          bFound := true;
        } else {
          continue search;
        };
      };
      let minSearch = switch (min) {
        case (null) 0;
        case (?val) val;
      };
      let maxSearch = switch (max) {
        case (null) 10_000_0000_0000_0000; //our max supply is far less than 10k
        case (?val) val;
      };
      if (thisAccount.1 >= minSearch and thisAccount.1 <= maxSearch) ICRC1.Vector.add(results, (thisAccount.0, thisAccount.1));
    };

    return ICRC1.Vector.toArray(results);
  };

  public query ({ caller }) func icrc2_allowance(args : ICRC2.AllowanceArgs) : async ICRC2.Allowance {
    return icrc2().allowance(args.spender, args.account, false);
  };

  public shared ({ caller }) func icrc2_approve(args : ICRC2.ApproveArgs) : async ICRC2.ApproveResponse {
    switch (await* icrc2().approve_transfers(caller, args, false, null)) {
      case (#trappable(val)) val;
      case (#awaited(val)) val;
      case (#err(#trappable(err))) D.trap(err);
      case (#err(#awaited(err))) D.trap(err);
    };
  };

  public shared ({ caller }) func icrc2_transfer_from(args : ICRC2.TransferFromArgs) : async ICRC2.TransferFromResponse {
    switch (await* icrc2().transfer_tokens_from(caller, args, null)) {
      case (#trappable(val)) val;
      case (#awaited(val)) val;
      case (#err(#trappable(err))) D.trap(err);
      case (#err(#awaited(err))) D.trap(err);
    };
  };

  public query func icrc3_get_blocks(args : ICRC3.GetBlocksArgs) : async ICRC3.GetBlocksResult {
    return icrc3().get_blocks(args);
  };

  public query func icrc3_get_archives(args : ICRC3.GetArchivesArgs) : async ICRC3.GetArchivesResult {
    return icrc3().get_archives(args);
  };

  public query func icrc3_get_tip_certificate() : async ?ICRC3.DataCertificate {
    return icrc3().get_tip_certificate();
  };

  public query func icrc3_supported_block_types() : async [ICRC3.BlockType] {
    return icrc3().supported_block_types();
  };

  public query func get_tip() : async ICRC3.Tip {
    return icrc3().get_tip();
  };

  public shared ({ caller }) func icrc4_transfer_batch(args : ICRC4.TransferBatchArgs) : async ICRC4.TransferBatchResults {
    switch (await* icrc4().transfer_batch_tokens(caller, args, null, null)) {
      case (#trappable(val)) val;
      case (#awaited(val)) val;
      case (#err(#trappable(err))) err;
      case (#err(#awaited(err))) err;
    };
  };

  public shared query func icrc4_balance_of_batch(request : ICRC4.BalanceQueryArgs) : async ICRC4.BalanceQueryResult {
    icrc4().balance_of_batch(request);
  };

  public shared query func icrc4_maximum_update_batch_size() : async ?Nat {
    ?icrc4().get_state().ledger_info.max_transfers;
  };

  public shared query func icrc4_maximum_query_batch_size() : async ?Nat {
    ?icrc4().get_state().ledger_info.max_balances;
  };

  public shared ({ caller }) func admin_update_owner(new_owner : Principal) : async Bool {
    if (caller != owner) { D.trap("Unauthorized") };
    owner := new_owner;
    return true;
  };

  public shared ({ caller }) func admin_update_icrc1(requests : [ICRC1.UpdateLedgerInfoRequest]) : async [Bool] {
    if (caller != owner) { D.trap("Unauthorized") };
    return icrc1().update_ledger_info(requests);
  };

  public shared ({ caller }) func admin_update_icrc2(requests : [ICRC2.UpdateLedgerInfoRequest]) : async [Bool] {
    if (caller != owner) { D.trap("Unauthorized") };
    return icrc2().update_ledger_info(requests);
  };

  public shared ({ caller }) func admin_update_icrc4(requests : [ICRC4.UpdateLedgerInfoRequest]) : async [Bool] {
    if (caller != owner) { D.trap("Unauthorized") };
    return icrc4().update_ledger_info(requests);
  };

  /* /// Uncomment this code to establish have icrc1 notify you when a transaction has occured.
  private func transfer_listener(trx: ICRC1.Transaction, trxid: Nat) : () {

  };

  /// Uncomment this code to establish have icrc1 notify you when a transaction has occured.
  private func approval_listener(trx: ICRC2.TokenApprovalNotification, trxid: Nat) : () {

  };

  /// Uncomment this code to establish have icrc1 notify you when a transaction has occured.
  private func transfer_from_listener(trx: ICRC2.TransferFromNotification, trxid: Nat) : () {

  }; */

  // private stable var _init = false;
  // public shared(msg) func admin_init() : async () {
  //   //can only be called once

  //   if(_init == false){
  //     //ensure metadata has been registered
  //     let test1 = icrc1().metadata();
  //     let test2 = icrc2().metadata();
  //     let test4 = icrc4().metadata();
  //     let test3 = icrc3().stats();

  //     //uncomment the following line to register the transfer_listener
  //     //icrc1().register_token_transferred_listener("my_namespace", transfer_listener);

  //     //uncomment the following line to register the transfer_listener
  //     //icrc2().register_token_approved_listener("my_namespace", approval_listener);

  //     //uncomment the following line to register the transfer_listener
  //     //icrc1().register_transfer_from_listener("my_namespace", transfer_from_listener);
  //   };
  //   _init := true;
  // };

  let log = Buffer.Buffer<Text>(1);

  public shared (msg) func clearLog() : async () {
    if (msg.caller != owner) {
      D.trap("Unauthorized");
    };
    log.clear();
  };

  public query (msg) func get_log() : async [Text] {
    Buffer.toArray(log);
  };

  // Deposit cycles into this canister.
  public shared func deposit_cycles() : async () {
    let amount = ExperimentalCycles.available();
    let accepted = ExperimentalCycles.accept<system>(amount);
    assert (accepted == amount);
  };

  public shared (msg) func init() : async () {
    if (Principal.fromActor(this) != msg.caller) {
      D.trap("Only the canister can initialize the canister");
    };
    log.add(debug_show (Time.now()) # "In init ");
    ignore icrc1().metadata();
    ignore icrc2().metadata();
    ignore icrc3().stats();
    ignore icrc4().metadata();
  };

  ignore Timer.setTimer<system>(
    #nanoseconds(0),
    func() : async () {
      let selfActor : actor {
        init : shared () -> async ();
      } = actor (Principal.toText(Principal.fromActor(this)));
      await selfActor.init();
    },
  );

  system func preupgrade() {
    stable_winners := winners;
  };

  system func postupgrade() {
    ignore icrc1().init_metadata();
    winners := stable_winners;
  };

  stable var stable_winners : [Principal] = [];

  var winners : [Principal] = [];

  public shared (msg) func setGameCompleted() : async () {
    if (msg.caller == Principal.fromText("2vxsx-fae")) return;

    let found : ?Principal = Array.find<Principal>(
      winners,
      func(p : Principal) : Bool {
        return p == msg.caller;
      },
    );

    if (found == null) {
      // Add caller to winners if not already present
      winners := Array.append<Principal>(winners, [msg.caller]);
    };
  };

  // public func deleteWinners() : async () {
  //   winners := [];
  // };

  public query func didPrincipalWin(principal : Principal) : async Bool {
    let found : ?Principal = Array.find<Principal>(
      winners,
      func(p : Principal) : Bool {
        return p == principal;
      },
    );
    return found != null;
  };

  //re wire up the listener after upgrade
  //uncomment the following line to register the transfer_listener
  //icrc1().register_token_transferred_listener("bobminter", transfer_listener);

  //uncomment the following line to register the transfer_listener
  //icrc2().register_token_approved_listener("my_namespace", approval_listener);

  //uncomment the following line to register the transfer_listener
  //icrc1().register_transfer_from_listener("my_namespace", transfer_from_listener);
};
