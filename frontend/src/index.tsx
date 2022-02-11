import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { HashRouter,
  Route,
  Routes } from "react-router-dom";
import SplashWindow from './components/SplashWindow';
import SetupWindow from './components/SetupWindow';
import LogsWindow from './components/LogsWindow';
import ConfigurationWindow from './components/ConfigurationWindow';
import MiniStatusWindow from './components/MiniStatusWindow';
import PullSecretChangeWindow from './components/PullSecretChangeWindow';
import { AboutWindow } from './components/about/AboutWindow';
import { DialogWindow } from './components/dialog/DialogWindow';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<p>No route given</p>} />
        <Route path="/splash" element={<SplashWindow />} />
        <Route path="/setup" element={<SetupWindow />} />
        <Route path="/logs" element={<LogsWindow />} />
        <Route path="/configuration" element={<ConfigurationWindow />} />
        <Route path="/ministatus" element={<MiniStatusWindow />} />
        <Route path="/pullsecret" element={<PullSecretChangeWindow />} />
        <Route path="/about" element={<AboutWindow />} />
        <Route path="/dialog" element={<DialogWindow />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

