import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Target, Save, TrendingUp, TrendingDown } from 'lucide-react';
import type { NutritionGoals } from '../types';

interface GoalsManagerProps {
  userId: string;
  userName: string;
  currentGoals?: NutritionGoals;
  onUpdateGoals: (userId: string, goals: NutritionGoals) => void;
  currentWeekTotals: { calories: number; protein: number };
}

const GoalsManager: React.FC<GoalsManagerProps> = ({
  userId,
  userName,
  currentGoals,
  onUpdateGoals,
  currentWeekTotals,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<NutritionGoals>({
    dailyCalories: 2000,
    dailyProtein: 150,
    weeklyCalories: 14000,
    weeklyProtein: 1050,
  });

  useEffect(() => {
    if (currentGoals) {
      setFormData(currentGoals);
    }
  }, [currentGoals]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onUpdateGoals(userId, formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    if (currentGoals) {
      setFormData(currentGoals);
    }
    setIsEditing(false);
  };

  const getProgressPercentage = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (current: number, goal: number) => {
    const percentage = getProgressPercentage(current, goal);
    if (percentage >= 100) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressIcon = (current: number, goal: number) => {
    const percentage = getProgressPercentage(current, goal);
    if (percentage >= 100) return <TrendingUp className="h-4 w-4" />;
    if (percentage >= 80) return <TrendingUp className="h-4 w-4" />;
    return <TrendingDown className="h-4 w-4" />;
  };

  const dailyCaloriesProgress = getProgressPercentage(currentWeekTotals.calories / 7, formData.dailyCalories);
  const dailyProteinProgress = getProgressPercentage(currentWeekTotals.protein / 7, formData.dailyProtein);
  const weeklyCaloriesProgress = getProgressPercentage(currentWeekTotals.calories, formData.weeklyCalories);
  const weeklyProteinProgress = getProgressPercentage(currentWeekTotals.protein, formData.weeklyProtein);

  return (
    <Card className="hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-200">
              {userName}'s Goals
            </CardTitle>
            <CardDescription className="text-sm">
              Set and track nutrition targets
            </CardDescription>
          </div>
          <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-200">
            🎯
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dailyCalories" className="text-sm font-semibold">Daily Calories</Label>
                <Input
                  id="dailyCalories"
                  type="number"
                  value={formData.dailyCalories}
                  onChange={(e) => setFormData({ ...formData, dailyCalories: Number(e.target.value) })}
                  className="focus-ring h-10"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dailyProtein" className="text-sm font-semibold">Daily Protein (g)</Label>
                <Input
                  id="dailyProtein"
                  type="number"
                  value={formData.dailyProtein}
                  onChange={(e) => setFormData({ ...formData, dailyProtein: Number(e.target.value) })}
                  className="focus-ring h-10"
                  min="0"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="weeklyCalories" className="text-sm font-semibold">Weekly Calories</Label>
                <Input
                  id="weeklyCalories"
                  type="number"
                  value={formData.weeklyCalories}
                  onChange={(e) => setFormData({ ...formData, weeklyCalories: Number(e.target.value) })}
                  className="focus-ring h-10"
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="weeklyProtein" className="text-sm font-semibold">Weekly Protein (g)</Label>
                <Input
                  id="weeklyProtein"
                  type="number"
                  value={formData.weeklyProtein}
                  onChange={(e) => setFormData({ ...formData, weeklyProtein: Number(e.target.value) })}
                  className="focus-ring h-10"
                  min="0"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={handleCancel} className="flex-1 hover-lift">
                Cancel
              </Button>
              <Button type="submit" className="flex-1 bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
                <Save className="h-4 w-4 mr-2" />
                Save Goals
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            {/* Daily Goals */}
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Daily Goals</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Calories</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300">
                      {Math.round(currentWeekTotals.calories / 7)} / {formData.dailyCalories}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(dailyCaloriesProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getProgressColor(currentWeekTotals.calories / 7, formData.dailyCalories)}`}>
                    {getProgressIcon(currentWeekTotals.calories / 7, formData.dailyCalories)}
                    {dailyCaloriesProgress.toFixed(1)}% of daily goal
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Protein</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                      {Math.round(currentWeekTotals.protein / 7)}g / {formData.dailyProtein}g
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(dailyProteinProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getProgressColor(currentWeekTotals.protein / 7, formData.dailyProtein)}`}>
                    {getProgressIcon(currentWeekTotals.protein / 7, formData.dailyProtein)}
                    {dailyProteinProgress.toFixed(1)}% of daily goal
                  </div>
                </div>
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="space-y-3">
              <h4 className="font-semibold text-primary">Weekly Goals</h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Calories</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                      {Math.round(currentWeekTotals.calories)} / {formData.weeklyCalories}
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(weeklyCaloriesProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getProgressColor(currentWeekTotals.calories, formData.weeklyCalories)}`}>
                    {getProgressIcon(currentWeekTotals.calories, formData.weeklyCalories)}
                    {weeklyCaloriesProgress.toFixed(1)}% of weekly goal
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Protein</span>
                    <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
                      {Math.round(currentWeekTotals.protein)}g / {formData.weeklyProtein}g
                    </Badge>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(weeklyProteinProgress, 100)}%` }}
                    ></div>
                  </div>
                  <div className={`text-xs flex items-center gap-1 ${getProgressColor(currentWeekTotals.protein, formData.weeklyProtein)}`}>
                    {getProgressIcon(currentWeekTotals.protein, formData.weeklyProtein)}
                    {weeklyProteinProgress.toFixed(1)}% of weekly goal
                  </div>
                </div>
              </div>
            </div>

            <Button 
              onClick={() => setIsEditing(true)} 
              className="w-full hover-lift bg-gradient-to-r from-primary/10 to-primary/20 hover:from-primary/20 hover:to-primary/30 border-primary/30 hover:border-primary/50 transition-all duration-300"
            >
              <Target className="h-4 w-4 mr-2" />
              Edit Goals
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default GoalsManager;
