import { useEffect, useState } from "react";
import { useParams, useLocation, Link} from "react-router-dom";
import { supabase } from './supabaseClient.ts';
import { useAuth } from './context/AuthContext';
import './ProfilePage.css'
import './EditProfileModal.css'
import { Pencil, Trash2 } from 'lucide-react';
import EditProfileModal from "./EditProfileModal.tsx";
import RecipeFormModal from './components/RecipeFormModal/RecipeFormModal.tsx';
import { getRecipeImage } from './utils/getRecipeImage';
import FavoriteButton from "./components/FavoriteButton.tsx";
import { useFavorites } from './hooks/useFavorites'

interface Profile {
  id: string;
  username: string;
  bio: string | null;
  avatar_url: string | null;
}

interface RecipeSummary {
  id: string;
  title: string;
  image_url: string | null;
  category: string[] | null;
}

type TabKey = "recipes" | "favorites";

export default function ProfilePage(){

    const { username } = useParams<{ username: string }>();
    const location = useLocation();

    const { currentUser, authChecked } = useAuth();

    const [profile, setProfile] = useState<Profile | null>(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const initialTab = (location.state as { tab?: TabKey } | null)?.tab ?? "recipes";
    const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

    const [recipes, setRecipes] = useState<RecipeSummary[]>([]);
    const [favorites, setFavorites] = useState<RecipeSummary[]>([]);
    const [loadingGrid, setLoadingGrid] = useState(true);

    const [recipeCount, setRecipeCount] = useState(0);
    const [favoriteCount, setFavoriteCount] = useState(0);

    const isOwnProfile = !!currentUser && currentUser?.id === profile?.id;

    const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
    const [userId, setUserId] = useState<string | undefined>(undefined);
    const [originalUsername, setOriginalUsername] = useState<string>('');
    const [currentAvatar, setCurrentAvatar] = useState<string | null>(null);
    const [editUsername, setEditUsername] = useState<string>('');
    const [bio, setBio] = useState<string>('Sharing delicious homemade meals and dynamic recipes daily.');
    const [avatarStyle, setAvatarStyle] = useState<string>('lorelei');

    const [isAddRecipeOpen, setIsAddRecipeOpen] = useState(false);
    const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);

    const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const { favoritedIds, toggleFavorite } = useFavorites(currentUser?.id ?? null);

    const [recipesPage, setRecipesPage] = useState(1);
    const [favoritesPage, setFavoritesPage] = useState(1);
    const RECIPES_PER_PAGE = 9;

    const gridItems = activeTab === "recipes" ? recipes : favorites;
    const activePage = activeTab === "recipes" ? recipesPage : favoritesPage;
    const setActivePage = activeTab === "recipes" ? setRecipesPage : setFavoritesPage;

    const totalPages = Math.ceil(gridItems.length / RECIPES_PER_PAGE);

    const paginatedItems = gridItems.slice(
        (activePage - 1) * RECIPES_PER_PAGE,
        activePage * RECIPES_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setActivePage(page);
        document.querySelector('.profile-page-wrapper')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    useEffect(() => {
        setRecipesPage(1);
        setFavoritesPage(1);
    }, [activeTab]);


    useEffect( () => {
        if (!username && !authChecked) return;
        async function fetchProfile() {
            setLoadingProfile(true)

            if (!username && !currentUser) {
                setProfile(null);
                setLoadingProfile(false);
                return;
            }

            let query = supabase.from('profiles').select('id, username, bio, avatar_url');

            if (username) {
                query = query.eq('username', username);
            } else if (currentUser?.id) {
                query = query.eq('id', currentUser.id);
            }

            const { data, error } = await query.single();

            if (error) {
                console.error("Error fetching profile:", error.message);
                setProfile(null);
            } else {
                setProfile(data as Profile);
            }
            setLoadingProfile(false);
        }
        fetchProfile();
    }, [username, currentUser?.id, authChecked]);

    const fetchGridData = async (targetUserId: string) => {
        setLoadingGrid(true);

        const { data: recipeData, count: rCount } = await supabase
            .from('recipes')
            .select('id, title, image_url, category', { count: 'exact' })
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

        const { data: favoriteData, count: fCount } = await supabase
            .from('favorites')
            .select('recipes(id, title, image_url, category)', { count: 'exact' })
            .eq('user_id', targetUserId)
            .order('created_at', { ascending: false });

        setRecipes(recipeData ?? []);
        setRecipeCount(rCount ?? 0);

        const favRecipes = (favoriteData ?? []).map((f: any) => f.recipes);
        setFavorites(favRecipes);
        setFavoriteCount(fCount ?? 0);

        setLoadingGrid(false);
    };

    useEffect( () => {
        if (!profile?.id) return;
        fetchGridData(profile.id);
    }, [profile?.id]);

    useEffect(() => {
        if (profile) {
            setUserId(profile.id);
            setOriginalUsername(profile.username || '');
            setCurrentAvatar(profile.avatar_url);
            setEditUsername(profile.username || '');
            setBio(profile.bio || '');
            const extractedStyle = profile?.avatar_url?.split('/')[4];
            setAvatarStyle(extractedStyle || 'lorelei');
        } else {
            setUserId(undefined);
            setOriginalUsername('');
            setCurrentAvatar(null);
            setEditUsername('');
            setBio('');
        }
    }, [profile]);

    if (loadingProfile) {
        return (
        <>
            <div className="profile-loading">
                <div className="spinner" />
            </div>
        </>
        );
    }

    if (!profile) {
        return (
        <>
            <div className="profile-not-found">Couldn't find that profile.</div>
        </>
        );
    }

    const handleDeleteRecipe = async () => {
        if (!deletingRecipeId) return;

        setIsDeleting(true);

        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', deletingRecipeId);

        setIsDeleting(false);

        if (error) {
            console.error('Failed to delete recipe:', error);
            return;
        }

        setDeletingRecipeId(null);
        fetchGridData(profile.id);
    };

    return(
        <>
            <div className="profile-page-wrapper">
                <div className="profile-page">
                    <div className="profile-container">
                        {loadingProfile ? (
                            <aside className="profile-sidebar">
                                <div className="skeleton-avatar" />
                                <div className="skeleton-line skeleton-username" />
                                <div className="skeleton-line skeleton-bio" />
                                <div className="skeleton-line skeleton-bio-short" />
                            </aside>
                        ) : (
                            <aside className="profile-sidebar">
                                <img className="profile-avatar"
                                    src={profile.avatar_url ?? ""}
                                    alt=''
                                />
                                <h1 className="profile-username">{profile.username}</h1>
                                {profile.bio && <p className="profile-bio">{profile.bio}</p>}
                                <div className="profile-stats">
                                    <div className="profile-stat">
                                        <span className="stat-number">{recipeCount}</span>
                                        <span className="stat-label">Recipes</span>
                                    </div>
                                    <div className="profile-stat">
                                        <span className="stat-number">{favoriteCount}</span>
                                        <span className="stat-label">Favorites</span>
                                    </div>
                                </div>
                                {isOwnProfile && (
                                    <button className="edit-profile-btn" onClick={() => setIsEditModalOpen(true)}>Edit Profile</button>
                                )}
                            </aside>
                        )}
                        <section className="profile-content">
                            <div className="profile-content-header">
                            <div className="profile-tabs">
                                <button
                                    className={`profile-tab ${activeTab === "recipes" ? "active" : ""}`}
                                    onClick={() => setActiveTab("recipes")}
                                >
                                    {isOwnProfile ? "My Recipes" : "Recipes"}
                                </button>
                                <button
                                    className={`profile-tab ${activeTab === "favorites" ? "active" : ""}`}
                                    onClick={() => setActiveTab("favorites")}
                                >
                                    Favorites
                                </button>
                            </div>
                            {isOwnProfile && (
                                <button className="add-recipe-btn" onClick={() => setIsAddRecipeOpen(true)}>+ Add Recipe</button>
                            )}
                            </div>
                            <div className="profile-recipe-grid">
                            {loadingGrid ? (
                                Array.from({ length: 4 }).map((_, index) => (
                                    <div key={index} className="p-card" />
                                ))
                            ) : gridItems.length === 0 ? (
                                <div className="profile-empty-state">
                                    {activeTab === "recipes" ? (
                                        isOwnProfile ?
                                        "No recipes yet — share your first one." :
                                        `${profile?.username ?? "This user"} hasn't shared any recipes yet.`
                                        ) : (
                                            isOwnProfile ?
                                            "No favorites yet — go find something to save." :
                                            `${profile?.username ?? "This user"} hasn't favorited any recipes yet.`
                                        )
                                    }
                                </div>
                            ) : (
                                <>
                                    {paginatedItems.map((recipe) => (
                                        <Link to={`/recipe/${recipe.id}`} className="p-card" key={recipe.id}>
                                            <div className="p-card-media-wrapper">
                                                <img 
                                                    src={getRecipeImage(recipe) ?? "https://placehold.co"} 
                                                    alt={recipe.title} 
                                                    className="p-card-image" 
                                                />
                                                <span className="p-card-tag">
                                                    {recipe.category?.[0]}
                                                </span>
                                                <FavoriteButton
                                                    recipeId={recipe.id}
                                                    userId={currentUser?.id ?? null}
                                                    isFavorited={favoritedIds.has(recipe.id)}
                                                    onToggle={toggleFavorite}
                                                />
                                            </div>
                                            <div className="p-card-details">
                                                <div className="p-card-header-row">
                                                    <h3 className="p-card-headline">{recipe.title}</h3>
                                                    
                                                    {isOwnProfile && activeTab === "recipes" && (
                                                        <div className="p-card-dashboard-actions">
                                                            <button
                                                            type="button"
                                                            className="p-card-icon-btn p-edit-btn"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setEditingRecipeId(recipe.id);
                                                            }}
                                                            >
                                                                <Pencil size={14} />
                                                            </button>
                                                            <button
                                                            type="button"
                                                            className="p-card-icon-btn p-delete-btn"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setDeletingRecipeId(recipe.id);
                                                            }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </>
                            )}
                            </div>
                            <div className="pp-pagination">
                                <button
                                    className="pp-page-button"
                                    onClick={() => handlePageChange(Math.max(activePage - 1, 1))}
                                    disabled={activePage === 1}
                                >
                                    ←
                                </button>

                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        className={`pp-page-button ${activePage === page ? 'active' : ''}`}
                                        onClick={() => handlePageChange(page)}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    className="pp-page-button"
                                    onClick={() => handlePageChange(Math.min(activePage + 1, totalPages))}
                                    disabled={activePage === totalPages}
                                >
                                    →
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
            <EditProfileModal 
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                currentAvatar={currentAvatar}
                editUsername={editUsername}
                setEditUsername={setEditUsername}
                bio={bio}
                setBio={setBio}
                avatarStyle={avatarStyle}
                setAvatarStyle={setAvatarStyle}
                userId={userId}
                originalUsername={originalUsername}
                onProfileUpdated={(updatedFields) => {
                    setProfile((prev) => prev ? { ...prev, ...updatedFields } : prev);
                }}
            />
            {(isAddRecipeOpen || editingRecipeId) && currentUser && (
                <RecipeFormModal
                    onClose={() => {
                    setIsAddRecipeOpen(false);
                    setEditingRecipeId(null);
                    }}
                    userId={currentUser.id}
                    onRecipeAdded={() => fetchGridData(profile.id)}
                    editRecipeId={editingRecipeId ?? undefined}
                />
            )}
            {deletingRecipeId && (
            <div className="pp-confirm-overlay">
                <div className="pp-confirm-card">
                    <h3>Delete this recipe?</h3>
                    <p>This action cannot be undone. The recipe will be permanently removed.</p>
                    <div className="pp-confirm-actions">
                        <button
                        type="button"
                        className="pp-confirm-cancel-btn"
                        onClick={() => setDeletingRecipeId(null)}
                        disabled={isDeleting}
                        >
                        Cancel
                        </button>
                        <button
                        type="button"
                        className="pp-confirm-delete-btn"
                        onClick={handleDeleteRecipe}
                        disabled={isDeleting}
                        >
                        {isDeleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                </div>
            </div>
            )}
        </>
    );
}