import './App.css';
import React, { useState, useEffect, ReactElement, useRef } from 'react';
import motokoLogo from './assets/motoko_moving.png';
import motokoShadowLogo from './assets/motoko_shadow.png';
import reactLogo from './assets/bob.png';
import viteLogo from './assets/corn.png';
// import { useQueryCall, useUpdateCall } from '@ic-reactor/react';
import { Principal } from '@dfinity/principal';
// import {Agent, Actor, HttpAgent} from '@dfinity/agent';
import ic from 'ic0';

import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor, AnonymousIdentity } from '@dfinity/agent';

import { idlFactory as icpFactory } from './declarations/nns-ledger';
import { _SERVICE as bobService } from './declarations/nns-ledger/index.d';

import { idlFactory as reBobFactory } from './declarations/backend';
import { _SERVICE as reBobService } from './declarations/service_hack/service'; // changed to service.d because dfx generate would remove the export line from index.d
import { Stats } from './declarations/backend/backend.did.d';
import { CircularProgress, TextField } from '@mui/material';
import ReBobMintingField from './components/ReBobMintingField';
import ShowTransactionStatus from './components/ShowTransactionStatus';
import BobWithdrawField from './components/BobWithdrawField';

import bigintToFloatString from './bigIntToFloatString';

const bobCanisterID =
  window.location.href.includes('localhost') ||
  window.location.href.includes('127.0.0.1')
    ? 'bd3sg-teaaa-aaaaa-qaaba-cai'
    : '7pail-xaaaa-aaaas-aabmq-cai';
