import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Auth from "./Auth"
import { AuthModalProvider } from "./context/AuthModalContext";
import AuthModal from './components/Auth/AuthModal';
import HomePage from "./HomePage";
import ResetPasswordPage from "./ResetPasswordPage"
import RecipeDetails from "./RecipeDetails";
import ProfilePage from "./ProfilePage";
import RecipesPage from "./RecipesPage";
import AboutPage from "./AboutPage"
import ScrollToTop from "./components/ScrollToTop";
import RecoveryRoute  from "./components/ProtectedRoute"
import NavBar from "./NavBar";
import Footer from "./Footer";

function App() {
  
  return(
    <AuthProvider>
      <AuthModalProvider>
        <BrowserRouter>
          <ScrollToTop />
          <NavBar />
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/auth" element={<Auth/>} />
            <Route
              path="/reset-password"
              element={
                <RecoveryRoute>
                  <ResetPasswordPage />
                </RecoveryRoute>
              }
            />
            <Route path="/recipe/:id" element={<RecipeDetails/>} />
            <Route path="/profile/:username" element={<ProfilePage/>} />
            <Route path="/recipes" element={<RecipesPage/>} />
            <Route path="/about" element={<AboutPage/>} />
          </Routes>
          <AuthModal />
          <Footer />
        </BrowserRouter>
      </AuthModalProvider>
    </AuthProvider>
  );

}

export default App
