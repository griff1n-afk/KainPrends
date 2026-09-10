import { Heart } from 'lucide-react';
import './FavoriteButton.css';
import { useAuthModal } from '../context/AuthModalContext';

interface FavoriteButtonProps {
  recipeId: string;
  userId: string | null;
  isFavorited: boolean;
  favoriteCount?: number;
  onToggle: (recipeId: string, newState: boolean) => void;
  size?: 'small' | 'large';
}

export default function FavoriteButton({
  recipeId,
  userId,
  isFavorited,
  favoriteCount,
  onToggle,
  size = 'small',
}: FavoriteButtonProps) {

  const { openAuthModal } = useAuthModal();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId) {
      openAuthModal('login');
      return;
    }

    onToggle(recipeId, !isFavorited);
  };

  return (
    <button
      type="button"
      className={`fb-button fb-${size} ${isFavorited ? 'favorited' : ''}`}
      onClick={handleClick}
    >
      <Heart size={size === 'small' ? 18 : 20} className="fb-icon" />
      {favoriteCount !== undefined && <span className="fb-count">{favoriteCount}</span>}
    </button>
  );
}