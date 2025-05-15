import '../styles/global.css';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import SecurityTest from './pages/SecurityTest';

function App() {
  const navigate = useNavigate();

  return (
    <div className="root">
      <Router>
        <div className="container">
          <Routes>
            <Route path="/" element={
              <div className="welcome-section">
                <h1>FortiCode - Security Auditor</h1>
                <p>Welcome to FortiCode. Start by configuring your security settings.</p>
                <button className="primary-button" onClick={() => navigate('/security-test')}>
                  Run Security Scan
                </button>
              </div>
            } />
            <Route path="/security-test" element={<SecurityTest />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;