import { CATEGORIES } from '../../../constants/categories';
import { Star } from 'lucide-react'
import './BasicsSection.css'

interface BasicsSectionProps {
  selectedCategories: string[];
  onToggleCategory: (categoryName: string) => void;
  title: string;
  onTitleChange: (value: string) => void;
  prepTime: string;
  onPrepTimeChange: (value: string) => void;
  cookTime: string;
  onCookTimeChange: (value: string) => void;
  servings: string;
  onServingsChange: (value: string) => void;
}


export default function BasicsSection({ selectedCategories,
  onToggleCategory,
  title,
  onTitleChange,
  prepTime,
  onPrepTimeChange,
  cookTime,
  onCookTimeChange,
  servings,
  onServingsChange,
}: BasicsSectionProps) {
  return (
    <div className="bs-container">
      <div className="bs-field">
        <label className="bs-label">Recipe Title</label>
        <input
          type="text"
          className="bs-input"
          placeholder="Enter descriptive title..."
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
        />
      </div>

      <div className="bs-field">
        <label className="bs-label">Category</label>
        <div className="bs-badge-group">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategories.includes(cat.name);
            const isMain = selectedCategories[0] === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                className={`bs-badge ${isSelected ? 'selected' : ''} ${isMain ? 'main' : ''}`}
                onClick={() => onToggleCategory(cat.name)}
              >
                {isMain && <Star size={10} className="bs-badge-star" />}
                <Icon size={16} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bs-row">
        <div className="bs-field">
          <label className="bs-label">Prep Time</label>
          <div className="bs-input-suffix">
            <input
              type="number"
              className="bs-input"
              placeholder="0"
              min="0"
              value={prepTime}
              onChange={(e) => onPrepTimeChange(e.target.value)}
            />
            <span className="bs-suffix">mins</span>
          </div>
        </div>

        <div className="bs-field">
          <label className="bs-label">Cook Time</label>
          <div className="bs-input-suffix">
            <input
              type="number"
              className="bs-input"
              placeholder="0"
              min="0"
              value={cookTime}
              onChange={(e) => onCookTimeChange(e.target.value)}
            />
            <span className="bs-suffix">mins</span>
          </div>
        </div>

        <div className="bs-field">
          <label className="bs-label">Servings</label>
          <div className="bs-input-suffix">
            <input
              type="text"
              className="bs-input"
              placeholder="0"
              min="0"
              value={servings}
              onChange={(e) => onServingsChange(e.target.value)}
            />
            <span className="bs-suffix">ppl</span>
          </div>
        </div>
      </div>
    </div>
  );
}