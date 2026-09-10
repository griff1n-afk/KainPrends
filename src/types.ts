export interface Recipe {
  id: string;
  title: string;
  category: string[];
  prep_time: number;
  cook_time: number;
  servings: string;
  ingredients: string[];
  steps: string[];
  image_url: string;
  created_at: string;
  favorites: { count: number }[];
}