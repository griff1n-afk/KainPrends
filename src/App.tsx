import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from './context/AuthContext';
import Auth from "./Auth"
import { AuthModalProvider } from "./context/AuthModalContext";
import AuthModal from './components/Auth/AuthModal';
import HomePage from "./HomePage";
import ResetPassword from "./ResetPassword"
import RecipeDetails from "./RecipeDetails";
import ProfilePage from "./ProfilePage";
import RecipesPage from "./RecipesPage";
import ScrollToTop from "./components/ScrollToTop";

function App() {
  
  return(
    <AuthProvider>
      <AuthModalProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<HomePage/>} />
            <Route path="/auth" element={<Auth/>} />
            <Route path="/reset-password" element={<ResetPassword/>} />
            <Route path="/recipe/:id" element={<RecipeDetails/>} />
            <Route path="/profile/:username" element={<ProfilePage/>} />
            <Route path="/recipes" element={<RecipesPage/>} />
          </Routes>
          <AuthModal />
        </BrowserRouter>
      </AuthModalProvider>
    </AuthProvider>
  );

}

export default App
