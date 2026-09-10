import './ExploreRecipeCard.css'
import { useNavigate } from 'react-router-dom';
import type { Recipe } from '../types';
import { getRecipeImage } from '../utils/getRecipeImage';
import { Clock, Users } from 'lucide-react';
import FavoriteButton from './FavoriteButton';
import { formatTime } from '../utils/formatTime';


interface ExploreRecipeCardProps {
  recipe: Recipe;
  userId: string | null;
  isFavorited: boolean;
  onToggleFavorite: (recipeId: string, newState: boolean) => void;
}

export default function ExploreRecipeCard({ recipe, userId, isFavorited, onToggleFavorite }: ExploreRecipeCardProps) {

  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/recipe/${recipe.id}`);
  };

  return (
    <div className="explore-card" onClick={handleCardClick}>
      <div className="explore-card-photo-wrap">
        <img src={getRecipeImage(recipe)} alt={recipe.title} />
        <FavoriteButton
          recipeId={recipe.id}
          userId={userId}
          isFavorited={isFavorited}
          onToggle={onToggleFavorite}
        />
      </div>

      <div className="explore-card-info">
        <div className="explore-card-badges">
          {recipe.category.slice(0, 2).map((cat) => (
            <span key={cat} className="explore-card-badge">{cat}</span>
          ))}
        </div>
        <h3 className="explore-card-title">{recipe.title}</h3>

        <div className="explore-card-stats">
          <span><Clock size={14} /> {formatTime(recipe.prep_time + recipe.cook_time)}</span>
          <span><Users size={14} /> {recipe.servings} servings</span>
        </div>
      </div>
    </div>
  );
}