import React, { useEffect, useRef, useState } from 'react';
import styles from './game.module.css';
import Game from './Game';
import { Link } from 'react-router-dom';
import jordan from '../assets/game-assets/characters/character1.png';
import herbalist from '../assets/game-assets/characters/character2.png';
import afat from '../assets/game-assets/characters/character3.png';
import asdad from '../assets/game-assets/characters/character4.png';
import corntoshi from '../assets/game-assets/characters/character5.png';
import contractor33 from '../assets/game-assets/characters/character6.png';
import borovan from '../assets/game-assets/characters/character7.png';
import smugandcomfy from '../assets/game-assets/characters/character8.png';
import drogo from '../assets/game-assets/characters/character9.png';
import edigo from '../assets/game-assets/characters/character10.png';
import hood from '../assets/game-assets/characters/character11.png';
import infu from '../assets/game-assets/characters/character12.png';
import hamish from '../assets/game-assets/characters/character13.png';
import stipe from '../assets/game-assets/characters/character14.png';
import trickyvic from '../assets/game-assets/characters/character15.png';
import bongwolke from '../assets/game-assets/characters/character16.png';
import vmr from '../assets/game-assets/characters/character17.png';
import summonsterium from '../assets/game-assets/characters/character18.png';
import spellkaster from '../assets/game-assets/characters/character19.png';
import biketaco from '../assets/game-assets/characters/character20.png';
import medium from '../assets/game-assets/characters/character21.png';
import thyssa from '../assets/game-assets/characters/character22.png';
import big from '../assets/game-assets/characters/character23.png';
import lordhoochie from '../assets/game-assets/characters/character24.png';
import realmikejones from '../assets/game-assets/characters/character25.png';
import snassy from '../assets/game-assets/characters/character26.png';
import jogu from '../assets/game-assets/characters/character27.png';
import ysmys from '../assets/game-assets/characters/character28.png';
import JR from '../assets/game-assets/characters/character29.png';
import passionplanet from '../assets/game-assets/characters/character30.png';
import those from '../assets/game-assets/characters/character31.png';

interface CharacterSelectionProps {
  gameCompleted: boolean;
  setGameCompleted: (value: boolean) => void;
  isConnected: boolean;
  handleScrollToLogin: () => void;
}

