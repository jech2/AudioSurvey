import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Login } from './components/Login';
import { ExperimentForm } from './components/ExperimentForm';

function App() {
  // 페이지 로드/새로고침 시 sessionStorage 초기화
  if (typeof window !== 'undefined') {  // SSR 대비
    sessionStorage.removeItem('currentUser');
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/experiment" element={<ExperimentForm />} />
      </Routes>
    </Router>
  );
}

export default App;