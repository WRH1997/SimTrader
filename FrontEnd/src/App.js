import React, { useState } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css';
import Homepage from "./components/Homepage";
import Login from './components/Login';
import Signup from './components/Signup';
import CreatePortfolio from "./components/CreatePortfolio";
import PortfolioView from "./components/PortfolioView";

function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path='login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/homepage' element={<Homepage />} />
          <Route path='createPort' element={<CreatePortfolio />} />
          <Route path='/portfolioView' element={<PortfolioView />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
