import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import HomePage from "./pages/home/HomePage";
import GraphPage from "./pages/graphs/GraphPage";
import RankingPage from "./pages/rankings/RankingPage";
import Page404 from "./pages/error/Page404";
import ErrorFallback from "./pages/error/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";

function App() {
    return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
            <Router>
                <div className="min-h-screen bg-background">
                    <Header />
                    <main className="container mx-auto px-4 py-8">
                        <Routes>
                            <Route path="/" element={<HomePage />} />
                            <Route path="/graphs" element={<GraphPage />} />
                            <Route path="/rankings" element={<RankingPage />} />
                            <Route path="*" element={<Page404 />} />
                        </Routes>
                    </main>
                </div>
            </Router>
            //
        </ErrorBoundary>
    );
}

export default App;
