import './RecipeDetails.css'
import { Link } from 'react-router-dom'; 
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from './supabaseClient';
import {
    Clock,
    Flame,
    Users,
    Heart,
    Share2,
    CheckCircle2 
} from 'lucide-react'
import { getRecipeImage } from './utils/getRecipeImage';
import { useAuth } from './context/AuthContext';
import FavoriteButton from './components/FavoriteButton';
import { useFavorites } from './hooks/useFavorites';
import { formatTime } from './utils/formatTime';

export default function RecipeDetails(){

    const { id } = useParams();
    const [recipe, setRecipe] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [relatedRecipes, setRelatedRecipes] = useState<any[]>([]);
    const [recipesLoading, setRecipesLoading] = useState(true);
    
    const { currentUser } = useAuth();
    const { favoritedIds, toggleFavorite } = useFavorites(currentUser?.id ?? null);

    const [justCopied, setJustCopied] = useState(false);

    const handleFavoriteToggle = (recipeId: string, newState: boolean) => {
        toggleFavorite(recipeId, newState);
        setRecipe((prev: any) =>
            prev ? { ...prev, favoriteCount: prev.favoriteCount + (newState ? 1 : -1) } : prev
        );
    };

    useEffect(() => {
        if (recipe) {
            document.title = `${recipe.title} | KainPrends`;
        }
        return () => {
            document.title = 'KainPrends';
        };
    }, [recipe]);

    useEffect(() => {
        if (!id) return;
        const fetchRecipe = async () => {
            setLoading(true);
            setRecipe(null);
            
            const { data, error } = await supabase
                .from('recipes')
                .select(`*, profiles (username, avatar_url)`)
                .eq('id', id)
                .single();

            if (error) {
                console.error('Error fetching recipe:', error.message);
                setLoading(false);
                return;
            }

            const { count } = await supabase
                .from('favorites')
                .select('*', { count: 'exact', head: true })
                .eq('recipe_id', id);

            setRecipe({ ...data, favoriteCount: count ?? 0 });
            setLoading(false);
        };
        fetchRecipe();
    }, [id]);

    useEffect(() => {
        if (!id || !recipe) return;
        window.scrollTo(0, 0);

        const fetchRecipes = async () => {
            const { data, error } = await supabase
                .from('recipes')
                .select(`*, profiles (username)`)
                .neq('id', id)
                .overlaps('category', recipe.category);

            if (error) {
                console.log('Error fetching recipes:', error.message);
                setRecipesLoading(false);
                return;
            }

            if (data && data.length > 0) {
                const shuffledRelated = [...data].sort(() => Math.random() - 0.5);
                let combined = shuffledRelated.slice(0, 4);

                if (combined.length < 4) {
                    const { data: fallbackData, error: fallbackError } = await supabase
                        .from('recipes')
                        .select(`*, profiles (username)`)
                        .neq('id', id);

                    if (fallbackError) {
                        console.log('Error fetching fallback recipes:', fallbackError.message);
                    } else if (fallbackData) {
                        const usedIds = new Set(combined.map((r) => r.id));
                        const remainingPool = fallbackData.filter((r) => !usedIds.has(r.id));
                        const shuffledFallback = [...remainingPool].sort(() => Math.random() - 0.5);
                        const needed = 4 - combined.length;
                        combined = [...combined, ...shuffledFallback.slice(0, needed)];
                    }
                }

                setRelatedRecipes(combined);
            } else {
                const { data: fallbackData, error: fallbackError } = await supabase
                    .from('recipes')
                    .select(`*, profiles (username)`)
                    .neq('id', id);

                if (fallbackError) {
                    console.log('Error fetching fallback recipes:', fallbackError.message);
                } else if (fallbackData) {
                    const shuffled = [...fallbackData].sort(() => Math.random() - 0.5);
                    setRelatedRecipes(shuffled.slice(0, 4));
                }
            }
            setRecipesLoading(false);
        };
        fetchRecipes();
    }, [id, recipe]);

        useEffect(() => {
        if (!justCopied) return;
        const timer = setTimeout(() => setJustCopied(false), 2000);
        return () => clearTimeout(timer);
    }, [justCopied]);

    const handleShare = async () => {
        const shareData = {
            title: recipe.title,
            text: `Check out this recipe for ${recipe.title} on KainPrends!`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                if ((err as Error).name !== 'AbortError') {
                    console.error('Share failed:', err);
                }
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                setJustCopied(true);
            } catch (err) {
                console.error('Copy failed:', err);
            }
        }
    };

    if (loading){
        return (
            <div className="recipe-detail-loading">
                <div className='loading-recipe'>
                    <div className="loading-spinner-wrapper">
                        <span className="spinner-large" />
                    </div>
                </div>
            </div>
        );
    } 
    
    if (!recipe) {
        return (
            <>
                <div className="recipe-not-found-wrapper">
                    <div className='no-recipe'>
                        <h2>Recipe not found</h2>
                        <p>The recipe you are looking for might have been deleted or moved.</p>
                        <Link to="/recipes" className="back-home-btn">Browse all recipes</Link>
                    </div>
                </div>
                
            </>
        );
    }

    return(
        <>
            <div className="recipe-detail-page">
                <div className="recipe-hero">
                    <img src={getRecipeImage(recipe) ?? "https://placehold.co"}  alt={recipe.title} className="recipe-hero-image" />

                    <div className="recipe-info-card">
                        <h1 className="recipe-title">{recipe.title}</h1>

                        <div className="recipe-meta">
                            <span><Clock size={16} /> Prep: {formatTime(recipe.prep_time)}</span>
                            <span><Flame size={16} /> Cook: {formatTime(recipe.cook_time)}</span>
                            <span><Users size={16} /> Serves: {recipe.servings}</span>
                        </div>

                        <div className='recipe-actions-row'>
                            <div className="recipe-actions">
                                <FavoriteButton
                                    recipeId={recipe.id}
                                    userId={currentUser?.id ?? null}
                                    isFavorited={favoritedIds.has(recipe.id)}
                                    favoriteCount={recipe.favoriteCount ?? 0}
                                    onToggle={handleFavoriteToggle}
                                    size="large"
                                />
                                <button type="button" className="recipe-action-btn" onClick={handleShare}>
                                    <Share2 size={18} />
                                    <span>Share</span>
                                </button>
                            </div>

                            <Link to={`/profile/${recipe.profiles?.username}`} className="recipe-author-inline">
                                {recipe.profiles?.avatar_url ? (
                                    <img src={recipe.profiles.avatar_url} alt="" className="author-avatar" />
                                ) : (
                                    <div className="author-avatar-fallback">
                                        {recipe.profiles?.username?.charAt(0).toUpperCase()}
                                    </div>
                                )}
                                <span className="author-name">{recipe.profiles?.username}</span>
                            </Link>
                        </div>

                        <div className="recipe-detail-badges">
                            {recipe.category.map((cat: string) => (
                                <span key={cat} className="detail-category-badge">{cat}</span>
                            ))}
                        </div>
                        
                    </div>
                </div>

                <div className="recipe-detail-content">
                    <div className="recipe-ingredients">
                        <h3>Ingredients</h3>
                        <ul className="ingredients-list">
                            {recipe.ingredients.map((item: string, index: number) => (
                            <li key={index} className="ingredient-item">
                                <CheckCircle2 size={18} className="ingredient-icon" />
                                <span>{item}</span>
                            </li>
                            ))}
                        </ul>

                        {recipe.notes && (
                            <div className="recipe-notes">
                            <h3>Chef's Notes</h3>
                            <p>{recipe.notes}</p>
                            </div>
                        )}
                    </div>

                    <div className="recipe-steps">
                        <h3>Steps</h3>
                        <ol className="steps-list">
                            {recipe.steps.map((step: string, index: number) => (
                            <li key={index} className="step-item">
                                <span className="step-number">{String(index + 1).padStart(2, '0')}</span>
                                <span className="step-text">{step}</span>
                            </li>
                            ))}
                        </ol>
                    </div>
                </div>

                <div className='related-recipes-section'>
                    <div className="related-recipes-heading">
                        <h2>You might also like</h2>
                    </div>

                    {recipesLoading ? (
                        <div className="related-recipe-grid">
                            {Array.from({ length: 4 }).map((_, index) => (
                                <div key={index} className="recipe-card-skeleton" />
                            ))}
                        </div>
                        ) : (
                        <div className='related-recipe-grid'>
                            {relatedRecipes.map((recipe) => (
                                <Link to={`/recipe/${recipe.id}`} className="related-recipe-card" key={recipe.id}>
                                    <div className="related-recipe-image-wrapper">
                                        <img src={getRecipeImage(recipe) ?? "https://placehold.co"} alt={recipe.title} className="related-recipe-image" />
                                        <span className="related-recipe-category">{recipe.category[0]}</span>
                                        <button type="button" className="recipe-card-heart">
                                            <Heart size={20} color="#e16162" />
                                        </button>
                                    </div>
                                    <div className="related-recipe-body">
                                        <h3 className="related-recipe-title">{recipe.title}</h3>
                                        <p className="related-recipe-author">By {recipe.profiles?.username}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )} 
                </div>
            </div>
        </>
    );
}