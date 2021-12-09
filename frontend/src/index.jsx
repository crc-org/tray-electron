import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { HashRouter,
  Route,
  Routes } from "react-router-dom";
import SplashWindow from './components/SplashWindow';
import SetupWindow from './components/SetupWindow';
import StatusWindow from './components/StatusWindow';
import SettingsWindow from './components/SettingsWindow';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" exact element={<SplashWindow />} />
        <Route path="/setup" element={<SetupWindow />} />
        <Route path="/status" element={<StatusWindow />} />
        <Route path="/settings" element={<SettingsWindow />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
