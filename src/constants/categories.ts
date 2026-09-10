import { Coffee, Sandwich, UtensilsCrossed, IceCreamCone, Cookie, Martini, Leaf } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface Category {
  name: string;
  icon: LucideIcon;
  placeholderImage: string;
}

export const CATEGORIES: Category[] = [
  { name: "Breakfast", icon: Coffee, placeholderImage: "https://osbxyqlyuriwxcaerpew.supabase.co/storage/v1/object/public/recipes/recipe-photos/placeholders/breakfast.png"},
  { name: "Lunch", icon: Sandwich, placeholderImage: "https://osbxyqlyuriwxcaerpew.supabase.co/storage/v1/object/public/recipes/recipe-photos/placeholders/lunch.png" },
  { name: "Dinner", icon: UtensilsCrossed, placeholderImage: "https://osbxyqlyuriwxcaerpew.supabase.co/storage/v1/object/public/recipes/recipe-photos/placeholders/dinner.png" },
  { name: "Dessert", icon: IceCreamCone, placeholderImage: "https://osbxyqlyuriwxcaerpew.supabase.co/storage/v1/object/public/recipes/recipe-photos/placeholders/dessert.jpg" },
  { name: "Snacks", icon: Cookie, placeholderImage: "https://osbxyqlyuriwxcaerpew.supabase.co/storage/v1/object/public/recipes/recipe-photos/placeholders/snacks.png" },
  { name: "Drinks", icon: Martini,placeholderImage: "https://osbxyqlyuriwxcaerpew.supabase.co/storage/v1/object/public/recipes/recipe-photos/placeholders/drinks.png" },
  { name: "Vegan", icon: Leaf, placeholderImage:"https://osbxyqlyuriwxcaerpew.supabase.co/storage/v1/object/public/recipes/recipe-photos/placeholders/vegan.png" },
];