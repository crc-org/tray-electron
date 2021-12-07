import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { HashRouter,
  Route,
  Routes } from "react-router-dom";
import { SplashScreen } from './components/splashscreen';
import OnboardingWizard from './components/setup-wizard';

ReactDOM.render(
  <React.StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" exact element={<SplashScreen />} />
        <Route path="/setup" element={<OnboardingWizard />} />
      </Routes>
    </HashRouter>
  </React.StrictMode>,
  document.getElementById('root')
);
