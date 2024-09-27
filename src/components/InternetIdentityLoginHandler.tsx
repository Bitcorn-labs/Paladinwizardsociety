import { idlFactory as reBobFactory } from '../declarations/backend';
import { _SERVICE as reBobService } from '../declarations/service_hack/service'; // changed to service.d because dfx generate would remove the export line from index.d
import { idlFactory as icpFactory } from '../declarations/nns-ledger';
import { _SERVICE as bobService } from '../declarations/nns-ledger/index.d';
import { useEffect, useRef, useState } from 'react';
import { AuthClient } from '@dfinity/auth-client';
import { HttpAgent, Actor, AnonymousIdentity } from '@dfinity/agent';

interface InternetIdentityLoginHandlerProps {
  bobCanisterID: string;
  setBobLedgerActor: (value: bobService | null) => void;
  reBobCanisterID: string;
  setreBobActor: (value: reBobService | null) => void;
  loading: boolean;
  setLoading: (value: boolean) => void;
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
  connectionType: string;
  setConnectionType: (value: string) => void;
  loggedInPrincipal: string;
  setLoggedInPrincipal: (value: string) => void;
}

const InternetIdentityLoginHandler: React.FC<
  InternetIdentityLoginHandlerProps
> = ({
  bobCanisterID,
  setBobLedgerActor,
  reBobCanisterID,
  setreBobActor,
  loading,
  setLoading,
  isConnected,
  setIsConnected,
  connectionType,
  setConnectionType,
  loggedInPrincipal,
  setLoggedInPrincipal,
}) => {
  // const [loggedInPrincipal, setLoggedInPrincipal] = useState('');
  const authClientRef = useRef<AuthClient | null>(null);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const identityProvider =
    window.location.href.includes('localhost') ||
    window.location.href.includes('127.0.0.1')
      ? 'http://bw4dl-smaaa-aaaaa-qaacq-cai.localhost:4943'
      : 'https://identity.ic0.app/';

  const createAuthClient = async (): Promise<void> => {
    setAuthClient(await AuthClient.create()); // Does this even need to be async?
  };

  const authClientLogin = async () => {
    if (!authClient) return;

    return new Promise<void>((resolve, reject) => {
      authClient.login({
        identityProvider,
        onSuccess: () => {
          setIsConnected(true); // Set authentication state to true
          setConnectionType('ii');
          resolve(); // Resolve the promise on success
        },
        onError: (error) => {
          console.error('Login failed:', error);
          reject(error); // Reject the promise on error
        },
      });
    });
  };

  const login = async () => {
    await authClientLogin();

    if (!authClient) return;

    const identity = await authClient.getIdentity();

    //console.log(identity.getPrincipal().toString());
    setLoggedInPrincipal(identity.getPrincipal().toString());
    setIsConnected(true);
    setConnectionType('ii');
    await createAgent();
  };

  useEffect(() => {
    login();
  }, [authClient]);

  const logout = async () => {
    // if (!isAuthenticated) {
    //   console.log("not logged in");
    // }
    if (!authClient) return;
    if (authClient) {
      await authClient.logout();
      setIsConnected(false);
      setConnectionType('');
      setLoggedInPrincipal('');
      setAuthClient(null);
      setreBobActor(null);
      setBobLedgerActor(null);
    }
  };

  const [myAgent, setMyAgent] = useState<reBobService | null>(null);

  const createAgent = async () => {
    if (!authClient) {
      console.log('authClientRef was null in createAgent()');
      return;
    }
    const identity = authClient.getIdentity();

    const agent = new HttpAgent({
      host:
        window.location.href.includes('localhost') ||
        window.location.href.includes('127.0.0.1')
          ? 'http://localhost:4943'
          : 'https://ic0.app/',
      identity: identity,
    });

    if (
      window.location.href.includes('localhost') ||
      window.location.href.includes('127.0.0.1')
    ) {
      agent.fetchRootKey();
    }

    setreBobActor(
      await Actor.createActor(reBobFactory, {
        agent,
        canisterId: reBobCanisterID,
      })
    );

    setBobLedgerActor(
      await Actor.createActor(icpFactory, {
        agent,
        canisterId: bobCanisterID,
      })
    );
  };

  const setupInternetIdentity = async () => {
    await createAuthClient();
  };

  const handleInternetIdentityLogin = () => {
    setupInternetIdentity();
  };

  return (
    <div>
      {!isConnected ? (
        <>
          <button onClick={handleInternetIdentityLogin}>
            Login with Internet Identity
          </button>
        </>
      ) : connectionType === 'ii' ? (
        <>
          <p>
            Your Internet Identity Principal is <br />
            {loggedInPrincipal}
          </p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <></>
      )}
    </div>
  );
};

export default InternetIdentityLoginHandler;
