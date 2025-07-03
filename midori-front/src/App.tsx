import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/header";
import HomePage from "./pages/home/HomePage";
import GraphsPage from "./pages/graphs/GraphPage";
import RankingsPage from "./pages/rankings/RankingPage";
import Page404 from "./pages/error/Page404";
import ErrorFallback from "./pages/error/ErrorFallback";
import { ErrorBoundary } from "react-error-boundary";
import NewsPage from "./pages/news/NewsPage";
import { Chatbot } from "./components/chatbot";
import Footer from "./components/footer";
import { CookiesProvider } from "react-cookie";


function App() {
    return (
        <CookiesProvider>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
                <Router>
                    <div className="min-h-screen bg-background">
                        <Header />
                        <main className="container mx-auto px-4 py-4 sm:py-8 min-h-[calc(100vh-4rem)]">
                            <Routes>
                                <Route path="/" element={<HomePage />} />
                                <Route path="/graphs" element={<GraphsPage />} />
                                <Route path="/graphs/:hsCode" element={<GraphsPage />} />  {/* 여기를 수정 */}
                                <Route path="/rankings" element={<RankingsPage />} />
                                <Route path="/news" element={<NewsPage />} />
                                <Route path="*" element={<Page404 />} />
                            </Routes>
                        </main>
                        <Footer />
                        <Chatbot />
                    </div>
                </Router>
            </ErrorBoundary>
        </CookiesProvider>
    );
}

export default App;