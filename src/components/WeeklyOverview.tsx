import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Day, MealType, Recipe } from '../types';

interface WeeklyOverviewProps {
  days: Day[];
  recipes: Recipe[];
}

const MEAL_TYPES: { type: MealType; label: string; shortLabel: string }[] = [
  { type: 'breakfast', label: 'Breakfast', shortLabel: 'B' },
  { type: 'morning_snack', label: 'Morning Snack', shortLabel: 'MS' },
  { type: 'lunch', label: 'Lunch', shortLabel: 'L' },
  { type: 'evening_snack', label: 'Evening Snack', shortLabel: 'ES' },
  { type: 'dinner', label: 'Dinner', shortLabel: 'D' },
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

const WeeklyOverview: React.FC<WeeklyOverviewProps> = ({ days, recipes }) => {
  const getDayForWeekDay = (dayName: string) => {
    return days.find(day => day.date === dayName);
  };

  const getMealsForType = (mealType: MealType, dayName: string) => {
    const day = getDayForWeekDay(dayName);
    if (!day) return [];
    return day.meals.filter(meal => meal.type === mealType);
  };

  const getTotalForMealType = (mealType: MealType, dayName: string) => {
    const meals = getMealsForType(mealType, dayName);
    return meals.reduce(
      (totals, meal) => ({
        calories: totals.calories + meal.calories,
        protein: totals.protein + meal.protein,
      }),
      { calories: 0, protein: 0 }
    );
  };

  const getDayTotals = (dayName: string) => {
    const day = getDayForWeekDay(dayName);
    if (!day) return { calories: 0, protein: 0 };
    return {
      calories: day.totalCalories,
      protein: day.totalProtein,
    };
  };

  const getWeekTotals = () => {
    return WEEK_DAYS.reduce(
      (totals, dayName) => {
        const dayTotals = getDayTotals(dayName);
        return {
          calories: totals.calories + dayTotals.calories,
          protein: totals.protein + dayTotals.protein,
        };
      },
      { calories: 0, protein: 0 }
    );
  };

  const weekTotals = getWeekTotals();

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight gradient-text">Weekly Overview</h2>
        <p className="text-lg text-muted-foreground">View your complete weekly meal plan and nutrition totals</p>
      </div>

      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20 shadow-modern-lg">
        <CardContent className="pt-8 pb-8">
          <div className="text-center space-y-6">
            <h3 className="text-3xl font-bold gradient-text">Week Summary</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Badge variant="secondary" className="text-lg px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300 shadow-modern">
                  🔥 {weekTotals.calories.toFixed(1)} total calories
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="outline" className="text-lg px-6 py-3 bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300 shadow-modern">
                  💪 {weekTotals.protein.toFixed(1)}g total protein
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="default" className="text-lg px-6 py-3 bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300 shadow-modern">
                  📊 {(weekTotals.calories / 7).toFixed(1)} avg calories/day
                </Badge>
              </div>
              <div className="space-y-2">
                <Badge variant="default" className="text-lg px-6 py-3 bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300 shadow-modern">
                  🎯 {(weekTotals.protein / 7).toFixed(1)}g avg protein/day
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {WEEK_DAYS.map((dayName) => {
          const dayTotals = getDayTotals(dayName);
          const hasMeals = dayTotals.calories > 0 || dayTotals.protein > 0;
          
          return (
            <Card key={dayName} className="group hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-200">{dayName}</CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300">
                      🔥 {dayTotals.calories.toFixed(0)} cal
                    </Badge>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                      💪 {dayTotals.protein.toFixed(0)}g
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {hasMeals ? (
                  <div className="space-y-4">
                    {MEAL_TYPES.map(({ type, label }) => {
                      const meals = getMealsForType(type, dayName);
                      const mealTotals = getTotalForMealType(type, dayName);
                      
                      if (meals.length === 0) return null;

                      return (
                        <div key={type} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-muted-foreground">
                              {label}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {mealTotals.calories.toFixed(0)} cal, {mealTotals.protein.toFixed(0)}g
                            </span>
                          </div>
                          <div className="space-y-1">
                            {meals.map((meal, index) => {
                              const recipe = recipes.find(r => r.id === meal.recipeId);
                              return (
                                <div key={index} className="text-sm text-muted-foreground">
                                  {recipe?.name || 'Unknown Recipe'} ({meal.calories.toFixed(0)} cal, {meal.protein.toFixed(0)}g)
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl opacity-30 mb-2">📅</div>
                    <p className="text-sm text-muted-foreground italic">
                      No meals planned
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="shadow-modern-lg border-border/50">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold gradient-text">Weekly Summary Table</CardTitle>
          <CardDescription className="text-base">
            Detailed breakdown of calories and protein for each meal type
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Day</TableHead>
                {MEAL_TYPES.map(({ type, label }) => (
                  <TableHead key={type} className="text-center font-bold">
                    {label}
                  </TableHead>
                ))}
                <TableHead className="text-center font-bold">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {WEEK_DAYS.map((dayName) => {
                const dayTotals = getDayTotals(dayName);
                return (
                  <TableRow key={dayName}>
                    <TableCell className="font-medium">{dayName}</TableCell>
                    {MEAL_TYPES.map(({ type }) => {
                      const mealTotals = getTotalForMealType(type, dayName);
                      return (
                        <TableCell key={type} className="text-center">
                          {mealTotals.calories > 0 ? (
                            <div>
                              <div className="text-sm font-bold text-primary">
                                {mealTotals.calories.toFixed(0)}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {mealTotals.protein.toFixed(0)}g
                              </div>
                            </div>
                          ) : (
                            <span className="text-xs text-muted-foreground italic">-</span>
                          )}
                        </TableCell>
                      );
                    })}
                    <TableCell className="text-center font-bold bg-muted/50">
                      <div>
                        <div className="text-sm text-primary">
                          {dayTotals.calories.toFixed(0)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {dayTotals.protein.toFixed(0)}g
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default WeeklyOverview;