const reBobCanisterID =
  window.location.href.includes('localhost') ||
  window.location.href.includes('127.0.0.1')
    ? 'bkyz2-fmaaa-aaaaa-qaaaq-cai'
    : 'qvwlv-uyaaa-aaaas-aidpq-cai';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  // const [icpBalance, setIcpBalance] = useState<bigint>(0n);
  const [bobLedgerBalance, setBobLedgerBalance] = useState<bigint>(0n);
  const [reBobLedgerBalance, setreBobLedgerBalance] = useState<bigint>(0n);

  const [bobLedgerAllowance, setBobLedgerAllowance] = useState<bigint>(0n);
  const [reBobLedgerAllowance, setReBobLedgerAllowance] = useState<bigint>(0n);

  const [share, setShare] = useState<bigint>(0n);
  const [stats, setStats] = useState<Stats | null>(null);

  const [reBobActor, setreBobActor] = useState<reBobService | null>(null);
  const [reBobActorTemp, setreBobActorTemp] = useState<reBobService | null>(
    null
  );
  const [bobLedgerActor, setBobLedgerActor] = useState<bobService | null>(null);
  const [yourPrincipal, setYourPrincipal] = useState<string>('null');

  const [totalBobHeld, setTotalBobHeld] = useState<string>('');
  const [totalReBobMinted, setTotalReBobMinted] = useState<string>('');

  const actorRef = useRef(null);
  const authClientRef = useRef<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loggedInPrincipal, setLoggedInPrincipal] = useState('');

  const bobFee: bigint = 1_000_000n;
  const reBobFee: bigint = 10_000n;

  const checkLoggedIn = async () => {
    await setIsConnected(!!(await window.ic.plug.isConnected()));
  };

  const login = async (): Promise<void> => {
    // Create AuthClient instance
    authClientRef.current = await AuthClient.create();

    // Check if authClientRef was set correctly
    if (!authClientRef.current) {
      console.error('AuthClient could not be created.');
      return;
    }

    // Use the non-null assertion to ensure TypeScript knows it isn't null
    return new Promise((resolve, reject) => {
      authClientRef.current!.login({
        identityProvider:
          //'http://localhost:4943/?canisterId=bw4dl-smaaa-aaaaa-qaacq-cai', //'https://identity.ic0.app/#authorize',
          'http://bw4dl-smaaa-aaaaa-qaacq-cai.localhost:4943',
        //http://r7inp-6aaaa-aaaaa-aaabq-cai.127.0.0.1:4943?#authorize
        onSuccess: () => {
          setIsAuthenticated(true); // Set authentication state to true
          resolve(); // Resolve the promise on success
        },
        onError: (error) => {
          console.error('Login failed:', error);
          reject(error); // Reject the promise on error
        },
      });
    });
  };

  const logout = async () => {
    // if (!isAuthenticated) {
    //   console.log("not logged in");
    // }
    if (authClientRef.current) {
      await authClientRef.current.logout();
      setIsAuthenticated(false);
      //console.log("logged out");
      setLoggedInPrincipal('');
    }
  };

  const createAgent = async () => {
    if (!authClientRef.current) {
      console.log('authClientRef was null in createAgent()');
      return;
    }
    const identity = authClientRef.current.getIdentity();

    const agent = await new HttpAgent({ identity });

    actorRef.current = Actor.createActor(reBobFactory, {
      agent,
      canisterId: reBobCanisterID,
    });

    //console.log("actor created");
  };

  const setupInternetIdentity = async () => {
    await login();

    await createAgent();

    if (!actorRef.current) {
      console.log("couldn't setup the internet identity actor!");
      return;
    }

    if (!authClientRef.current) {
      console.log(
        "couldn't setup the authClientRef during internet identity setup"
      );
      return;
    }

    //console.log("attempting to print principal");
    //const principal = await actorRef.current.whoami();
    // setLoggedInPrincipal(principal.toString());
    const identity = authClientRef.current.getIdentity();

    console.log(identity.getPrincipal().toString());
    setLoggedInPrincipal(identity.getPrincipal().toString());

    //console.log(principal.toString());
  };

  const handleInternetIdentityLogin = () => {
    setupInternetIdentity();
  };

  const fetchTotalTokens = async () => {
    // const totalBobHeldResponse = await bobLedgerActor.icrc1_balance_of({
    //   owner: Principal.fromText(reBobCanisterID),
    //   subaccount: [],
    // }); // Can't use plug actors as anonymous.

    // We will use the internet identity anonymous calls in the next update. ic0 will work for now.
    const bobIcActor = await ic('7pail-xaaaa-aaaas-aabmq-cai'); // hard coding this because it will work in local still.

    const totalBobHeldResponse = await bobIcActor.call('icrc1_balance_of', {
      owner: Principal.fromText('qvwlv-uyaaa-aaaas-aidpq-cai'), // hard coding this because it won't work with local of reBobCanisterID
      subaccount: [],
    });

    //const totalReBobMintedResponse = await reBobActor.icrc1_total_supply();

    setTotalBobHeld(bigintToFloatString(totalBobHeldResponse, 8));
    //setTotalReBobMinted(bigintToFloatString(totalReBobMintedResponse));
  };

  const cleanUp = () => {
    setLoading(false);
    if (bobLedgerActor && reBobActor) {
      fetchBalances();
      fetchStats();
    } else {
      console.error('Actors were not loaded when trying to cleanup!');
    }
  };

  useEffect(() => {
    console.log('Component mounted, waiting for user to log in...');
    fetchTotalTokens();
    checkLoggedIn();

    //setUpActors(); // can't use plug actors as anonymous?
    //console.log("first time", isConnected);
    //checkConnection();
  }, []); // Dependency array remains empty if you only want this effect to run once on component mount

  useEffect(() => {
    // This code runs after `icpActor` and `icdvActor` have been updated.
    console.log('actors updated', bobLedgerActor, reBobActor);

    fetchBalances();
    //fetchMinters();
    // Note: If `fetchBalances` depends on `icpActor` or `icdvActor`, you should ensure it's capable of handling null values or wait until these values are not null.
  }, [bobLedgerActor, reBobActor]);

  useEffect(() => {
    // This code runs after `icpActor` and `icdvActor` have been updated.
    //console.log("actors updated", icpActor, bobActor, bobLedgerActor, reBobActor);

    fetchStats();
    //fetchMinters();
    // Note: If `fetchBalances` depends on `icpActor` or `icdvActor`, you should ensure it's capable of handling null values or wait until these values are not null.
  }, [reBobActorTemp]);

  useEffect(() => {
    // This code runs after `icpActor` and `icdvActor` have been updated.
    if (isConnected) {
      fetchPrincipal();
      // Ensure fetchBalances is defined and correctly handles asynchronous operations
      setUpActors();
    }

    console.log('isConnected', isConnected);

    // Note: If `fetchBalances` depends on `icpActor` or `icdvActor`, you should ensure it's capable of handling null values or wait until these values are not null.
  }, [isConnected]);

  const fetchPrincipal = async () => {
    if (!(await window.ic.plug.agent)) return;
    setYourPrincipal((await window.ic.plug.agent.getPrincipal()).toString());
  };

  const fetchStats = async () => {
    if (reBobActorTemp != null) {
      const stats = await reBobActorTemp.stats();
      console.log({ stats });
      await setStats(stats);
    }
  };

  const setUpActors = async () => {
    console.log('Setting up actors...', bobCanisterID, reBobCanisterID);

    const getreBobActor = await window.ic.plug.createActor({
      canisterId: reBobCanisterID,
      interfaceFactory: reBobFactory,
    });

    await setreBobActor(getreBobActor);

    await setBobLedgerActor(
      await window.ic.plug.createActor({
        canisterId: bobCanisterID,
        interfaceFactory: icpFactory,
      })
    );

    console.log('actors', bobLedgerActor);
  };

  const getBobLedgerBalance = async () => {
    if (bobLedgerActor === null) return;

    const bobLedgerBalanceResponse = await bobLedgerActor.icrc1_balance_of({
      owner: await window.ic.plug.agent.getPrincipal(),
      subaccount: [],
    });

    console.log('Fetching balances...', { bobLedgerBalanceResponse });

    setBobLedgerBalance(bobLedgerBalanceResponse);
  };

  const getReBobLedgerBalance = async () => {
    if (reBobActor === null) return;
    const reBobLedgerBalanceResponse = await reBobActor.icrc1_balance_of({
      owner: await window.ic.plug.agent.getPrincipal(),
      subaccount: [],
    });

    setreBobLedgerBalance(reBobLedgerBalanceResponse);

    console.log('Fetching balances...', { reBobLedgerBalanceResponse });
  };

  const getBobLedgerAllowance = async () => {
    if (bobLedgerActor === null) return;
    const bobLedgerAllowanceResponse = await bobLedgerActor.icrc2_allowance({
      account: {
        owner: await window.ic.plug.agent.getPrincipal(),
        subaccount: [],
      },
      spender: { owner: Principal.fromText(reBobCanisterID), subaccount: [] },
    });

    setBobLedgerAllowance(bobLedgerAllowanceResponse.allowance);

    console.log(
      'Fetching balances... (bobLedgerAllowanceResponse)',
      bobLedgerAllowanceResponse.allowance
    ); // Need to add check if response was good.
  };

  const getReBobLedgerAllowance = async () => {
    if (reBobActor === null) return;
    const reBobLedgerAllowanceResponse = await reBobActor.icrc2_allowance({
      account: {
        owner: await window.ic.plug.agent.getPrincipal(),
        subaccount: [],
      },
      spender: { owner: Principal.fromText(reBobCanisterID), subaccount: [] },
    });

    setReBobLedgerAllowance(reBobLedgerAllowanceResponse.allowance); // Need to add check if response was good.

    console.log(
      'Fetching balances... (reBobLedgerAllowanceResponse)',
      reBobLedgerAllowanceResponse.allowance
    );
  };

  const fetchBalances = async () => {
    //
    // You'd need to replace this with actual logic to instantiate your actors and fetch balances
    // This is a placeholder for actor creation and balance fetching

    fetchTotalTokens();

    if (!isConnected) return;

    console.log('Fetching balances...', bobLedgerActor, reBobActor);
    if (bobLedgerActor === null || reBobActor === null) return;
    // Fetch balances (assuming these functions return balances in a suitable format)

    getBobLedgerBalance();
    getReBobLedgerBalance();
    getBobLedgerAllowance();
    getReBobLedgerAllowance();
  };

  const handleLogout = async () => {
    setLoading(true);

    if (isConnected) {
      try {
        await window.ic.plug.disconnect();
        setIsConnected(false);
      } catch (error) {
        console.error('Logout failed:', error);
      }
    }
    setLoading(false);
  };

  const handleLogin = async () => {
    handleLogout();
    setLoading(true);
    try {
      const connected = await window.ic.plug.isConnected();
      if (!connected) {
        const pubkey = await window.ic.plug.requestConnect({
          // whitelist, host, and onConnectionUpdate need to be defined or imported appropriately
          whitelist: [bobCanisterID, reBobCanisterID],
          host:
            window.location.href.includes('localhost') ||
            window.location.href.includes('127.0.0.1')
              ? 'http://127.0.0.1:4943'
              : 'https://ic0.app',
          onConnectionUpdate: async () => {
            console.log(
              'Connection updated',
              await window.ic.plug.isConnected()
            );
            await setIsConnected(!!(await window.ic.plug.isConnected()));
          },
        });
        if (
          window.location.href.includes('localhost') ||
          window.location.href.includes('127.0.0.1')
        ) {
          await window.ic.plug.sessionManager.sessionData.agent.agent.fetchRootKey();
        }
        console.log('Connected with pubkey:', pubkey);
        await setIsConnected(true);
      } else {
        if (
          window.location.href.includes('localhost') ||
          window.location.href.includes('127.0.0.1')
        ) {
          await window.ic.plug.sessionManager.sessionData.agent.agent.fetchRootKey();
        }
        setIsConnected(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFailedWithdraw = async () => {
    setLoading(true);

    //bobWithdraw(reBobLedgerAllowance);

    setLoading(false);
  };

  const handleFailedMint = async () => {
    setLoading(true);

    //bobDeposit(bobLedgerAllowance);

    setLoading(false);
  };

  return (
    <div className="App">
      <div>
        <a href="https://aalgg-jaaaa-aaaak-afkwq-cai.icp0.io/" target="_blank">
          <img src={viteLogo} className="logo vite" alt="Vite logo" />
        </a>
        <a href="https://bob.fun" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
        <a href="https://proposals.networks/" target="_blank">
          <span className="logo-stack">
            <img
              src={motokoShadowLogo}
              className="logo motoko-shadow"
              alt="Motoko logo"
            />
            <img src={motokoLogo} className="logo motoko" alt="Motoko logo" />
          </span>
        </a>
      </div>
      <div>
        <h1>BOB reHASH dapp</h1>
        <h2>Enlarge your Bob</h2>
        <h3>
          Total Bob hashed:{' '}
          {totalBobHeld !== '' ? (
            <>{totalBobHeld} Bob</>
          ) : (
            <>
              <CircularProgress size={16} />
            </>
          )}{' '}
        </h3>
      </div>

      {!isConnected ? (
        <>
          <div className="card">
            <button onClick={handleLogin} disabled={loading}>
              Login with Plug
            </button>
          </div>
          <div>
            <button
              onClick={() => {
                handleInternetIdentityLogin();
              }}
            >
              Login with II
            </button>
          </div>
        </>
      ) : (
        <>
          <p>
            Your principal is
            <br />
            {yourPrincipal}
          </p>
          <button onClick={handleLogout} disabled={loading}>
            Logout
          </button>

          <div
            style={{
              marginTop: '16px',
              flexDirection: 'column',
              display: 'flex',
              alignItems: 'center',
              minWidth: '250px',
              width: 'fit-content', // I can't get it to stop expanding and contracting.
            }}
            className="card"
          >
            <div
              style={{
                border: '3px solid lightgrey',
                padding: '10px',
                width: '100%',
              }}
            >
              <h2>reHASH Bobs:</h2>
              <h3>$Bob Balance: {bigintToFloatString(bobLedgerBalance)}</h3>
              <ReBobMintingField
                loading={loading}
                setLoading={setLoading}
                bobLedgerBalance={bobLedgerBalance}
                bobFee={bobFee}
                isConnected={isConnected}
                reBobCanisterID={reBobCanisterID}
                bobLedgerActor={bobLedgerActor}
                cleanUp={cleanUp}
                reBobActor={reBobActor}
                minimumTransactionAmount={3000000n}
              />

              <p></p>
            </div>
            <div
              style={{
                border: '3px solid lightgrey',
                padding: '10px',
                width: '100%',
                marginTop: '16px',
              }}
            >
              <h2>unHASH reBobs: </h2>
              <h3>
                $reBob Balance: {bigintToFloatString(reBobLedgerBalance, 6)}
              </h3>
              <BobWithdrawField
                loading={loading}
                setLoading={setLoading}
                reBobLedgerBalance={reBobLedgerBalance}
                reBobFee={reBobFee}
                bobFee={bobFee}
                isConnected={isConnected}
                reBobActor={reBobActor}
                reBobCanisterID={reBobCanisterID}
                cleanUp={cleanUp}
              />
            </div>
          </div>
        </>
      )}
      <p className="read-the-docs">
        Bitcorn Labs presents: build on bob Bob Click logos to learn more.
      </p>
    </div>
  );
}

export default App;
