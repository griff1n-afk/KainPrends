import './RecipesPage.css'
import { Link, useSearchParams  } from 'react-router-dom';
import { useEffect, useState, useRef  } from 'react';
import { supabase } from './supabaseClient';
import { Clock, Users, Carrot, ArrowRight, Search, ChevronDown  } from 'lucide-react';
import type { Recipe } from './types';
import ExploreRecipeCard from './components/ExploreRecipeCard';
import { getRecipeImage } from './utils/getRecipeImage'
import { useAuth } from './context/AuthContext';
import { useFavorites } from './hooks/useFavorites';
import { formatTime } from './utils/formatTime';
import { KNOWN_PHRASES } from './constants/knownPhrases';

const SEARCH_STOPWORDS = ['and', 'with', 'the', 'a', 'an', 'or', 'of'];

export default function RecipesPage(){

    const [searchParams, setSearchParams] = useSearchParams();

    const { currentUser } = useAuth();
    const { favoritedIds, toggleFavorite } = useFavorites(currentUser?.id ?? null);

    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchText, setSearchText] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [timeFilter, setTimeFilter] = useState<'under30' | 'under60' | null>(null);
    const [currentPage, setCurrentPage] = useState(1);

    const isFiltering = searchText.trim() !== '' || selectedCategories.length > 0 || timeFilter !== null;

    const featuredRecipe = recipes.length > 0
    ? [...recipes].sort((a, b) => (b.favorites[0]?.count ?? 0) - (a.favorites[0]?.count ?? 0))[0]
    : null;

    const toggleCategory = (cat: string) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const selectTimeFilter = (value: 'under30' | 'under60') => {
        setTimeFilter((prev) => (prev === value ? null : value));
    };

    const [sortOption, setSortOption] = useState<'newest' | 'oldest' | 'quickest' | 'az'>('newest');
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortDropdownRef = useRef<HTMLDivElement>(null);

    const sortLabels: Record<typeof sortOption, string> = {
        newest: 'Newest',
        oldest: 'Oldest',
        quickest: 'Quickest',
        az: 'A–Z',
    };

    useEffect(() => {
        document.title = 'Recipes | KainPrends';
        return () => {
            document.title = 'KainPrends';
        };
    }, []);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
            setSortDropdownOpen(false);
            }
        }

        if (sortDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [sortDropdownOpen]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchText, selectedCategories, timeFilter, sortOption]);

    const filteredRecipes = recipes
        .filter((recipe) => {
            const matchesSearch = searchText.trim() === '' || (() => {
                const fullSearch = searchText.trim().toLowerCase();

                const matchedPhrase = KNOWN_PHRASES.find((phrase) => fullSearch.includes(phrase));

                if (matchedPhrase) {
                    return recipe.title.toLowerCase().includes(matchedPhrase) ||
                    recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(matchedPhrase));
                }

                const searchWords = fullSearch
                    .split(/\s+/)
                    .filter((word) => !SEARCH_STOPWORDS.includes(word));

                if (searchWords.length === 0) return false;

                return searchWords.every((word) => 
                    recipe.title.toLowerCase().includes(word) ||
                    recipe.ingredients.some((ingredient) => ingredient.toLowerCase().includes(word))
                );
            })();

            const matchesCategory = selectedCategories.length === 0 || 
                selectedCategories.some((cat) => recipe.category.includes(cat));

            const totalTime = recipe.prep_time + recipe.cook_time;
            const matchesTime = timeFilter === null ||
                (timeFilter === 'under30' && totalTime < 30) ||
                (timeFilter === 'under60' && totalTime < 60);

            return matchesSearch && matchesCategory && matchesTime;
        })
        .sort((a, b) => {
            const search = searchText.trim().toLowerCase();
            const relevanceApplies = search !== '' && (sortOption === 'newest' || sortOption === 'oldest');

            if (relevanceApplies) {
                const aTitleMatch = a.title.toLowerCase().includes(search);
                const bTitleMatch = b.title.toLowerCase().includes(search);
                if (aTitleMatch && !bTitleMatch) return -1;
                if (!aTitleMatch && bTitleMatch) return 1;
            }

            switch (sortOption) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'oldest':
                    return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                case 'quickest':
                    return (a.prep_time + a.cook_time) - (b.prep_time + b.cook_time);
                case 'az':
                    return a.title.localeCompare(b.title);
                default:
                    return 0;
            }
        });
    

    useEffect(() => {
        async function fetchRecipes() {
            const { data, error } = await supabase
            .from('recipes')
            .select('*, favorites(count)');

            if (error) {
                console.error('Error fetching recipes:', error);
            } else {
                setRecipes(data as Recipe[]);
            }
            setLoading(false);
        }

        fetchRecipes();
    }, []);

    function getExploreHeading(): string {
        if (searchText.trim() !== '') {
            return `Search results for "${searchText.trim()}"`;
        }

        if (selectedCategories.length > 0) {
            if (selectedCategories.length === 1) {
            return `${selectedCategories[0]} Recipes`;
            }
            if (selectedCategories.length === 2) {
            return `${selectedCategories[0]} & ${selectedCategories[1]} Recipes`;
            }
            return `${selectedCategories[0]}, ${selectedCategories[1]} & ${selectedCategories.length - 2} more`;
        }

        if (timeFilter) {
            return timeFilter === 'under30' ? 'Quick Recipes (Under 30 min)' : 'Quick Recipes (Under 1 hr)';
        }

        return 'Explore Recipes';
    }

    const RECIPES_PER_PAGE = 12;

    const totalPages = Math.ceil(filteredRecipes.length / RECIPES_PER_PAGE);

    const paginatedRecipes = filteredRecipes.slice(
        (currentPage - 1) * RECIPES_PER_PAGE,
        currentPage * RECIPES_PER_PAGE
    );

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        document.querySelector('.explore-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    useEffect(() => {
        const categoryFromUrl = searchParams.get('category');
        const searchFromUrl = searchParams.get('search');
        const timeFromUrl = searchParams.get('time');

        if (categoryFromUrl) {
            setSelectedCategories(categoryFromUrl.split(','));
        }
        if (searchFromUrl) {
            setSearchText(searchFromUrl);
        }
        if (timeFromUrl === 'under30' || timeFromUrl === 'under60') {
            setTimeFilter(timeFromUrl);
        }
    }, []);

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const params: Record<string, string> = {};
            if (searchText.trim()) params.search = searchText.trim();
            if (selectedCategories.length > 0) params.category = selectedCategories.join(',');
            if (timeFilter) params.time = timeFilter;

            setSearchParams(params, { replace: true });
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchText, selectedCategories, timeFilter]);

    return (
        <>
            <div className="recipes-page">

                <section className="discover-section">
                    <h1 className="discover-headline">What are you cooking today?</h1>
                    <div className="search-bar">
                        <Search size={18} className="search-icon" />
                        <input 
                            type="text" 
                            placeholder="Search recipes or ingredients..." 
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                        />
                    </div>

                    <h2 className="discover-subheading">Or explore by category</h2>

                    <div className="quick-picks">
                        <div className="category-picks">
                            <button
                                className={`category-chip ${selectedCategories.includes('Breakfast') ? 'selected' : ''}`}
                                onClick={() => toggleCategory('Breakfast')}
                            >
                            Breakfast
                            </button>
                            <button
                                className={`category-chip ${selectedCategories.includes('Lunch') ? 'selected' : ''}`}
                                onClick={() => toggleCategory('Lunch')}
                            >
                            Lunch
                            </button>
                            <button
                                className={`category-chip ${selectedCategories.includes('Dinner') ? 'selected' : ''}`}
                                onClick={() => toggleCategory('Dinner')}
                            >
                            Dinner
                            </button>
                            <button
                                className={`category-chip ${selectedCategories.includes('Dessert') ? 'selected' : ''}`}
                                onClick={() => toggleCategory('Dessert')}
                            >
                            Dessert
                            </button>
                            <button
                                className={`category-chip ${selectedCategories.includes('Snacks') ? 'selected' : ''}`}
                                onClick={() => toggleCategory('Snacks')}
                            >
                            Snacks
                            </button>
                            <button
                                className={`category-chip ${selectedCategories.includes('Drinks') ? 'selected' : ''}`}
                                onClick={() => toggleCategory('Drinks')}
                            >
                            Drinks
                            </button>
                            <button
                                className={`category-chip ${selectedCategories.includes('Vegan') ? 'selected' : ''}`}
                                onClick={() => toggleCategory('Vegan')}
                            >
                            Vegan
                            </button>

                        </div>

                        <div className="picks-divider" />

                        <div className="time-picks">
                            <button
                                className={`time-chip ${timeFilter === 'under30' ? 'selected' : ''}`}
                                onClick={() => selectTimeFilter('under30')}
                            >
                            Under 30 min
                            </button>
                            <button
                                className={`time-chip ${timeFilter === 'under60' ? 'selected' : ''}`}
                                onClick={() => selectTimeFilter('under60')}
                            >
                            Under 1 hr
                            </button>
                        </div>
                    </div>
                </section>

                {loading ? (
                    <div className="skeleton-wrapper">
                        <div className="skeleton-featured">
                            <div className="skeleton-photo" />
                            <div className="skeleton-info">
                                <div className="skeleton-line skeleton-badge" />
                                <div className="skeleton-line skeleton-title" />
                                <div className="skeleton-line skeleton-text" />
                            </div>
                        </div>

                        <div className="skeleton-grid">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div className="skeleton-card" key={i}>
                                    <div className="skeleton-photo" />
                                    <div className="skeleton-info">
                                        <div className="skeleton-line skeleton-badge" />
                                        <div className="skeleton-line skeleton-title" />
                                        <div className="skeleton-line skeleton-text" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    ) : (
                    <>
                        {!isFiltering && featuredRecipe && (
                            <section className="featured-section">
                                <h2 className="featured-heading">Featured From KainPrends</h2>

                                <Link to={`/recipe/${featuredRecipe.id}`} className="featured-card">
                                    <div className="featured-photo-wrap">
                                        <img
                                            src={getRecipeImage(featuredRecipe)}
                                            alt={featuredRecipe.title}
                                            className="featured-photo"
                                        />
                                    </div>

                                    <div className="featured-info">
                                        <div className="featured-badges">
                                            {featuredRecipe.category.slice(0, 2).map((cat) => (
                                                <span key={cat} className="featured-badge">{cat}</span>
                                            ))}
                                        </div>

                                        <h3 className="featured-title">{featuredRecipe.title}</h3>

                                        <div className="featured-stats">
                                            <span><Clock size={16} /> {formatTime(featuredRecipe.prep_time + featuredRecipe.cook_time)}</span>
                                            <span><Users size={16} /> {featuredRecipe.servings} servings</span>
                                            <span><Carrot size={16} /> {featuredRecipe.ingredients.length} ingredients</span>
                                        </div>

                                        <span className="featured-cta">View Recipe <ArrowRight size={16} /></span>
                                    </div>
                                </Link>
                            </section>
                        )}

                        <section className={`explore-section ${isFiltering ? 'explore-section-tight' : ''}`}>
                            <div className="explore-header">
                                <div>
                                    <h2 className="explore-heading">
                                        {getExploreHeading()}
                                    </h2>
                                    <span className="explore-count">{filteredRecipes.length} recipes</span>
                                </div>

                                <div className="sort-control">
                                    Sort by:
                                    <div className="custom-select" ref={sortDropdownRef}>
                                        <button
                                        className="custom-select-trigger"
                                        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                        >
                                        {sortLabels[sortOption]}
                                        <ChevronDown size={16} />
                                        </button>

                                        {sortDropdownOpen && (
                                        <ul className="custom-select-options">
                                            {(['newest', 'oldest', 'quickest', 'az'] as const).map((option) => (
                                            <li
                                                key={option}
                                                className={sortOption === option ? 'selected' : ''}
                                                onClick={() => {
                                                setSortOption(option);
                                                setSortDropdownOpen(false);
                                                }}
                                            >
                                                {sortLabels[option]}
                                            </li>
                                            ))}
                                        </ul>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="active-filters">
                                {searchText.trim() !== '' && (
                                    <span className="filter-badge">
                                    "{searchText}"
                                    <button onClick={() => setSearchText('')}>×</button>
                                    </span>
                                )}

                                {selectedCategories.map((cat) => (
                                    <span key={cat} className="filter-badge">
                                    {cat}
                                    <button onClick={() => setSelectedCategories(selectedCategories.filter((c) => c !== cat))}>×</button>
                                    </span>
                                ))}

                                {timeFilter && (
                                    <span className="filter-badge">
                                    {timeFilter === 'under30' ? 'Under 30 min' : 'Under 1 hr'}
                                    <button onClick={() => setTimeFilter(null)}>×</button>
                                    </span>
                                )}

                                {isFiltering && (
                                    <button className="clear-all-button" onClick={() => {
                                    setSearchText('');
                                    setSelectedCategories([]);
                                    setTimeFilter(null);
                                    }}>
                                    Clear all
                                    </button>
                                )}
                            </div>

                            {filteredRecipes.length > 0 ? (
                                <>
                                    <div className="results-grid">
                                        {paginatedRecipes.map((recipe) => (
                                            <ExploreRecipeCard 
                                                key={recipe.id} 
                                                recipe={recipe} 
                                                userId={currentUser?.id ?? null}
                                                isFavorited={favoritedIds.has(recipe.id)}
                                                onToggleFavorite={toggleFavorite}
                                            />
                                        ))}
                                    </div>

                                    <div className="pagination">
                                        <button
                                            className="page-button"
                                            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
                                            disabled={currentPage === 1}
                                        >
                                            ←
                                        </button>

                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                            <button
                                            key={page}
                                            className={`page-button ${currentPage === page ? 'active' : ''}`}
                                            onClick={() => handlePageChange(page)}
                                            >
                                            {page}
                                            </button>
                                        ))}

                                        <button
                                            className="page-button"
                                            onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
                                            disabled={currentPage === totalPages}
                                        >
                                            →
                                        </button>
                                    </div>
                                </>
                            ) : (
                            <div className="no-results">
                                    <p>No recipes found{searchText.trim() !== '' ? ` for "${searchText.trim()}"` : ''}.</p>
                                    <p>Try adjusting your filters or search.</p>
                                </div> 
                            )}
                        </section>
                    </>
                )}

            </div>
        </>
    );
}