export interface Ingredient {
  id: string;
  name: string;
  caloriesPer100g: number;
  proteinPer100g: number;
  unit: 'g' | 'ml' | 'pieces';
}

export interface RecipeIngredient {
  ingredientId: string;
  quantity: number;
  ingredient?: Ingredient; // Populated when needed
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  totalCalories: number;
  totalProtein: number;
}

export type MealType = 'breakfast' | 'morning_snack' | 'lunch' | 'evening_snack' | 'dinner';

export interface Meal {
  id: string;
  type: MealType;
  recipeId: string;
  recipe?: Recipe; // Populated when needed
  calories: number;
  protein: number;
  quantity: number; // Multiplier for the recipe (e.g., 1.5 = 1.5x the recipe)
}

export interface Day {
  id: string;
  date: string; // YYYY-MM-DD format
  meals: Meal[];
  totalCalories: number;
  totalProtein: number;
}

export interface NutritionTotals {
  calories: number;
  protein: number;
}

export interface NutritionGoals {
  dailyCalories: number;
  dailyProtein: number;
  weeklyCalories: number;
  weeklyProtein: number;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  createdAt: Date;
  goals?: NutritionGoals;
}

export interface UserMealPlan {
  userId: string;
  days: Day[];
}

export interface ShoppingListItem {
  ingredientId: string;
  ingredientName: string;
  totalQuantity: number;
  unit: 'g' | 'ml' | 'pieces';
  recipes: string[]; // Recipe names that use this ingredient
  checked: boolean;
}

export interface ShoppingList {
  userId: string;
  items: ShoppingListItem[];
  createdAt: Date;
  updatedAt: Date;
}
