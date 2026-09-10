import { useState, useEffect } from "react";
import { supabase } from './supabaseClient';
import { checkUsernameAvailability } from './utils/checkUsernameAvailability';
import { useNavigate } from 'react-router-dom';

interface EditProfileModalProps {
        isOpen: boolean;
        onClose: () => void;
        currentAvatar: string | null;
        editUsername: string;
        setEditUsername: (val: string) => void;
        bio: string | null;
        setBio: (val: string) => void;
        avatarStyle: string;
        setAvatarStyle: (val: string) => void;
        userId: string | undefined;
        originalUsername: string;
        onProfileUpdated: (updatedFields: {
            username?: string;
            bio?: string | null;
            avatar_url?: string;
        }) => void;
    }

export default function EditProfileModal({
    isOpen,
    onClose,
    currentAvatar,
    editUsername: initialUsername,
    setEditUsername,
    bio: initialBio,
    setBio,
    avatarStyle: initialStyle,
    setAvatarStyle,
    userId,
    originalUsername,
    onProfileUpdated
}: EditProfileModalProps) {

    const navigate = useNavigate();
    const approvedStyles = [
        { id: 'lorelei', name: 'Lorelei' },
        { id: 'adventurer', name: 'Adventurer' },
        { id: 'avataaars', name: 'Avataaars' },
        { id: 'bottts', name: 'Bottts' },
        { id: 'open-peeps', name: 'Open Peeps' },
        { id: 'personas', name: 'Personas' },
        { id: 'pixel-art', name: 'Pixel Art' },
        { id: 'thumbs', name: 'Thumbs' },
        { id: 'critters', name: 'Critters' },
        { id: 'clay', name: 'Clay' }
    ];

    const [localUsername, setLocalUsername] = useState(initialUsername);
    const [localBio, setLocalBio] = useState(initialBio || '');
    const [localAvatarStyle, setLocalAvatarStyle] = useState(initialStyle);
    const [hasSelectedStyle, setHasSelectedStyle] = useState(false);

    const [usernameError, setUsernameError] = useState<string | null>(null);
    const [generalError, setGeneralError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [showConfirm, setShowConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setLocalUsername(initialUsername);
            setLocalBio(initialBio || '');
            setLocalAvatarStyle(initialStyle);
            setHasSelectedStyle(false);
            setUsernameError(null);
            setGeneralError(null);
            setShowConfirm(false);
        }
    }, [isOpen, initialUsername, initialBio, initialStyle]);

    function extractStyleFromUrl(url: string | null): string | null {
        if (!url) return null;
        const match = url.match(/\/(\d+\.x)\/([^/]+)\/svg/);
        return match ? match[2] : null;
    }

    const handleSave = async () => {
        if (!userId) {
            setGeneralError("Session expired. Please sign back in.");
            return;
        }

        setUsernameError(null);
        setGeneralError(null);
        setIsSaving(true);

        try {
            const usernameChanged = localUsername  !== originalUsername;

            if (usernameChanged) {
                const isAvailable = await checkUsernameAvailability(localUsername );
                if (!isAvailable) {
                    setUsernameError('Username is already taken');
                    return;
                }
            }

            const finalAvatarUrl = hasSelectedStyle
            ? `https://api.dicebear.com/10.x/${localAvatarStyle}/svg?seed=${localUsername || 'default'}&backgroundColor=f9bc60,e16162,abd1c6`
            : currentAvatar;

            const updates: {
                username?: string;
                bio: string | null;
                avatar_url?: string;
            } = {
                bio: localBio,
            };

            if (usernameChanged) {
                updates.username = localUsername;
            }

            if (hasSelectedStyle && finalAvatarUrl) {
                updates.avatar_url = finalAvatarUrl;
            }

            const { error: updateError } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', userId ?? '');

            if (updateError) {
                setGeneralError('Something went wrong. Please try again.');
                return;
            }

            setEditUsername(localUsername);
            setBio(localBio);
            setAvatarStyle(localAvatarStyle);

            onProfileUpdated({
                ...(usernameChanged && { username: localUsername }),
                bio: localBio,
                ...(hasSelectedStyle && finalAvatarUrl && { avatar_url: finalAvatarUrl }),
            });

            onClose();

            if (usernameChanged) {
                navigate(`/profile/${localUsername}`);
            }

        } finally {
            setIsSaving(false);
        }
    };
    
    if (!isOpen) return null;

    return(
        <>
            <div className="epm-overlay">
                <div className="epm-card">

                    <div className="epm-header">
                        <h2>Edit Profile</h2>
                    </div>

                    <form className="epm-form" onSubmit={(e) => { 
                        e.preventDefault();
                        if (hasSelectedStyle) {
                            setShowConfirm(true);
                        } else {
                            handleSave();
                        }
                    }}>
                        
                        <div className="epm-field epm-avatar-workshop">

                            <label>Choose Your Theme & Look</label>

                            <div className="epm-workshop-container">
                                <div className="epm-main-avatar-preview" 
                                    onClick={() => {
                                        setHasSelectedStyle(false);
                                        const originalStyle = extractStyleFromUrl(currentAvatar);
                                        if (originalStyle) setAvatarStyle(originalStyle);
                                    }}
                                >
                                    <div className="epm-avatar-clip">
                                        <img
                                            src={
                                                hasSelectedStyle
                                                    ? `https://api.dicebear.com/10.x/${localAvatarStyle}/svg?seed=${localUsername || 'default'}&backgroundColor=f9bc60,e16162,abd1c6`
                                                    : currentAvatar ?? ''
                                            }
                                            alt="Main Preview"
                                            className="epm-preview-img"
                                        />
                                    </div>
                                    {hasSelectedStyle && (
                                        <span className="epm-revert-hint">Click to revert</span>
                                    )}
                                </div>

                                <div className="epm-mini-styles-grid">
                                    {approvedStyles.map((style) => (
                                        <button
                                            key={style.id}
                                            type="button"
                                            title={style.name}
                                            className={`epm-mini-circle ${localAvatarStyle === style.id ? 'epm-active' : ''}`}
                                            onClick={() => {setLocalAvatarStyle(style.id); setHasSelectedStyle(true);}}
                                        >
                                            <img 
                                                src={`https://api.dicebear.com/10.x/${style.id}/svg?seed=${localUsername || 'default'}&backgroundColor=f9bc60,e16162,abd1c6`} 
                                                alt={style.name} 
                                                className="epm-mini-preview-img"
                                                loading="lazy"
                                            />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="epm-field">
                            <label className="epm-label">Username</label>
                            <input 
                                type="text" 
                                className={`epm-input ${usernameError  ? 'epm-input-error' : ''}`} 
                                required
                                maxLength={20}
                                value={localUsername}
                                onChange={(e) => setLocalUsername(e.target.value)}
                            />
                            <span className="epm-char-count">{localUsername.length}/20</span>
                            {usernameError  && <span className="epm-error-text">{usernameError}</span>}
                        </div>

                        <div className="epm-field">
                            <label className="epm-label">Bio</label>
                            <textarea 
                                className="epm-textarea" 
                                rows={4}
                                maxLength={150}
                                placeholder="Tell us about your cooking journey..."
                                value={localBio ?? ''}
                                onChange={(e) => setLocalBio(e.target.value)}
                            />
                            <span className="epm-char-count">{localBio.length}/150</span>
                        </div>
                        
                        {generalError && <span className="epm-error-text epm-error-general">{generalError}</span>}
                        <div className="epm-actions">
                            <button 
                                type="button" 
                                className="epm-cancel-btn"
                                onClick={onClose}
                                disabled={isSaving}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="epm-save-btn"
                                disabled={isSaving}
                            >
                                {isSaving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>

                    </form>

                </div>

                {showConfirm && (
                    <div className="epm-confirm-overlay">
                        <div className="epm-confirm-card">
                            <h3 className="epm-confirm-title">Save new avatar?</h3>
                            <p className="epm-confirm-text">
                                Your current avatar can't be recovered once you save — this style will replace it permanently.
                            </p>
                            <div className="epm-confirm-actions">
                                <button 
                                    type="button" 
                                    className="epm-cancel-btn"
                                    onClick={() => setShowConfirm(false)}
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="button" 
                                    className="epm-save-btn"
                                    onClick={() => {
                                        setShowConfirm(false);
                                        handleSave();
                                    }}
                                >
                                    Yes, Save
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </>
    )
}