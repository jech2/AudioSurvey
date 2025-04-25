import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { ExperimentForm } from './components/ExperimentForm';
import { ExperimentEnd } from './components/ExperimentEnd';

function App() {
  // reinitialization of sessionStorage when refresh the page
  if (typeof window !== 'undefined') {  // SSR 대비
    sessionStorage.removeItem('currentUser');
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/experiment" element={<ExperimentForm />} />
        {/* <Route path="/" element={<ExperimentEnd />} /> */}
      </Routes>
    </Router>
  );
}

export default App;