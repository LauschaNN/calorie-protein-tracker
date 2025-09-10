import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2 } from 'lucide-react';
import type { Day, Recipe, MealType } from '../types';

interface MealPlannerProps {
  days: Day[];
  recipes: Recipe[];
  onUpdateDay: (dayId: string, day: Partial<Day>) => void;
  onAddMeal: (dayId: string, meal: { type: MealType; recipeId: string; calories: number; protein: number; quantity: number }) => void;
  onDeleteMeal: (dayId: string, mealId: string) => void;
}

const MEAL_TYPES: { type: MealType; label: string }[] = [
  { type: 'breakfast', label: 'Breakfast' },
  { type: 'morning_snack', label: 'Morning Snack' },
  { type: 'lunch', label: 'Lunch' },
  { type: 'evening_snack', label: 'Evening Snack' },
  { type: 'dinner', label: 'Dinner' },
];

const WEEK_DAYS = [
  'Monday',
  'Tuesday', 
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

const MealPlanner: React.FC<MealPlannerProps> = ({
  days,
  recipes,
  onUpdateDay,
  onAddMeal,
  onDeleteMeal,
}) => {
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [selectedDay, setSelectedDay] = useState(0); // 0 = Monday, 6 = Sunday
  const [selectedMealType, setSelectedMealType] = useState<MealType>('breakfast');
  const [deletingMeal, setDeletingMeal] = useState<{ dayId: string; mealId: string; mealName: string } | null>(null);
  const [formData, setFormData] = useState({
    recipeId: '',
    quantity: 1,
  });

  // Get or create day for the selected day of the week
  const getDayForWeekDay = (dayIndex: number) => {
    const dayName = WEEK_DAYS[dayIndex];
    return days.find(day => day.date === dayName);
  };

  const currentDay = getDayForWeekDay(selectedDay);

  const handleAddMeal = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const recipe = recipes.find(r => r.id === formData.recipeId);
    if (!recipe) return;

    const quantity = formData.quantity || 1;
    const newMeal = {
      type: selectedMealType,
      recipeId: formData.recipeId,
      calories: recipe.totalCalories * quantity,
      protein: recipe.totalProtein * quantity,
      quantity: quantity,
    };

    if (currentDay) {
      onAddMeal(currentDay.id, newMeal);
    } else {
      // Create new day
      const newDay: Omit<Day, 'id'> = {
        date: WEEK_DAYS[selectedDay],
        meals: [{ ...newMeal, id: 'temp' }], // Temporary id, will be replaced by parent
        totalCalories: newMeal.calories,
        totalProtein: newMeal.protein,
      };
      onUpdateDay('', newDay);
    }

    setFormData({ recipeId: '', quantity: 1 });
    setIsAddingMeal(false);
  };

  const getMealsForType = (mealType: MealType, dayIndex: number) => {
    const day = getDayForWeekDay(dayIndex);
    if (!day) return [];
    return day.meals.filter(meal => meal.type === mealType);
  };

  const getTotalForMealType = (mealType: MealType, dayIndex: number) => {
    const meals = getMealsForType(mealType, dayIndex);
    return meals.reduce(
      (totals: any, meal: any) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
      }),
      { calories: 0, protein: 0 }
    );
  };

  const getDayTotals = (dayIndex: number) => {
    const day = getDayForWeekDay(dayIndex);
    if (!day) return { calories: 0, protein: 0 };
    return {
      calories: day.totalCalories,
      protein: day.totalProtein,
    };
  };

  const handleDeleteMeal = (dayId: string, mealId: string, mealName: string) => {
    setDeletingMeal({ dayId, mealId, mealName });
  };

  const confirmDeleteMeal = () => {
    if (deletingMeal) {
      onDeleteMeal(deletingMeal.dayId, deletingMeal.mealId);
      setDeletingMeal(null);
    }
  };

  const cancelDeleteMeal = () => {
    setDeletingMeal(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight gradient-text">Weekly Meal Planner</h2>
          <p className="text-lg text-muted-foreground">Plan your meals for the week with precision</p>
        </div>
        <div className="w-full sm:w-48">
          <Label htmlFor="day-select" className="text-sm font-semibold">Select Day</Label>
          <Select
            value={selectedDay.toString()}
            onValueChange={(value: string) => setSelectedDay(Number(value))}
            placeholder="Select a day"
            options={WEEK_DAYS.map((day, index) => ({
              value: index.toString(),
              label: day,
            }))}
            className="focus-ring h-11"
          />
        </div>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-modern-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-4">
            <h3 className="text-3xl font-bold gradient-text">{WEEK_DAYS[selectedDay]} - Daily Totals</h3>
            <div className="flex justify-center gap-6 flex-wrap">
              <Badge variant="secondary" className="text-lg px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 shadow-modern">
                🔥 {getDayTotals(selectedDay).calories.toFixed(1)} calories
              </Badge>
              <Badge variant="outline" className="text-lg px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-modern">
                💪 {getDayTotals(selectedDay).protein.toFixed(1)}g protein
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {MEAL_TYPES.map(({ type, label }) => {
          const meals = getMealsForType(type, selectedDay);
          const totals = getTotalForMealType(type, selectedDay);
          
          return (
            <Card key={type} className="group hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-200">{label}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300">
                      🔥 {totals.calories.toFixed(1)} cal
                    </Badge>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                      💪 {totals.protein.toFixed(1)}g
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  {meals.map((meal: any) => {
                    const recipe = recipes.find(r => r.id === meal.recipeId);
                    return (
                      <div key={meal.id} className="flex justify-between items-center p-3 border border-border/50 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                        <div className="flex-1">
                          <div className="font-medium text-sm">
                            {recipe?.name || 'Unknown Recipe'}
                            {meal.quantity && meal.quantity !== 1 && (
                              <Badge variant="outline" className="ml-2 text-xs bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                                {meal.quantity}x
                              </Badge>
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {meal.calories.toFixed(1)} cal, {meal.protein.toFixed(1)}g protein
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteMeal(currentDay!.id, meal.id, recipe?.name || 'Unknown Recipe')}
                          className="hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    );
                  })}
                </div>

                <Dialog open={isAddingMeal && selectedMealType === type} onOpenChange={setIsAddingMeal}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full hover-lift bg-gradient-to-r from-muted/50 to-muted/80 hover:from-primary/10 hover:to-primary/20 hover:border-primary/30 transition-all duration-300"
                      onClick={() => {
                        setSelectedMealType(type);
                        setIsAddingMeal(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Meal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="glass shadow-modern-lg">
                    <DialogHeader className="space-y-3">
                      <DialogTitle className="text-2xl font-bold gradient-text">
                        Add Meal - {WEEK_DAYS[selectedDay]} - {label}
                      </DialogTitle>
                      <DialogDescription className="text-base">
                        Select a recipe to add to this meal.
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleAddMeal}>
                      <div className="grid gap-6 py-6">
                        <div className="grid gap-3">
                          <Label htmlFor="recipe" className="text-sm font-semibold">Recipe</Label>
                          <Select
                            value={formData.recipeId}
                            onValueChange={(value: string) => setFormData({ ...formData, recipeId: value })}
                            placeholder="Select a recipe"
                            options={recipes.map((recipe) => ({
                              value: recipe.id,
                              label: `${recipe.name} (${recipe.totalCalories.toFixed(1)} cal, ${recipe.totalProtein.toFixed(1)}g protein)`,
                            }))}
                            className="focus-ring h-11"
                          />
                        </div>
                        
                        <div className="grid gap-3">
                          <Label htmlFor="quantity" className="text-sm font-semibold">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            min="0.1"
                            step="0.1"
                            value={formData.quantity}
                            onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 1 })}
                            placeholder="1.0"
                            className="focus-ring h-11"
                          />
                          <p className="text-xs text-muted-foreground">
                            Enter the quantity multiplier (e.g., 1.5 = 1.5x the recipe)
                          </p>
                        </div>
                      </div>
                      <DialogFooter className="gap-3">
                        <Button type="button" variant="outline" onClick={() => setIsAddingMeal(false)} className="hover-lift">
                          Cancel
                        </Button>
                        <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
                          Add Meal
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingMeal !== null} onOpenChange={() => setDeletingMeal(null)}>
        <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-destructive">Delete Meal</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete "{deletingMeal?.mealName}" from your meal plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={cancelDeleteMeal} className="hover-lift">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmDeleteMeal}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
            >
              Delete Meal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MealPlanner;