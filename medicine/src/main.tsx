import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Import API Tester for console access
import { APITester } from './services/apiTester.ts'

// Make API tester available globally
(window as any).testAPIs = () => APITester.testAllAPIs();
(window as any).openAPITest = () => {
  window.location.hash = '#apitest';
  window.location.reload();
};

console.log('%c🔧 Developer Tools Available:', 'color: #4CAF50; font-size: 16px; font-weight: bold');
console.log('%ctestAPIs() - Test all AI APIs and check their status', 'color: #2196F3; font-size: 14px');
console.log('%copenAPITest() - Open API Test Panel', 'color: #2196F3; font-size: 14px');
console.log('');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
