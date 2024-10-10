import { RefObject } from 'react';
import TokenObject from '../TokenObject';
import InternetIdentityLoginHandler from './InternetIdentityLoginHandler';
import PlugLoginHandler from './PlugLoginHandler';
import paladin from '../assets/Paladin.jpg';
import borovan from '../assets/Borovan.jpg';
import wizard from '../assets/Priests.jpg';
import egg from '../assets/Eggs.jpg';

interface HeaderProps {
  inputTokenObject: TokenObject;
  outputTokenObject: TokenObject;
  loading: boolean;
  setLoading: (value: boolean) => void;
  isConnected: boolean;
  setIsConnected: (value: boolean) => void;
  connectionType: string;
  setConnectionType: (value: string) => void;
  loggedInPrincipal: string;
  setLoggedInPrincipal: (value: string) => void;
  gameCompleted: boolean;
  loginSection: RefObject<HTMLDivElement>;
}
const Header: React.FC<HeaderProps> = ({
  inputTokenObject,
  outputTokenObject,
  loading,
  setLoading,
  isConnected,
  setIsConnected,
  connectionType,
  setConnectionType,
  loggedInPrincipal,
  setLoggedInPrincipal,
  gameCompleted,
  loginSection,
}) => {
  return (
    <div style={{ marginBottom: '16px' }}>
      <header>
        <h1>DRAGGIN KARMA POINTS</h1>
        <h1>Paladin Wizard Society</h1>
        <h2>
          Use your karma points to unleash your inner Dragon Paladin Wizard
        </h2>
      </header>
      <div className="container">
        <div className="image-box">
          <img src={paladin} alt="Paladin" />
          <p>Brave Paladin</p>
        </div>
        <div className="image-box">
          <img src={borovan} alt="Dragon" />
          <p>Dragon king</p>
        </div>
        <div className="image-box">
          <img src={wizard} alt="Wizard" />
          <p>protect your eggs</p>
        </div>
        <div className="image-box">
          <img src={egg} alt="Egg" />
          <p>draggin karma eggs</p>
        </div>
      </div>
      <div ref={loginSection} className="banner">
        Dragon Paladin Wizards
      </div>
      <h2>{gameCompleted ? 'Greetings Champion' : <></>}</h2>
      <PlugLoginHandler
        tokens={[inputTokenObject, outputTokenObject]}
        loading={loading}
        setLoading={setLoading}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        connectionType={connectionType}
        setConnectionType={setConnectionType}
        loggedInPrincipal={loggedInPrincipal}
        setLoggedInPrincipal={setLoggedInPrincipal}
      />
      <InternetIdentityLoginHandler
        tokens={[inputTokenObject, outputTokenObject]}
        loading={loading}
        setLoading={setLoading}
        isConnected={isConnected}
        setIsConnected={setIsConnected}
        connectionType={connectionType}
        setConnectionType={setConnectionType}
        loggedInPrincipal={loggedInPrincipal}
        setLoggedInPrincipal={setLoggedInPrincipal}
      />
    </div>
  );
};

export default Header;
