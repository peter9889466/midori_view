import React from 'react';
import MapComponent from '../components/MapComponent';
import WorldMapWithBorders from '../components/MapComponent';
import MapWithCountryHighlight from '../components/MapWithCountryHighlight';
import SelectCountryMap from '../components/SelectCountryMap';
import Ranking from '../components/Ranking';

function App() {
  return (
    <div>
      {/* <MapComponent/> */}
      {/* <WorldMapWithBorders/> */}
      {/* <MapWithCountryHighlight/> */}
      <SelectCountryMap/>
      <Ranking/>
    </div>
  );
}

export default App;
