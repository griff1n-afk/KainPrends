import { useState, useEffect } from 'react';
import { useAuthModal } from '../../context/AuthModalContext';
import AuthCard from './AuthCard';
import './AuthModal.css';

export default function AuthModal() {
    const { isOpen, mode, closeAuthModal } = useAuthModal();
    const [isFlipped, setIsFlipped] = useState(mode === 'signup');
    const [shouldRender, setShouldRender] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [isCardFlipping, setIsCardFlipping] = useState(false);

    useEffect(() => {
        if (!isOpen) return;

        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';

        return () => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            };
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setShouldRender(true);
            setIsClosing(false);
        } else if (shouldRender) {
            setIsClosing(true);
            const timer = setTimeout(() => {
                setShouldRender(false);
                setIsClosing(false);
            }, 250);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleFlipChange = (value: boolean) => {
        setIsCardFlipping(true);
        setIsFlipped(value);
        setTimeout(() => setIsCardFlipping(false), 600);
    };

    useEffect(() => {
        if (isOpen) {
            setIsFlipped(mode === 'signup');
        }
    }, [isOpen, mode]);

    if (!shouldRender) return null;

  return (
    <div className={`auth-modal-overlay ${isClosing ? 'closing' : 'opening'}`}>
        <div className={`auth-modal-wrapper ${isClosing ? 'closing' : 'opening'}`}>
            <button 
                type="button" 
                className={`auth-modal-close ${isCardFlipping ? 'fading' : ''}`} 
                onClick={closeAuthModal}
            >
            &times;
            </button>
            <AuthCard
            isFlipped={isFlipped}
            setIsFlipped={handleFlipChange}
            onAuthSuccess={closeAuthModal}
            />
        </div>
    </div>
  );
}