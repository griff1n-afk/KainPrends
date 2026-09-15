import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from './supabaseClient';
import { Link } from 'react-router-dom';
import './HomePage.css'
import { useAuth } from './context/AuthContext';
import { useAuthModal } from './context/AuthModalContext'
import { Heart } from 'lucide-react';
import { Coffee, Sandwich, UtensilsCrossed, IceCreamCone, Cookie, Martini, Leaf, Compass, ChefHat } from 'lucide-react';
import { getRecipeImage } from './utils/getRecipeImage';
import FavoriteButton from './components/FavoriteButton'
import { useFavorites } from './hooks/useFavorites'; 

import hero1 from './assets/heroimage1.png';
import hero2 from './assets/heroimage2.png';
import hero3 from './assets/heroimage3.png';
import hero4 from './assets/heroimage4.png';
import aboutimage from './assets/aboutimage1.png';


export default function HomePage(){

    const { currentUser } = useAuth();
    const { openAuthModal } = useAuthModal();
    const navigate = useNavigate();

    const heroImages = [
        hero1,
        hero2,
        hero3,
        hero4
    ];
    const [currentSlide, setCurrentSlide] = useState(0);
    const [recipes, setRecipes] = useState<any[]>([]);
    const [recipesLoading, setRecipesLoading] = useState(true);

    const categories = [
        { name: 'Breakfast', icon: Coffee },
        { name: 'Lunch', icon: Sandwich },
        { name: 'Dinner', icon: UtensilsCrossed },
        { name: 'Dessert', icon: IceCreamCone },
        { name: 'Snacks', icon: Cookie },
        { name: 'Drinks', icon: Martini },
        { name: 'Vegan', icon: Leaf },
    ];

    const { favoritedIds, toggleFavorite } = useFavorites(currentUser?.id ?? null);

    useEffect(() => {
        document.title = 'Home | KainPrends';
        return () => {
            document.title = 'KainPrends';
        };
    }, []);

    useEffect ( () => {
        const interval = setInterval( () => {
            setCurrentSlide( (prev) => (prev + 1) % heroImages.length)
        }, 6000);
        return () => clearInterval(interval);
    }, [heroImages.length]);

    useEffect( () => {
        const fetchRecipes = async () => {
            const { data, error } = await supabase
            .from('recipes')
            .select(`*,profiles (username)`);
            if (error) {
                console.log('Error fetching recipes:', error.message);
            } else if(data){
                const shuffled = [...data].sort(() => Math.random() - 0.5);
                setRecipes(shuffled.slice(0, 6));
            }
            setRecipesLoading(false);
        };
        fetchRecipes();
    }, [])

    return(
        <>
            <section className='hero-section'>
                <div className='hero-carousel'>
                    {heroImages.map( (image,index) => (
                        <div
                            key={index}
                            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
                            style={{ backgroundImage: `url(${image})`}}
                        />
                    ))}
                </div>

                <div className='hero-overlay-tint' />

                <div className='hero-content'>
                    <h1 className='hero-headline'>Find Your Next Favourite Meal</h1>
                    <p className='hero-subtext'>Thousands of quick, family-approved recipes right at your fingertips. Search simple dishes, save your top choices, and make mealtime effortless.</p>
                    <button className='hero-cta' type="button" onClick={() => navigate('/recipes')}>Explore Recipes</button>
                </div>

                <div className="hero-dots">
                    {heroImages.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={`hero-dot ${index === currentSlide ? 'active' : ''}`}
                            onClick={() => setCurrentSlide(index)}
                        />
                    ))}
                </div>
            </section>

            <div className='recipe-section'>
                <div className="section-header">
                    <h2>Fresh From the Community</h2>
                    <p>Handpicked recipes shared by home cooks like you</p>
                </div>
                <Link to="/recipes" className="see-all-link">See all</Link>

                {recipesLoading ? (
                    <div className="recipe-grid">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className="recipe-card-skeleton" />
                        ))}
                    </div>
                ) : (
                    <div className='recipe-grid'>
                        {recipes.map((recipe) => (
                            <Link to={`/recipe/${recipe.id}`} className="recipe-card" key={recipe.id}>
                                <div className="recipe-card-image-wrapper">
                                    <img src={getRecipeImage(recipe) ?? "https://placehold.co"} alt={recipe.title} className="recipe-card-image" />
                                    <span className="recipe-card-category">{recipe.category[0]}</span>
                                    <FavoriteButton
                                        recipeId={recipe.id}
                                        userId={currentUser?.id ?? null}
                                        isFavorited={favoritedIds.has(recipe.id)}
                                        onToggle={toggleFavorite}
                                    />
                                </div>
                                <div className="recipe-card-body">
                                    <h3 className="recipe-card-title">{recipe.title}</h3>
                                    <p className="recipe-card-author">By {recipe.profiles?.username}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )} 
            </div>

            <div className='category-section'>
                <div className="category-section-header">
                    <h2>Browse by Category</h2>
                    <p>Find exactly what you're craving</p>
                </div>
                <div className="category-row">
                    {categories.map(({ name, icon: Icon }) => (
                        <button
                            key={name}
                            type="button"
                            className="category-pill"
                            onClick={() => navigate(`/recipes?category=${name}`)}
                        >
                            <Icon size={16} />
                            {name}
                        </button>
                    ))}
                </div>
            </div>

            <div className="about-section">
                <div className="about-text">
                    <h2>About KainPrends</h2>
                    <p>
                        KainPrends is a place for home cooks to discover, save, and share real recipes 
                        from real people. No fluff, no filler — just genuine dishes from a growing community 
                        of people who love to cook.
                    </p>
                    <Link to="/about" className="about-link">Learn more →</Link>

                    <div className="about-highlights">
                        <div className="highlight">
                            <Compass size={20} />
                            <span>Discover new recipes</span>
                        </div>
                        <div className="highlight">
                            <Heart size={20} />
                            <span>Save your favorites</span>
                        </div>
                        <div className="highlight">
                            <ChefHat size={20} />
                            <span>Share your own creations</span>
                        </div>
                    </div>

                    <div className="homepage-about-cta">
                        {currentUser ? (
                            <button type="button" onClick={() => navigate('/recipe/new')}>
                                Share Your Recipe
                            </button>
                        ) : (
                            <button type="button" onClick={() => openAuthModal('signup')}>
                                Join KainPrends
                            </button>
                        )}
                    </div>
                </div>

                <div className="about-image">
                    <img src={aboutimage} alt="Home cooking" />
                </div>
            </div>
        </>
    );
}