const CharacterSelection: React.FC<CharacterSelectionProps> = ({
  gameCompleted,
  setGameCompleted,
  isConnected,
  handleScrollToLogin,
}) => {
  // Converted DOM element handling to state or refs in React
  const [profilePicture, setProfilePicture] = useState<string>(those);
  const [selectedCharacter, setSelectedCharacter] = useState<number | null>(
    null
  ); // State to manage selected character test
  const [showModal, setShowModal] = useState<boolean>(true);
  const [showStartGameButton, setShowStartGameButton] =
    useState<boolean>(false);
  const [characterName, setCharacterName] = useState<string>('Paladin Wizard'); // State for character name
  const characterNames = [
    { name: 'Jordan', asset: jordan },
    { name: '420herbalist', asset: herbalist },
    { name: 'afat', asset: afat },
    { name: 'asdad', asset: asdad },
    { name: 'corntoshi', asset: corntoshi },
    { name: 'contractor33', asset: contractor33 },
    { name: 'borovan', asset: borovan },
    { name: 'smugandcomfy', asset: smugandcomfy },
    { name: 'drogo', asset: drogo },
    { name: 'edigo', asset: edigo },
    { name: 'hood', asset: hood },
    { name: 'infu', asset: infu },
    { name: 'hamish', asset: hamish },
    { name: 'stipe', asset: stipe },
    { name: 'trickyvic', asset: trickyvic },
    { name: 'bongwolke', asset: bongwolke },
    { name: 'vmr', asset: vmr },
    { name: 'summonsterium', asset: summonsterium },
    { name: 'spellkaster', asset: spellkaster },
    { name: 'biketaco', asset: biketaco },
    { name: 'medium rare', asset: medium },
    { name: 'thyssa', asset: thyssa },
    { name: 'big v', asset: big },
    { name: 'lordhoochie', asset: lordhoochie },
    { name: 'realmikejones', asset: realmikejones },
    { name: 'snassy', asset: snassy },
    { name: 'jogu', asset: jogu },
    { name: 'ysmys', asset: ysmys },
    { name: 'JR', asset: JR },
    { name: 'passionplanet', asset: passionplanet },
    { name: 'those forgotten', asset: those },
  ];

  const [showGame, setShowGame] = useState<boolean>(false); // Control to show/hide game content

  const totalCharacters = characterNames.length;

  const startGameSection = useRef<HTMLDivElement | null>(null);
  const topSection = useRef<HTMLDivElement | null>(null);

  // Function to handle character selection
  const selectCharacter = (characterIndex: number) => {
    setSelectedCharacter(characterIndex);
    setCharacterName(characterNames[characterIndex - 1].name);
    setProfilePicture(characterNames[characterIndex].asset);
  };

  const handleConfirmCharacter = () => {
    if (selectedCharacter !== null) {
      if (startGameSection.current) {
        startGameSection.current.scrollIntoView({ behavior: 'smooth' });
      }
      // Update profile picture and show the Start Game button
      setProfilePicture(
        `./assets/game-assets/characters/character${selectedCharacter}.png`
      );
      setShowStartGameButton(true);
      //setShowModal(false);
    } else {
      alert('Please select a character before starting the game.');
    }
  };

  const handleCancelCharacter = () => {
    setProfilePicture(`./assets/game-assets/characters/character31.png`);
    setCharacterName('Paladin Wizard');
    setSelectedCharacter(null);
    setShowStartGameButton(false);
    if (topSection.current) {
      topSection.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (topSection.current) {
      topSection.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleStartGame = () => {
    //setShowModal(false);
  };

  return (
    <>
      <div ref={topSection}></div>
      <h1>DRAGGIN KARMA POINTS</h1>
      <h2>quest of the paladin wizards</h2>

      {/* Character Selection Modal */}
      <>
        <div>
          {!showGame ? (
            <div>
              <h2>Select Your DPW</h2>
              <div className="character-images-container">
                {Array.from({ length: totalCharacters }).map((_, i) => (
                  <div
                    style={{
                      textAlign: 'center',
                      alignContent: 'center',
                      alignItems: 'center',
                    }}
                    key={i + 1}
                    className={`${styles.characterWrapper} ${
                      selectedCharacter === i + 1 ? 'selected' : ''
                    }`}
                    onClick={() => {
                      if (!showStartGameButton) selectCharacter(i + 1);
                    }}
                  >
                    <img
                      src={characterNames[i].asset}
                      alt={`Character ${i + 1}`}
                      className={`${
                        showStartGameButton && selectedCharacter !== i + 1
                          ? 'greyed-out'
                          : ''
                      }`}
                    />
                    <p
                      style={{
                        display: 'flex',
                        textAlign: 'center',
                        alignContent: 'center',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      className={`${
                        showStartGameButton && selectedCharacter !== i + 1
                          ? 'greyed-out'
                          : ''
                      } ${styles.characterName}`}
                    >
                      {characterNames[i].name}
                    </p>
                  </div>
                ))}
              </div>

              <div ref={startGameSection}></div>

              {showStartGameButton ? (
                <>
                  <button
                    onClick={handleCancelCharacter}
                    className={`cancelCharacter`}
                  >
                    Cancel Selection
                  </button>
                </>
              ) : (
                <>
                  {selectedCharacter && (
                    <>
                      <button
                        onClick={handleConfirmCharacter}
                        className={`cancelCharacter`}
                      >
                        Confirm Selection
                      </button>
                    </>
                  )}
                </>
              )}
            </div>
          ) : (
            <></>
          )}

          <Game
            profilePicture={profilePicture}
            characterName={characterName}
            showStartGameButton={showStartGameButton}
            showGame={showGame}
            setShowGame={setShowGame}
            gameCompleted={gameCompleted}
            setGameCompleted={setGameCompleted}
            isConnected={isConnected}
            handleScrollToLogin={handleScrollToLogin}
          />

          {/* Inventory and Player Info Section */}
        </div>
        <Link to="/">
          <button style={{ marginTop: '16px' }} className={styles.actionButton}>
            Back to Home
          </button>
        </Link>
      </>
    </>
  );
};

export default CharacterSelection;
