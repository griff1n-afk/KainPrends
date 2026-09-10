import './IngredientsSection.css'

interface Ingredient {
  id: string;
  text: string;
}

interface IngredientsSectionProps {
  ingredients: Ingredient[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, value: string) => void;
}

export default function IngredientsSection({
  ingredients,
  onAdd,
  onRemove,
  onUpdate,
}: IngredientsSectionProps) {
  return (
    <div className="is-container">
      {ingredients.map((ing) => (
        <div className="is-row" key={ing.id}>
          <input
            type="text"
            className="is-text"
            placeholder="e.g. 2 cups flour, or Salt to taste"
            value={ing.text}
            onChange={(e) => onUpdate(ing.id, e.target.value)}
          />
          <button
            type="button"
            className="is-remove-btn"
            onClick={() => onRemove(ing.id)}
          >
            &times;
          </button>
        </div>
      ))}

      <button type="button" className="is-add-btn" onClick={onAdd}>
        + Add Ingredient
      </button>
    </div>
  );
}