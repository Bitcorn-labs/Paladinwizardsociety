import { useEffect, useState } from 'react';
import { idlFactory as reBobFactory } from '../declarations/backend';
import { _SERVICE as reBobService } from '../declarations/service_hack/service'; // changed to service.d because dfx generate would remove the export line from index.d
import { idlFactory as icpFactory } from '../declarations/nns-ledger';
import { _SERVICE as bobService } from '../declarations/nns-ledger/index.d';

interface PlugLoginHandlerProps {
  bobCanisterID: string;
  setBobLedgerActor: (value: bobService) => void;
  reBobCanisterID: string;
  setreBobActor: (value: reBobService) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  plugIsConnected: boolean;
  setPlugIsConnected: (value: boolean) => void;
}

const PlugLoginHandler: React.FC<PlugLoginHandlerProps> = ({
  bobCanisterID,
  setBobLedgerActor,
  reBobCanisterID,
  setreBobActor,
  loading,
  setLoading,
  plugIsConnected,
  setPlugIsConnected,
}) => {
  //const [isConnected, setIsConnected] = useState(false);
  const [yourPrincipal, setYourPrincipal] = useState<string>('null');

  const checkLoggedIn = async () => {
    await setPlugIsConnected(!!(await window.ic.plug.isConnected()));
  };

  useEffect(() => {
    // This code runs after `icpActor` and `icdvActor` have been updated.
    if (plugIsConnected) {
      fetchPrincipal();
      // Ensure fetchBalances is defined and correctly handles asynchronous operations
      setUpActors();
    }

    console.log('isConnected', plugIsConnected);

    // Note: If `fetchBalances` depends on `icpActor` or `icdvActor`, you should ensure it's capable of handling null values or wait until these values are not null.
  }, [plugIsConnected]);

  const fetchPrincipal = async () => {
    if (!(await window.ic.plug.agent)) return;
    setYourPrincipal((await window.ic.plug.agent.getPrincipal()).toString());
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
  };

  const handleLogout = async () => {
    setLoading(true);

    if (plugIsConnected) {
      try {
        await window.ic.plug.disconnect();
        setPlugIsConnected(false);
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
            await setPlugIsConnected(!!(await window.ic.plug.isConnected()));
          },
        });
        if (
          window.location.href.includes('localhost') ||
          window.location.href.includes('127.0.0.1')
        ) {
          await window.ic.plug.sessionManager.sessionData.agent.agent.fetchRootKey();
        }
        console.log('Connected with pubkey:', pubkey);
        await setPlugIsConnected(true);
      } else {
        if (
          window.location.href.includes('localhost') ||
          window.location.href.includes('127.0.0.1')
        ) {
          await window.ic.plug.sessionManager.sessionData.agent.agent.fetchRootKey();
        }
        setPlugIsConnected(true);
      }
    } catch (error) {
      console.error('Login failed:', error);
      setPlugIsConnected(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkLoggedIn();
  }, []);

  return (
    <div>
      {!plugIsConnected ? (
        <div className="card">
          <button onClick={handleLogin} disabled={loading}>
            Login with Plug
          </button>
        </div>
      ) : (
        <>
          <p>
            Your plug principal is
            <br />
            {yourPrincipal}
          </p>
          <button onClick={handleLogout} disabled={loading}>
            Logout
          </button>
        </>
      )}
    </div>
  );
};

export default PlugLoginHandler;
