import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom'
import { useAuth } from './context/AuthContext';
import AuthCard from './components/Auth/AuthCard';
import './Auth.css'

export default function LogIn(){

    const navigate = useNavigate();
    const location = useLocation();
    const [isFlipped, setIsFlipped] = useState(location.state?.mode === 'signup');

    const { currentUser, authChecked } = useAuth();

    useEffect(() => {
        if (authChecked && currentUser) {
            navigate('/');
        }
    }, [authChecked, currentUser, navigate]);
    
    return(
        <>
            <div className="login-background">
                <AuthCard
                    isFlipped={isFlipped}
                    setIsFlipped={setIsFlipped}
                    onAuthSuccess={() => navigate('/')}
                />
            </div>
        </>
    );

}