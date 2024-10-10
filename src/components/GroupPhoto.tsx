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
const GroupPhoto = () => {
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
  return (
    <div
      className="extra-images-container"
      style={{
        display: 'flex',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center', // Center content vertically
        alignItems: 'center', // Center content horizontally
        minHeight: '100vh', // Make sure it covers the full viewport height
        textAlign: 'center', // Center text if needed
      }}
    >
      {characterNames.map((char, index) => (
        <a key={index}>
          <div className="image-box">
            <img src={char.asset} alt={char.name} />
            <p>{char.name}</p>
          </div>
        </a>
      ))}
    </div>
  );
};

export default GroupPhoto;
