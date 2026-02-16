import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Welcome } from './pages/Welcome';
import { Lobby } from './pages/Lobby';
import { Game } from './pages/Game';
import { useGameStore } from './store/useGameStore';

function App() {
  useGameStore();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Welcome />} />
        <Route path="/lobby/:gameId" element={<Lobby />} />
        <Route path="/game/:gameId" element={<Game />} />
        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
