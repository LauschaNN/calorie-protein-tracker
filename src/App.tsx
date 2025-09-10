import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import IngredientManager from './components/IngredientManager';
import RecipeBuilder from './components/RecipeBuilder';
import MealPlanner from './components/MealPlanner';
import WeeklyOverview from './components/WeeklyOverview';
import UserManager from './components/UserManager';
import GoalsManager from './components/GoalsManager';
import GlobalOverview from './components/GlobalOverview';
import type { Ingredient, Recipe, Day, Meal, MealType, NutritionTotals, User, UserMealPlan, NutritionGoals, ShoppingList, ShoppingListItem } from './types';

function App() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userMealPlans, setUserMealPlans] = useState<UserMealPlan[]>([]);
  const [shoppingLists, setShoppingLists] = useState<ShoppingList[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'people' | 'ingredients' | 'recipes' | 'planner' | 'overview' | 'global'>('people');

  // Load sample data on first load
  useEffect(() => {
    const sampleIngredients: Ingredient[] = [
      { id: '1', name: 'Chicken Breast', caloriesPer100g: 165, proteinPer100g: 31, unit: 'g' },
      { id: '2', name: 'Brown Rice', caloriesPer100g: 111, proteinPer100g: 2.6, unit: 'g' },
      { id: '3', name: 'Broccoli', caloriesPer100g: 34, proteinPer100g: 2.8, unit: 'g' },
      { id: '4', name: 'Eggs', caloriesPer100g: 155, proteinPer100g: 13, unit: 'g' },
      { id: '5', name: 'Oatmeal', caloriesPer100g: 68, proteinPer100g: 2.4, unit: 'g' },
      { id: '6', name: 'Greek Yogurt', caloriesPer100g: 59, proteinPer100g: 10, unit: 'g' },
      { id: '7', name: 'Salmon', caloriesPer100g: 208, proteinPer100g: 25, unit: 'g' },
      { id: '8', name: 'Sweet Potato', caloriesPer100g: 86, proteinPer100g: 1.6, unit: 'g' },
      { id: '9', name: 'Spinach', caloriesPer100g: 23, proteinPer100g: 2.9, unit: 'g' },
      { id: '10', name: 'Almonds', caloriesPer100g: 579, proteinPer100g: 21, unit: 'g' },
      { id: '11', name: 'Banana', caloriesPer100g: 89, proteinPer100g: 1.1, unit: 'g' },
      { id: '12', name: 'Quinoa', caloriesPer100g: 120, proteinPer100g: 4.4, unit: 'g' },
    ];
    setIngredients(sampleIngredients);

    const sampleRecipes: Recipe[] = [
      {
        id: 'r1',
        name: 'Protein Power Bowl',
        ingredients: [
          { ingredientId: '1', quantity: 150 }, // Chicken Breast
          { ingredientId: '2', quantity: 100 }, // Brown Rice
          { ingredientId: '3', quantity: 80 },  // Broccoli
          { ingredientId: '9', quantity: 50 },  // Spinach
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'r2',
        name: 'Greek Yogurt Parfait',
        ingredients: [
          { ingredientId: '6', quantity: 200 }, // Greek Yogurt
          { ingredientId: '11', quantity: 100 }, // Banana
          { ingredientId: '10', quantity: 20 },  // Almonds
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'r3',
        name: 'Salmon & Quinoa',
        ingredients: [
          { ingredientId: '7', quantity: 120 }, // Salmon
          { ingredientId: '12', quantity: 80 }, // Quinoa
          { ingredientId: '8', quantity: 100 }, // Sweet Potato
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'r4',
        name: 'Veggie Omelette',
        ingredients: [
          { ingredientId: '4', quantity: 200 }, // Eggs
          { ingredientId: '3', quantity: 60 },  // Broccoli
          { ingredientId: '9', quantity: 30 },  // Spinach
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'r5',
        name: 'Oatmeal Delight',
        ingredients: [
          { ingredientId: '5', quantity: 50 },  // Oatmeal
          { ingredientId: '11', quantity: 80 }, // Banana
          { ingredientId: '10', quantity: 15 }, // Almonds
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
    ];

    // Calculate nutrition for each recipe
    const recipesWithNutrition = sampleRecipes.map(recipe => {
      const nutrition = recipe.ingredients.reduce(
        (totals, recipeIngredient) => {
          const ingredient = sampleIngredients.find(ing => ing.id === recipeIngredient.ingredientId);
          if (!ingredient) return totals;

          const calories = (ingredient.caloriesPer100g * recipeIngredient.quantity) / 100;
          const protein = (ingredient.proteinPer100g * recipeIngredient.quantity) / 100;

          return {
            calories: totals.calories + calories,
            protein: totals.protein + protein,
          };
        },
        { calories: 0, protein: 0 }
      );

      return {
        ...recipe,
        totalCalories: nutrition.calories,
        totalProtein: nutrition.protein,
      };
    });

    setRecipes(recipesWithNutrition);

    // Add sample users with goals
    const sampleUsers: User[] = [
      {
        id: 'u1',
        name: 'John Smith',
        email: 'john@example.com',
        createdAt: new Date('2024-01-15'),
        goals: {
          dailyCalories: 2500,
          dailyProtein: 180,
          weeklyCalories: 17500,
          weeklyProtein: 1260,
        },
      },
      {
        id: 'u2',
        name: 'Sarah Johnson',
        email: 'sarah@example.com',
        createdAt: new Date('2024-01-20'),
        goals: {
          dailyCalories: 2000,
          dailyProtein: 120,
          weeklyCalories: 14000,
          weeklyProtein: 840,
        },
      },
      {
        id: 'u3',
        name: 'Mike Wilson',
        email: 'mike@example.com',
        createdAt: new Date('2024-01-25'),
        goals: {
          dailyCalories: 3000,
          dailyProtein: 200,
          weeklyCalories: 21000,
          weeklyProtein: 1400,
        },
      },
    ];
    setUsers(sampleUsers);

    // Add sample weekly meal plan for John
    const sampleDays: Day[] = [
      {
        id: 'd1',
        date: 'Monday',
        meals: [
          { id: 'm1', type: 'breakfast', recipeId: 'r5', calories: 0, protein: 0, quantity: 1 },
          { id: 'm2', type: 'lunch', recipeId: 'r1', calories: 0, protein: 0, quantity: 1 },
          { id: 'm3', type: 'dinner', recipeId: 'r3', calories: 0, protein: 0, quantity: 1 },
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'd2',
        date: 'Tuesday',
        meals: [
          { id: 'm4', type: 'breakfast', recipeId: 'r2', calories: 0, protein: 0, quantity: 1 },
          { id: 'm5', type: 'lunch', recipeId: 'r4', calories: 0, protein: 0, quantity: 1 },
          { id: 'm6', type: 'dinner', recipeId: 'r1', calories: 0, protein: 0, quantity: 1 },
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'd3',
        date: 'Wednesday',
        meals: [
          { id: 'm7', type: 'breakfast', recipeId: 'r5', calories: 0, protein: 0, quantity: 1 },
          { id: 'm8', type: 'lunch', recipeId: 'r3', calories: 0, protein: 0, quantity: 1 },
          { id: 'm9', type: 'dinner', recipeId: 'r4', calories: 0, protein: 0, quantity: 1 },
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'd4',
        date: 'Thursday',
        meals: [
          { id: 'm10', type: 'breakfast', recipeId: 'r2', calories: 0, protein: 0, quantity: 1 },
          { id: 'm11', type: 'lunch', recipeId: 'r1', calories: 0, protein: 0, quantity: 1 },
          { id: 'm12', type: 'dinner', recipeId: 'r3', calories: 0, protein: 0, quantity: 1 },
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
      {
        id: 'd5',
        date: 'Friday',
        meals: [
          { id: 'm13', type: 'breakfast', recipeId: 'r5', calories: 0, protein: 0, quantity: 1 },
          { id: 'm14', type: 'lunch', recipeId: 'r4', calories: 0, protein: 0, quantity: 1 },
          { id: 'm15', type: 'dinner', recipeId: 'r1', calories: 0, protein: 0, quantity: 1 },
        ],
        totalCalories: 0,
        totalProtein: 0,
      },
    ];

    // Calculate nutrition for each day's meals
    const daysWithNutrition = sampleDays.map(day => {
      const dayNutrition = day.meals.reduce(
        (totals, meal) => {
          const recipe = recipesWithNutrition.find(r => r.id === meal.recipeId);
          if (!recipe) return totals;

          const quantity = meal.quantity || 1;
          return {
            calories: totals.calories + (recipe.totalCalories * quantity),
            protein: totals.protein + (recipe.totalProtein * quantity),
          };
        },
        { calories: 0, protein: 0 }
      );

      return {
        ...day,
        totalCalories: dayNutrition.calories,
        totalProtein: dayNutrition.protein,
        meals: day.meals.map(meal => {
          const recipe = recipesWithNutrition.find(r => r.id === meal.recipeId);
          const quantity = meal.quantity || 1;
          return {
            ...meal,
            calories: (recipe?.totalCalories || 0) * quantity,
            protein: (recipe?.totalProtein || 0) * quantity,
          };
        }),
      };
    });

    // Set up user meal plans
    const sampleUserMealPlans: UserMealPlan[] = [
      {
        userId: 'u1',
        days: daysWithNutrition,
      },
      {
        userId: 'u2',
        days: [], // Sarah has no meal plan yet
      },
      {
        userId: 'u3',
        days: [], // Mike has no meal plan yet
      },
    ];
    setUserMealPlans(sampleUserMealPlans);
    setSelectedUserId('u1'); // Select John by default
  }, []);

  // Helper function to generate unique IDs
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Get current user's meal plan
  const getCurrentUserMealPlan = () => {
    if (!selectedUserId) return { days: [] };
    return userMealPlans.find(plan => plan.userId === selectedUserId) || { userId: selectedUserId, days: [] };
  };

  const currentUserMealPlan = getCurrentUserMealPlan();
  const currentUserDays = currentUserMealPlan.days;

  // User management functions
  const handleAddUser = (userData: Omit<User, 'id' | 'createdAt'>) => {
    const newUser: User = { 
      ...userData, 
      id: generateId(), 
      createdAt: new Date() 
    };
    setUsers([...users, newUser]);
    
    // Create empty meal plan for new user
    const newMealPlan: UserMealPlan = {
      userId: newUser.id,
      days: [],
    };
    setUserMealPlans([...userMealPlans, newMealPlan]);
  };

  const handleUpdateUser = (id: string, userData: Partial<User>) => {
    setUsers(users.map(user => 
      user.id === id ? { ...user, ...userData } : user
    ));
  };

  const handleDeleteUser = (id: string) => {
    setUsers(users.filter(user => user.id !== id));
    setUserMealPlans(userMealPlans.filter(plan => plan.userId !== id));
    if (selectedUserId === id) {
      setSelectedUserId(users.length > 1 ? users.find(u => u.id !== id)?.id || null : null);
    }
  };

  const handleSelectUser = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleUpdateGoals = (userId: string, goals: NutritionGoals) => {
    setUsers(users.map(user => 
      user.id === userId ? { ...user, goals } : user
    ));
  };


  const generateShoppingList = (userId: string): ShoppingListItem[] => {
    const userMealPlan = userMealPlans.find(plan => plan.userId === userId);
    if (!userMealPlan) return [];

    const ingredientMap = new Map<string, ShoppingListItem>();

    userMealPlan.days.forEach(day => {
      day.meals.forEach(meal => {
        const recipe = recipes.find(r => r.id === meal.recipeId);
        if (!recipe) return;

        recipe.ingredients.forEach(recipeIngredient => {
          const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
          if (!ingredient) return;

          const mealQuantity = meal.quantity || 1;
          const totalIngredientQuantity = recipeIngredient.quantity * mealQuantity;

          const key = recipeIngredient.ingredientId;
          if (ingredientMap.has(key)) {
            const existing = ingredientMap.get(key)!;
            ingredientMap.set(key, {
              ...existing,
              totalQuantity: existing.totalQuantity + totalIngredientQuantity,
              recipes: [...new Set([...existing.recipes, recipe.name])],
            });
          } else {
            ingredientMap.set(key, {
              ingredientId: recipeIngredient.ingredientId,
              ingredientName: ingredient.name,
              totalQuantity: totalIngredientQuantity,
              unit: ingredient.unit,
              recipes: [recipe.name],
              checked: false,
            });
          }
        });
      });
    });

    return Array.from(ingredientMap.values());
  };

  const handleGenerateShoppingList = (userId: string) => {
    const items = generateShoppingList(userId);
    const newShoppingList: ShoppingList = {
      userId,
      items,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setShoppingLists(prev => {
      const existing = prev.find(list => list.userId === userId);
      if (existing) {
        return prev.map(list => 
          list.userId === userId ? newShoppingList : list
        );
      } else {
        return [...prev, newShoppingList];
      }
    });
  };

  const handleUpdateShoppingList = (userId: string, items: ShoppingListItem[]) => {
    setShoppingLists(prev => 
      prev.map(list => 
        list.userId === userId 
          ? { ...list, items, updatedAt: new Date() }
          : list
      )
    );
  };

  const handleClearAllShoppingLists = () => {
    setShoppingLists([]);
  };

  // Ingredient management functions
  const handleAddIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    const newIngredient: Ingredient = { ...ingredient, id: generateId() };
    setIngredients([...ingredients, newIngredient]);
  };

  const handleUpdateIngredient = (id: string, updates: Partial<Ingredient>) => {
    setIngredients(ingredients.map((ing: Ingredient) => 
      ing.id === id ? { ...ing, ...updates } : ing
    ));
  };

  const handleDeleteIngredient = (id: string) => {
    setIngredients(ingredients.filter(ing => ing.id !== id));
    // Also remove from recipes
    setRecipes(recipes.map(recipe => ({
      ...recipe,
      ingredients: recipe.ingredients.filter(ing => ing.ingredientId !== id)
    })));
  };

  // Recipe management functions
  const handleAddRecipe = (recipe: Omit<Recipe, 'id'>) => {
    const newRecipe: Recipe = { ...recipe, id: generateId() };
    setRecipes([...recipes, newRecipe]);
  };

  const handleUpdateRecipe = (id: string, updates: Partial<Recipe>) => {
    setRecipes(recipes.map((recipe: Recipe) => 
      recipe.id === id ? { ...recipe, ...updates } : recipe
    ));
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter(recipe => recipe.id !== id));
    // Also remove from all user meal plans
    setUserMealPlans(userMealPlans.map(plan => ({
      ...plan,
      days: plan.days.map((day: Day) => ({
        ...day,
        meals: day.meals.filter(meal => meal.recipeId !== id)
      }))
    })));
  };

  // Day management functions
  const handleUpdateDay = (dayId: string, dayData: Partial<Day>) => {
    if (!selectedUserId) return;

    const currentPlan = getCurrentUserMealPlan();
    const currentDays = currentPlan.days;

    if (dayId === '') {
      // Create new day
      const newDay: Day = {
        id: generateId(),
        date: dayData.date || 'Monday',
        meals: (dayData.meals || []).map((meal: any) => ({
          ...meal,
          id: meal.id === 'temp' ? generateId() : meal.id
        })),
        totalCalories: dayData.totalCalories || 0,
        totalProtein: dayData.totalProtein || 0,
      };
      
      const updatedDays = [...currentDays, newDay];
      updateUserMealPlan(selectedUserId, updatedDays);
    } else {
      const updatedDays = currentDays.map((day: Day) => 
        day.id === dayId ? { ...day, ...dayData } : day
      );
      updateUserMealPlan(selectedUserId, updatedDays);
    }
  };

  const updateUserMealPlan = (userId: string, days: Day[]) => {
    setUserMealPlans(userMealPlans.map(plan => 
      plan.userId === userId ? { ...plan, days } : plan
    ));
  };

  const handleAddMeal = (dayId: string, meal: { type: MealType; recipeId: string; calories: number; protein: number; quantity: number }) => {
    if (!selectedUserId) return;

    const newMeal: Meal = { ...meal, id: generateId() };
    const currentPlan = getCurrentUserMealPlan();
    const currentDays = currentPlan.days;
    
    if (dayId === '') {
      // Create new day - this should be handled by the MealPlanner component
      return;
    }
    
    const day = currentDays.find(d => d.id === dayId);
    if (day) {
      const updatedMeals = [...day.meals, newMeal];
      const totals = calculateDayTotals(updatedMeals);
      handleUpdateDay(dayId, {
        meals: updatedMeals,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
      });
    }
  };

  const handleDeleteMeal = (dayId: string, mealId: string) => {
    if (!selectedUserId) return;

    const currentPlan = getCurrentUserMealPlan();
    const currentDays = currentPlan.days;
    const day = currentDays.find(d => d.id === dayId);
    if (day) {
      const updatedMeals = day.meals.filter(meal => meal.id !== mealId);
      const totals = calculateDayTotals(updatedMeals);
      handleUpdateDay(dayId, {
        meals: updatedMeals,
        totalCalories: totals.calories,
        totalProtein: totals.protein,
      });
    }
  };

  // Helper function to calculate day totals
  const calculateDayTotals = (meals: Meal[]): NutritionTotals => {
    return meals.reduce(
      (totals, meal) => {
        const quantity = meal.quantity || 1;
        return {
          calories: totals.calories + (meal.calories * quantity),
          protein: totals.protein + (meal.protein * quantity),
        };
      },
      { calories: 0, protein: 0 }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50">
      {/* Modern Header with gradient background */}
      <div className="relative overflow-hidden border-b border-slate-200/60">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-50/80 via-blue-50/40 to-purple-50/80"></div>
        <div className="container mx-auto px-6 py-16 relative">
          <div className="text-center space-y-8">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-6 shadow-modern-xl hover-scale">
              <span className="text-3xl font-bold text-white">🍎</span>
            </div>
            <h1 className="text-6xl font-bold gradient-text mb-4 tracking-tight">
              Calorie & Protein Tracker
            </h1>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto leading-relaxed font-medium">
              Track your nutrition with precision and achieve your health goals
            </p>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mt-12 max-w-5xl mx-auto">
              <div className="surface-elevated rounded-2xl p-6 hover-lift group">
                <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">{ingredients.length}</div>
                <div className="text-sm font-semibold text-slate-600">Ingredients</div>
              </div>
              <div className="surface-elevated rounded-2xl p-6 hover-lift group">
                <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">{recipes.length}</div>
                <div className="text-sm font-semibold text-slate-600">Recipes</div>
              </div>
              <div className="surface-elevated rounded-2xl p-6 hover-lift group">
                <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">{users.length}</div>
                <div className="text-sm font-semibold text-slate-600">People</div>
              </div>
              <div className="surface-elevated rounded-2xl p-6 hover-lift group">
                <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">{currentUserDays.length}</div>
                <div className="text-sm font-semibold text-slate-600">Planned Days</div>
              </div>
              <div className="surface-elevated rounded-2xl p-6 hover-lift group">
                <div className="text-3xl font-bold text-indigo-600 mb-2 group-hover:text-indigo-700 transition-colors">{shoppingLists.length}</div>
                <div className="text-sm font-semibold text-slate-600">Shopping Lists</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-12">
        {/* User Selection */}
        {users.length > 0 && (
          <div className="mb-16">
            <Card className="bg-white border-2 border-slate-300 shadow-lg rounded-2xl">
              <CardContent className="p-10">
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
                  <div className="space-y-4">
                    <h3 className="text-3xl font-bold text-slate-800">Select Person</h3>
                    <p className="text-slate-600 text-xl">Choose whose meal plan you want to manage</p>
                  </div>
                  <div className="w-full lg:w-96">
                    <Label htmlFor="user-select" className="text-base font-semibold text-slate-700 mb-4 block">Current Person</Label>
                    <Select
                      value={selectedUserId || ''}
                      onValueChange={handleSelectUser}
                      placeholder="Select a person"
                      options={users.map((user) => ({
                        value: user.id,
                        label: user.name,
                        icon: (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-base flex items-center justify-center shadow-lg">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        ),
                      }))}
                      className="focus-ring h-14 text-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'people' | 'ingredients' | 'recipes' | 'planner' | 'overview' | 'global')} className="w-full mt-8">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="people">
              <span className="mr-2 text-lg">👥</span>
              People
            </TabsTrigger>
            <TabsTrigger value="ingredients">
              <span className="mr-2 text-lg">🥗</span>
              Ingredients
            </TabsTrigger>
            <TabsTrigger value="recipes">
              <span className="mr-2 text-lg">👨‍🍳</span>
              Recipes
            </TabsTrigger>
            <TabsTrigger value="planner">
              <span className="mr-2 text-lg">📅</span>
              Weekly Planner
            </TabsTrigger>
            <TabsTrigger value="overview">
              <span className="mr-2 text-lg">📊</span>
              Weekly Overview
            </TabsTrigger>
            <TabsTrigger value="global">
              <span className="mr-2 text-lg">🌍</span>
              Global Overview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="people">
            <div className="space-y-8">
              <UserManager
                users={users}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onDeleteUser={handleDeleteUser}
                selectedUserId={selectedUserId}
                onSelectUser={handleSelectUser}
              />
              
              {selectedUserId && (
                <div className="mt-8">
                  <GoalsManager
                    userId={selectedUserId}
                    userName={users.find(u => u.id === selectedUserId)?.name || ''}
                    currentGoals={users.find(u => u.id === selectedUserId)?.goals}
                    onUpdateGoals={handleUpdateGoals}
                    currentWeekTotals={getCurrentUserMealPlan().days.reduce(
                      (totals, day) => ({
                        calories: totals.calories + day.totalCalories,
                        protein: totals.protein + day.totalProtein,
                      }),
                      { calories: 0, protein: 0 }
                    )}
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="ingredients">
            <IngredientManager
              ingredients={ingredients}
              onAddIngredient={handleAddIngredient}
              onUpdateIngredient={handleUpdateIngredient}
              onDeleteIngredient={handleDeleteIngredient}
            />
          </TabsContent>

          <TabsContent value="recipes">
            <RecipeBuilder
              recipes={recipes}
              ingredients={ingredients}
              onAddRecipe={handleAddRecipe}
              onUpdateRecipe={handleUpdateRecipe}
              onDeleteRecipe={handleDeleteRecipe}
            />
          </TabsContent>

          <TabsContent value="planner">
            {selectedUserId ? (
              <MealPlanner
                days={currentUserDays}
                recipes={recipes}
                onUpdateDay={handleUpdateDay}
                onAddMeal={handleAddMeal}
                onDeleteMeal={handleDeleteMeal}
              />
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl opacity-50 mb-4">👤</div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Person Selected</h3>
                <p className="text-muted-foreground">Please select a person to manage their meal plan</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="overview">
            {selectedUserId ? (
              <WeeklyOverview
                days={currentUserDays}
                recipes={recipes}
              />
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl opacity-50 mb-4">📊</div>
                <h3 className="text-xl font-semibold text-muted-foreground mb-2">No Person Selected</h3>
                <p className="text-muted-foreground">Please select a person to view their weekly overview</p>
              </div>
            )}
          </TabsContent>


          <TabsContent value="global">
            <div className="space-y-8">
              <GlobalOverview
                users={users}
                userMealPlans={userMealPlans}
                shoppingLists={shoppingLists}
                ingredients={ingredients}
                onUpdateShoppingList={handleUpdateShoppingList}
                onClearAllShoppingLists={handleClearAllShoppingLists}
                onGenerateShoppingList={handleGenerateShoppingList}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default App;