import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { HashRouter,
  Route,
  Routes } from "react-router-dom";
import SplashWindow from './components/SplashWindow';
import SetupWindow from './components/SetupWindow';
import StatusWindow from './components/StatusWindow';
import ConfigWindow from './components/ConfigWindow';
import MiniStatusWindow from './components/MiniStatusWindow';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" exact element={<SplashWindow />} />
        <Route path="/setup" element={<SetupWindow />} />
        <Route path="/status" element={<StatusWindow />} />
        <Route path="/config" element={<ConfigWindow />} />
        <Route path="/ministatus" element={<MiniStatusWindow />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
