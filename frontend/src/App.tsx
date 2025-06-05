import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Admin from './pages/Admin';
import Mobile from './pages/Mobile';
import TV from './pages/TV';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<Admin />} />
        <Route path="/tv" element={<TV />} />
        <Route path="/" element={<Mobile />} />
      </Routes>
    </BrowserRouter>
  );
}
