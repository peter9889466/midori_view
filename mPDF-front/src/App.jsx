import React from 'react';
import { Routes, Route } from 'react-router-dom';
import SelectCountryMap from '../components/SelectCountryMap';
import Ranking from '../components/Ranking';
import Main from '../routes/page/Main';
import Signup from '../routes/page/signup';
import PDF from '../components/PDF';

function App() {
  return (
    <div>
      {/* <SelectCountryMap/> */}
      {/* <Ranking/> */}
      {/* <Routes>
        <Route path="/" element={<Main/>}/>
        <Route path="/login" element={<Signup/>}/>
      </Routes> */}
      <PDF/>
    </div>
  );
}

export default App;
