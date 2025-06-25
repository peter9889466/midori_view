import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import HomePage from "./pages/home/HomePage";
import GraphsPage from "./pages/graphs/GraphPage";
import RankingsPage from "./pages/rankings/RankingPage";
import "./App.css";

function App() {
  return (
      <Router>
        <div className="min-h-screen bg-background">
          <Header />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/graphs" element={<GraphsPage />} />
              <Route path="/rankings" element={<RankingsPage />} />
              <Route path="*" element={<Page404 />} />
            </Routes>
          </main>
        </div>
      </Router>
  );
}

export default App;
