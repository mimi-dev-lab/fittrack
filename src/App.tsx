import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import WeightPage from './pages/WeightPage';
import MealsPage from './pages/MealsPage';
import WorkoutPage from './pages/WorkoutPage';
import StatsPage from './pages/StatsPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="weight" element={<WeightPage />} />
          <Route path="meals" element={<MealsPage />} />
          <Route path="workout" element={<WorkoutPage />} />
          <Route path="stats" element={<StatsPage />} />
          <Route path="chat" element={<ChatPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
