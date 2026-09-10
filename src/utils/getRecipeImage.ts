import { CATEGORIES } from '../constants/categories';

interface RecipeImageInput {
  image_url: string | null;
  category: string[] | null;
}

export function getRecipeImage(recipe: RecipeImageInput): string | undefined {
  if (recipe.image_url) return recipe.image_url;

  const mainCategoryName = recipe.category?.[0];
  const mainCategory = CATEGORIES.find((cat) => cat.name === mainCategoryName);
  return mainCategory?.placeholderImage;
}