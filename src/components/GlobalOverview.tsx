import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TrendingUp, TrendingDown, Target, Users, Calendar, Zap } from 'lucide-react';
import type { User, UserMealPlan, Day } from '../types';

interface GlobalOverviewProps {
  users: User[];
  userMealPlans: UserMealPlan[];
}

const GlobalOverview: React.FC<GlobalOverviewProps> = ({ users, userMealPlans }) => {
  const getWeekTotals = (days: Day[]) => {
    return days.reduce(
      (totals, day) => ({
        calories: totals.calories + day.totalCalories,
        protein: totals.protein + day.totalProtein,
      }),
      { calories: 0, protein: 0 }
    );
  };

  const getProgressPercentage = (current: number, goal: number) => {
    if (goal === 0) return 0;
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalUsers = users.length;
  const usersWithMealPlans = userMealPlans.filter(plan => plan.days.length > 0).length;
  const totalCalories = userMealPlans.reduce((sum, plan) => sum + getWeekTotals(plan.days).calories, 0);
  const totalProtein = userMealPlans.reduce((sum, plan) => sum + getWeekTotals(plan.days).protein, 0);

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h2 className="text-4xl font-bold tracking-tight gradient-text">Global Overview</h2>
        <p className="text-lg text-muted-foreground">Track nutrition progress across all people</p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-blue-100 to-blue-200 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total People</p>
                <p className="text-2xl font-bold text-primary">{totalUsers}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-green-100 to-green-200 rounded-lg">
                <Calendar className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Plans</p>
                <p className="text-2xl font-bold text-primary">{usersWithMealPlans}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-orange-100 to-orange-200 rounded-lg">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Calories</p>
                <p className="text-2xl font-bold text-primary">{Math.round(totalCalories).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-r from-purple-100 to-purple-200 rounded-lg">
                <Target className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Protein</p>
                <p className="text-2xl font-bold text-primary">{Math.round(totalProtein).toLocaleString()}g</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual User Progress */}
      <Card className="shadow-modern-lg border-border/50">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold gradient-text">Individual Progress</CardTitle>
          <CardDescription className="text-base">
            Track each person's nutrition goals and achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {users.map((user) => {
              const userMealPlan = userMealPlans.find(plan => plan.userId === user.id);
              const weekTotals = userMealPlan ? getWeekTotals(userMealPlan.days) : { calories: 0, protein: 0 };
              const goals = user.goals;
              
              const dailyCaloriesProgress = goals ? getProgressPercentage(weekTotals.calories / 7, goals.dailyCalories) : 0;
              const dailyProteinProgress = goals ? getProgressPercentage(weekTotals.protein / 7, goals.dailyProtein) : 0;
              const weeklyCaloriesProgress = goals ? getProgressPercentage(weekTotals.calories, goals.weeklyCalories) : 0;
              const weeklyProteinProgress = goals ? getProgressPercentage(weekTotals.protein, goals.weeklyProtein) : 0;

              return (
                <Card key={user.id} className="hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-bold text-sm flex items-center justify-center">
                        {getInitials(user.name)}
                      </div>
                      <div>
                        <CardTitle className="text-lg font-semibold">{user.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {userMealPlan?.days.length || 0} planned days
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Daily Progress */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-primary">Daily Average</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Calories</span>
                          <span className="text-xs font-medium">
                            {Math.round(weekTotals.calories / 7)} / {goals?.dailyCalories || 'N/A'}
                          </span>
                        </div>
                        {goals && (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-orange-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(dailyCaloriesProgress, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Protein</span>
                          <span className="text-xs font-medium">
                            {Math.round(weekTotals.protein / 7)}g / {goals?.dailyProtein || 'N/A'}g
                          </span>
                        </div>
                        {goals && (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-400 to-blue-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(dailyProteinProgress, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Weekly Progress */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-primary">Weekly Total</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Calories</span>
                          <span className="text-xs font-medium">
                            {Math.round(weekTotals.calories)} / {goals?.weeklyCalories || 'N/A'}
                          </span>
                        </div>
                        {goals && (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-green-400 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(weeklyCaloriesProgress, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Protein</span>
                          <span className="text-xs font-medium">
                            {Math.round(weekTotals.protein)}g / {goals?.weeklyProtein || 'N/A'}g
                          </span>
                        </div>
                        {goals && (
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-400 to-purple-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${Math.min(weeklyProteinProgress, 100)}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="flex justify-center">
                      {goals ? (
                        <Badge 
                          variant="secondary" 
                          className={`${
                            dailyCaloriesProgress >= 80 && dailyProteinProgress >= 80 
                              ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300'
                              : 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300'
                          }`}
                        >
                          {dailyCaloriesProgress >= 80 && dailyProteinProgress >= 80 ? '🎯 On Track' : '📈 In Progress'}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300">
                          ⚠️ No Goals Set
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Table */}
      <Card className="shadow-modern-lg border-border/50">
        <CardHeader className="space-y-3">
          <CardTitle className="text-2xl font-bold gradient-text">Detailed Comparison</CardTitle>
          <CardDescription className="text-base">
            Compare nutrition data across all people
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold">Person</TableHead>
                <TableHead className="text-center font-bold">Daily Calories</TableHead>
                <TableHead className="text-center font-bold">Daily Protein</TableHead>
                <TableHead className="text-center font-bold">Weekly Calories</TableHead>
                <TableHead className="text-center font-bold">Weekly Protein</TableHead>
                <TableHead className="text-center font-bold">Goals Set</TableHead>
                <TableHead className="text-center font-bold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const userMealPlan = userMealPlans.find(plan => plan.userId === user.id);
                const weekTotals = userMealPlan ? getWeekTotals(userMealPlan.days) : { calories: 0, protein: 0 };
                const goals = user.goals;
                
                const dailyCaloriesProgress = goals ? getProgressPercentage(weekTotals.calories / 7, goals.dailyCalories) : 0;
                const dailyProteinProgress = goals ? getProgressPercentage(weekTotals.protein / 7, goals.dailyProtein) : 0;

                return (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                          {getInitials(user.name)}
                        </div>
                        {user.name}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-primary">
                          {Math.round(weekTotals.calories / 7)}
                        </div>
                        {goals && (
                          <div className="text-xs text-muted-foreground">
                            / {goals.dailyCalories} ({dailyCaloriesProgress.toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-primary">
                          {Math.round(weekTotals.protein / 7)}g
                        </div>
                        {goals && (
                          <div className="text-xs text-muted-foreground">
                            / {goals.dailyProtein}g ({dailyProteinProgress.toFixed(1)}%)
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-primary">
                          {Math.round(weekTotals.calories)}
                        </div>
                        {goals && (
                          <div className="text-xs text-muted-foreground">
                            / {goals.weeklyCalories}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="space-y-1">
                        <div className="text-sm font-bold text-primary">
                          {Math.round(weekTotals.protein)}g
                        </div>
                        {goals && (
                          <div className="text-xs text-muted-foreground">
                            / {goals.weeklyProtein}g
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {goals ? (
                        <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                          ✅ Yes
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300">
                          ❌ No
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {goals ? (
                        <div className={`flex items-center justify-center gap-1 ${getProgressColor(weekTotals.calories / 7, goals.dailyCalories)}`}>
                          {getProgressIcon(weekTotals.calories / 7, goals.dailyCalories)}
                          <span className="text-xs">
                            {dailyCaloriesProgress >= 100 ? 'Complete' : 
                             dailyCaloriesProgress >= 80 ? 'Good' : 'Needs Work'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">No Goals</span>
                      )}
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

export default GlobalOverview;
