import './styles/global.css';
import { Routes, Route, useNavigate } from 'react-router-dom';
import SecurityTest from './pages/SecurityTest';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="welcome-section">
      <h1>FortiCode - Security Auditor</h1>
      <p>Welcome to FortiCode. Start by configuring your security settings.</p>
      <button 
        className="primary-button" 
        onClick={() => navigate('/security-test')}
      >
        Run Security Scan
      </button>
    </div>
  );
}

function App() {
  return (
    <div className="root">
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/security-test" element={<SecurityTest />} />
        </Routes>
      </div>
    </div>
  );
}

export default App;