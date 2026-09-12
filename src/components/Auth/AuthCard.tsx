import { useState } from 'react';
import type { SubmitEvent } from 'react';
import { supabase } from '../../supabaseClient';
import { checkUsernameAvailability } from '../../utils/checkUsernameAvailability'; 

import './AuthCard.css'
import { ChefHat } from 'lucide-react';
import { Eye, EyeOff } from 'lucide-react';

interface AuthCardProps {
  isFlipped: boolean;
  setIsFlipped: (value: boolean) => void;
  onAuthSuccess?: () => void;
}

const getAuthStorageKey = () => {
    const key = Object.keys(localStorage).find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    return key ?? null;
};


export default function AuthCard({ isFlipped, setIsFlipped, onAuthSuccess }: AuthCardProps){

    // Login states
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [loginError, setLoginError] = useState("");
    const [rememberMe, setRememberMe] = useState(false); 
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetSent, setResetSent] = useState(false);
    const [resetError, setResetError] = useState('');
    const [isClosing, setIsClosing] = useState(false);
    // Signup states
    const [signupEmail, setSignupEmail] = useState("");
    const [signupPassword, setSignupPassword] = useState("");
    const [username, setUsername] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [usernameError, setUsernameError] = useState("");
    const [signupEmailError, setSignupEmailError] = useState("");
    const [signupPasswordError, setSignupPasswordError] = useState("");
    const [confirmPasswordError, setConfirmPasswordError] = useState("");
    const [signupError, setSignupError] = useState("");

    const [isLoading, setIsLoading] = useState(false);
    const [shake, setShake] = useState(false);

    const closeModal = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowForgotPassword(false);
            setIsClosing(false);
        }, 200); 
    };

    const triggerShake = () => {
        setShake(true);
        setTimeout(() => setShake(false), 400);
    };

    const handlePasswordReset = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
            redirectTo: 'http://localhost:5173/reset-password',
        });
        if (error){
            setResetError(error.message);
            return;
        }
        setResetSent(true);
    }


    const handleLogIn = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        validateEmail();
        validatePassword();

        if (!email || !password) {
            triggerShake();
            return;
        }

        setIsLoading(true);

        try{
            localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
            const {error} = await supabase.auth.signInWithPassword({email, password})
                if(error){
                    setLoginError("Incorrect email or password. Please try again.");
                    triggerShake();
                    return;
                }
                if (!rememberMe) {
                    const key = getAuthStorageKey();
                    if (key) {
                        const sessionStr = localStorage.getItem(key);
                        if (sessionStr) {
                            sessionStorage.setItem(key, sessionStr);
                            localStorage.removeItem(key);
                        }
                    }
                }
                onAuthSuccess?.();
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignUp = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();

        setSignupError("");

        validateUsername();
        validateSignupEmail();
        validateSignupPassword();
        validateConfirmPassword();

        if (!signupEmail || !signupPassword || !confirmPassword || !username) {
            triggerShake();
            return;
        }

        if(signupPassword !== confirmPassword){
            console.log(signupPassword, "=", confirmPassword)
            setSignupError("Password do not match");
            triggerShake();
            return;
        }

        if (signupPassword.length < 6) {
            setSignupError("Password must be at least 6 characters");
            triggerShake();
            return;
        }
        
        setIsLoading(true);

        try{
            const isAvailable = await checkUsernameAvailability(username);

            if (!isAvailable){
                setSignupError("Username is already taken");
                triggerShake();
                return;
            }

            localStorage.setItem('rememberMe', 'true')
            const {error} = await supabase.auth.signUp({email: signupEmail, password: signupPassword, options: { data: {username} }})
                if(error){
                    setSignupError("This email is already registered. Try logging in instead.")
                    triggerShake();
                    console.error(error.message);
                    return;
                }
                console.log("Registered successfully!")
                onAuthSuccess?.();
        } finally {
            setIsLoading(false);
        }
    };

    const validateEmail = () => {
        if(!email){
            setEmailError("Email address is required");
            return;
        }
        setEmailError("");
    }

    const validatePassword = () => {
        if(!password){
            setPasswordError("Please enter your password");
            return;
        }
        setPasswordError("");
    }

    const validateUsername = () => {
        if(!username){
            setUsernameError("Please enter your username");
            return;
        }
        setUsernameError("");
    }

    const validateSignupEmail = () => {
        if(!signupEmail){
            setSignupEmailError("Email address is required");
            return;
        }
        setSignupEmailError("");
    }

    const validateSignupPassword = () => {
        if(!signupPassword){
            setSignupPasswordError("Please enter your password");
            return;
        }
        setSignupPasswordError("");
    }

    const validateConfirmPassword = () => {
        if(!confirmPassword){
            setConfirmPasswordError("Please confirm your password");
            return;
        }
        setConfirmPasswordError("");
    }

    const handleOAuthLogin = async (provider: 'google' | 'facebook') => {
        const { error } = await supabase.auth.signInWithOAuth({
            provider,
            options: {
                redirectTo: 'http://localhost:5173/',
            },
        });
        if (error) {
            setLoginError(error.message);
        }
    };
    
    return(
        <>
            <div className="flip-container">
                <div className={`flip-card ${isFlipped ? 'flipped' : ''}`}>
                    <div className="flip-card-front">
                        <div className="login-header">
                            <div className='login-icon-wrapper'>
                                <ChefHat size={32} color='#001e1d' />
                            </div>
                            <h1 className="login-title">Welcome back, chef!</h1>
                            <p className='login-subtitle'>Log in to save and share your recipe</p>
                        </div>
                        <form className={shake ? 'shake' : ''} onSubmit={handleLogIn}>
                            <div className='floating-input'>
                                <input
                                type="email"
                                id="email"
                                name="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onBlur={validateEmail}
                                placeholder=" "
                                />
                                <label htmlFor="email">Email Address</label>
                                {emailError && <span className='gentle-error'>{emailError}</span>}
                            </div>
                            <div className='floating-input'>
                                <input
                                type={showPassword ? "text" : "password"}
                                id="password"
                                name="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                onBlur={validatePassword}
                                placeholder=" "
                                />
                                <label htmlFor="password">Password</label>
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {passwordError && <span className='gentle-error'>{passwordError}</span>}
                            </div>
                            <div className='login-options'>
                                <label className='remember-me'>
                                    <input type='checkbox' className='custom-checkbox-input'
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    />
                                    <span className='custom-checkbox-box'>
                                        <svg className='checkmark' viewBox="0 0 24 24">
                                            <path d="M5 13l4 4L19 7" />
                                        </svg>
                                    </span>
                                    <span className='remember-text'>Remember me</span>
                                </label>
                                <button type='button' onClick={() =>setShowForgotPassword(true)}>Forgot password?</button>
                            </div>
                            {loginError && <p className="login-error-banner">{loginError}</p>}
                            <button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                    <span className='spinner'/>
                                    </>
                                )
                                : "Sign In"}
                            </button>
                        </form>
                        <div className='divider'>
                                <span>or continue with</span>
                        </div>
                        <div className="social-login">
                            <button type="button" className="social-btn" onClick={() => handleOAuthLogin('google')}>
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                                </svg>
                                Google
                            </button>
                            <button type="button" className="social-btn" onClick={() => handleOAuthLogin('facebook')}>
                                <svg viewBox="0 0 24 24" width="18" height="18">
                                <path fill="#1877F2" d="M24 12.07C24 5.4 18.63 0 12 0S0 5.4 0 12.07C0 18.1 4.39 23.09 10.13 24v-8.44H7.08v-3.49h3.05V9.41c0-3.02 1.79-4.7 4.53-4.7 1.31 0 2.68.24 2.68.24v2.97h-1.51c-1.49 0-1.95.93-1.95 1.89v2.26h3.32l-.53 3.49h-2.79V24C19.61 23.09 24 18.1 24 12.07z"/>
                                </svg>
                                Facebook
                            </button>
                        </div>
                        <p className="signup-prompt">
                            Don't have an account? <button type='button' onClick={() => setIsFlipped(true)} className="signup-link">Sign up</button>
                        </p>
                    </div>

                    <div className="flip-card-back">
                        <div className='signup-header'>
                            <div className='signup-icon-wrapper'>
                                <ChefHat size={32} color='#001e1d' />
                            </div>
                            <h1 className='signup-title'>Create your account</h1>
                            <p className='signup-subtitle'>Join Kainprends and start sharing your recipes</p>
                        </div>

                        <form className={shake ? 'shake' : ''} onSubmit={handleSignUp}>
                            <div className='floating-input'>
                                <input
                                    type="text"
                                    id="username"
                                    name="username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    onBlur={validateUsername}
                                    placeholder=" "
                                />
                                <label htmlFor="username">Username</label>
                                {usernameError && <span className='gentle-error'>{usernameError}</span>}
                            </div>

                            <div className='floating-input'>
                                <input
                                    type="email"
                                    id='signup-email'
                                    name='signup-email'
                                    value={signupEmail}
                                    onChange={(e) => setSignupEmail(e.target.value)}
                                    onBlur={validateSignupEmail}
                                    placeholder=" "
                                />
                                <label htmlFor="signup-email">Email Address</label>
                                {signupEmailError && <span className='gentle-error'>{signupEmailError}</span>}
                            </div>

                            <div className='floating-input'>
                                <input
                                    type={showSignupPassword ? "text" : "password"}
                                    id='signup-password'
                                    name='signup-password'
                                    value={signupPassword}
                                    onChange={(e) => setSignupPassword(e.target.value)}
                                    onBlur={validateSignupPassword}
                                    placeholder=" "
                                />
                                <label htmlFor="signup-password">Password</label>
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowSignupPassword(!showSignupPassword)}
                                >
                                    {showSignupPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {signupPasswordError && <span className='gentle-error'>{signupPasswordError}</span>}
                            </div>

                            <div className='floating-input'>
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    onBlur={validateConfirmPassword}
                                    placeholder=" "
                                />
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <button
                                    type="button"
                                    className="toggle-password"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                                {confirmPasswordError && <span className='gentle-error'>{confirmPasswordError}</span>}
                            </div>

                            {signupError && <p className="login-error-banner">{signupError}</p>}

                            <button type="submit" disabled={isLoading}>
                                {isLoading ? (
                                    <>
                                    <span className='spinner'/>
                                    </>
                                )
                                : "Create Account"}
                            </button>
                        </form>

                        <p className="login-prompt">
                            Already have an account? <button type="button" className="login-link" onClick={() => setIsFlipped(false)}>Log in</button>
                        </p>
                    </div>
                </div>
            </div>

            {showForgotPassword && (
                <div className={`modal-overlay ${isClosing ? 'closing' : ''}`} onClick={closeModal}>
                    <div className={`modal-card ${isClosing ? 'closing' : ''}`} onClick={(e) => e.stopPropagation()}>
                        <h2 className="login-title">Reset password</h2>
                        {resetSent ? (
                            <p className="login-subtitle">Check your email for a reset link.</p>
                        ) : (
                            <form onSubmit={handlePasswordReset}>
                                <div className="floating-input">
                                    <input
                                        type="email"
                                        placeholder=" "
                                        value={resetEmail}
                                        onChange={(e) => setResetEmail(e.target.value)}
                                    />
                                    <label>Email Address</label>
                                </div>
                                {resetError && <span className="gentle-error">{resetError}</span>}
                                <button type="submit" className='reset-link-btn'>Send reset link</button>
                            </form>
                        )}
                    </div>
                </div>
            )}
        </>
    );

}