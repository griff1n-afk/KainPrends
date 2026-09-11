import './NavBar.css'
import {useCallback, useEffect, useState, useRef  } from 'react';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { User as UserIcon, LogOut } from 'lucide-react';
import { Menu, X, Bell } from 'lucide-react';
import { useAuthModal } from './context/AuthModalContext'
import { useNotifications } from './hooks/useNotifications';
import { formatRelativeTime } from './utils/formatRelativeTime';


export default function NavBar(){

    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [profileData, setProfileData] = useState<{ username: string | null; avatar_url: string | null } | null>(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isMenuClosing, setIsMenuClosing] = useState(false);
    const { openAuthModal } = useAuthModal();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const notifRef = useRef<HTMLDivElement>(null);
    const [isNotifClosing, setIsNotifClosing] = useState(false);
    const { notifications, markAllAsRead, unreadCount  } = useNotifications(currentUser?.id ?? null);

    const closeMobileMenu = useCallback(() => {
        setIsMenuClosing(true);
        setTimeout(() => {
            setIsMobileMenuOpen(false);
            setIsMenuClosing(false);
        }, 200);
    }, []);

    const toggleProfileMenu = useCallback(() => {
        if (isProfileMenuOpen) {
            setIsClosing(true);
            setTimeout(() => {
                setIsProfileMenuOpen(false);
                setIsClosing(false);
            }, 250);
        } else {
            setIsProfileMenuOpen(true);
        }
    }, [isProfileMenuOpen]);

    const toggleNotifMenu = useCallback(() => {
        if (isNotifOpen) {
            setIsNotifClosing(true);
            setTimeout(() => {
                setIsNotifOpen(false);
                setIsNotifClosing(false);
            }, 250);
        } else {
            setIsNotifOpen(true);
        }
    }, [isNotifOpen]);

    useEffect(() => {
        const fetchProfileData = async () => {
            if (currentUser) {
                const { data } = await supabase
                    .from('profiles')
                    .select('username, avatar_url')
                    .eq('id', currentUser.id)
                    .single();
                setProfileData(data);
                }
                setLoading(false);
            };
        fetchProfileData();
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!isProfileMenuOpen || isClosing) return;
            if (!(e.target as HTMLElement).closest('.profile-menu-wrapper')) {
                toggleProfileMenu();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isProfileMenuOpen, isClosing, toggleProfileMenu]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (!isMobileMenuOpen || isMenuClosing) return;
            if (!(e.target as HTMLElement).closest('.navbar')) {
                closeMobileMenu();
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, [isMobileMenuOpen, isMenuClosing, closeMobileMenu]);

    const handleSignout = async () => {
        await supabase.auth.signOut();
        setProfileData(null);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(event.target as Node) && isNotifOpen) {
                setIsNotifClosing(true);
                setTimeout(() => {
                    setIsNotifOpen(false);
                    setIsNotifClosing(false);
                }, 250);
            }
        }

        if (isNotifOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isNotifOpen]);

    return(
        <nav className='navbar'>
            <Link to="/" className='navbar-logo'>
                Kain<span>Prends</span>
            </Link>

            <ul className='navbar-links'>
                <li><Link to="/">Home</Link></li>
                <li><Link to="/Recipes">Recipes</Link></li>
                <li><Link to="/About">About</Link></li>
            </ul>

            <div className="navbar-right-cluster">
                {currentUser && (
                    <div className="notif-wrapper" ref={notifRef}>
                        <button type="button" className="notif-bell-btn" onClick={toggleNotifMenu}>
                            <Bell size={20} />
                            {unreadCount > 0 && (
                                <span className="notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
                            )}
                        </button>

                        {isNotifOpen && (
                            <div className={`notif-panel ${isNotifClosing ? 'closing' : ''}`}>
                                <div className="notif-panel-arrow" />
                                <div className="notif-panel-header">
                                    <span>Notifications</span>
                                    <button type="button" className="notif-mark-all" onClick={markAllAsRead}>Mark all read</button>
                                </div>

                                <div className="notif-list">
                                    {notifications.length === 0 ? (
                                        <div className="notif-empty">No notifications yet</div>
                                    ) : (
                                        notifications.map((notif) => (
                                            <div key={notif.id} className={`notif-item ${notif.is_read ? '' : 'unread'}`}>
                                                {notif.actor.avatar_url ? (
                                                    <img src={notif.actor.avatar_url} alt="" className="notif-avatar" />
                                                ) : (
                                                    <div className="notif-avatar-fallback">
                                                        {notif.actor.username.charAt(0).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="notif-content">
                                                    <p><strong>{notif.actor.username}</strong> favorited your recipe</p>
                                                    <p className="notif-recipe-title">{notif.recipe.title}</p>
                                                    <span className="notif-time">{formatRelativeTime(notif.created_at)}</span>
                                                </div>
                                                {!notif.is_read && <span className="notif-dot" />}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <div className='navbar-actions'>
                    {loading ? (
                        <div className="navbar-actions-skeleton" />
                    ) : currentUser ? (
                        <div className='profile-menu-wrapper'>
                            <button type='button' className='profile-avatar-btn' onClick={toggleProfileMenu}>
                                {profileData?.avatar_url ? (
                                    <img src={profileData.avatar_url} alt='' className='navbar-avatar' />
                                ) : (
                                    <div className='navbar-avatar-fallback'>
                                        {profileData?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                            </button>

                            {isProfileMenuOpen && (
                                <div className={`profile-dropdown ${isClosing ? 'closing' : ''}` }>
                                    <div className="profile-dropdown-arrow" />
                                    <Link to={`/profile/${profileData?.username}`} className="profile-dropdown-item">
                                        <UserIcon size={16} />
                                        Profile
                                    </Link>
                                    <div className="profile-dropdown-divider" />
                                    <button type="button" onClick={handleSignout} className="profile-dropdown-item profile-dropdown-signout">
                                        <LogOut size={16} />
                                        Sign Out
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <>
                            <button className='navbar-login-link' onClick={() => openAuthModal('login')}>Log In</button>
                            <button className='navbar-signup-btn' onClick={() => openAuthModal('signup')}>Sign Up</button>
                        </>
                    )}
                </div>

                <button
                    type="button"
                    className="hamburger-btn"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (isMobileMenuOpen) {
                            closeMobileMenu();
                        } else {
                            setIsMobileMenuOpen(true);
                        }
                    }}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {isMobileMenuOpen && (
                <div className={`mobile-menu ${isMenuClosing ? 'closing' : ''}`}>
                    <ul className="mobile-menu-links">
                        <li><Link to="/" onClick={closeMobileMenu}>Home</Link></li>
                        <li><Link to="/recipes" onClick={closeMobileMenu}>Recipes</Link></li>
                        <li><Link to="/about" onClick={closeMobileMenu}>About</Link></li>
                    </ul>

                    <div className="mobile-menu-divider" />

                    <div className="mobile-menu-actions">
                        {loading ? null : currentUser ? (
                            <>
                                <Link to={`/profile/${profileData?.username}`} className="mobile-menu-item" onClick={closeMobileMenu}>
                                    Profile
                                </Link>
                                <button type="button" onClick={ () => {handleSignout(); closeMobileMenu();} } className="mobile-menu-item mobile-menu-signout">
                                    Sign Out
                                </button>
                            </>
                        ) : (
                            <>
                                <button className='navbar-login-link' onClick={() => openAuthModal('login')}>Log In</button>
                                <button className='navbar-signup-btn' onClick={() => openAuthModal('signup')}>Sign Up</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
}