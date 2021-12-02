import React from 'react';
import ReactDOM from 'react-dom';
import './index.scss';
import { HashRouter,
  Route,
  Routes } from "react-router-dom";
import reportWebVitals from './reportWebVitals';
import { SplashScreen } from './components/spalsh';
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

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
