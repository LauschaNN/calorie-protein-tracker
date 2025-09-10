import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { TrendingUp, TrendingDown, Target, Users, Calendar, Zap, ShoppingCart, Download, Trash2, CheckCircle2, Circle, Edit, Plus, X, Package, RefreshCw } from 'lucide-react';
import type { User, UserMealPlan, Day, ShoppingList, ShoppingListItem, Ingredient } from '../types';

interface GlobalOverviewProps {
  users: User[];
  userMealPlans: UserMealPlan[];
  shoppingLists: ShoppingList[];
  ingredients: Ingredient[];
  onUpdateShoppingList: (userId: string, items: ShoppingListItem[]) => void;
  onClearAllShoppingLists: () => void;
  onGenerateShoppingList: (userId: string) => void;
}

const GlobalOverview: React.FC<GlobalOverviewProps> = ({ 
  users, 
  userMealPlans, 
  shoppingLists, 
  ingredients, 
  onUpdateShoppingList, 
  onClearAllShoppingLists,
  onGenerateShoppingList
}) => {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newItem, setNewItem] = useState({
    ingredientId: '',
    quantity: 1,
  });
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

  // Shopping List Functions
  const getConsolidatedList = (): ShoppingListItem[] => {
    const consolidatedMap = new Map<string, ShoppingListItem>();

    shoppingLists.forEach(shoppingList => {
      if (selectedUser !== 'all' && shoppingList.userId !== selectedUser) return;

      shoppingList.items.forEach(item => {
        const key = item.ingredientId;
        if (consolidatedMap.has(key)) {
          const existing = consolidatedMap.get(key)!;
          consolidatedMap.set(key, {
            ...existing,
            totalQuantity: existing.totalQuantity + item.totalQuantity,
            recipes: [...new Set([...existing.recipes, ...item.recipes])],
            checked: existing.checked && item.checked,
          });
        } else {
          consolidatedMap.set(key, { ...item });
        }
      });
    });

    return Array.from(consolidatedMap.values());
  };

  const consolidatedItems = getConsolidatedList();
  const filteredItems = showOnlyUnchecked 
    ? consolidatedItems.filter(item => !item.checked)
    : consolidatedItems;

  const handleToggleItem = (ingredientId: string) => {
    const newCheckedState = !consolidatedItems.find(item => item.ingredientId === ingredientId)?.checked;
    
    shoppingLists.forEach(shoppingList => {
      if (selectedUser !== 'all' && shoppingList.userId !== selectedUser) return;
      
      const updatedItems = shoppingList.items.map(item =>
        item.ingredientId === ingredientId
          ? { ...item, checked: newCheckedState }
          : item
      );
      onUpdateShoppingList(shoppingList.userId, updatedItems);
    });
  };

  const handleUpdateQuantity = (ingredientId: string, newQuantity: number) => {
    if (newQuantity <= 0) return;
    
    shoppingLists.forEach(shoppingList => {
      if (selectedUser !== 'all' && shoppingList.userId !== selectedUser) return;
      
      const updatedItems = shoppingList.items.map(item =>
        item.ingredientId === ingredientId
          ? { ...item, totalQuantity: newQuantity }
          : item
      );
      onUpdateShoppingList(shoppingList.userId, updatedItems);
    });
  };

  const handleRemoveItem = (ingredientId: string) => {
    setDeletingItemId(ingredientId);
  };

  const confirmRemoveItem = () => {
    if (!deletingItemId) return;
    
    shoppingLists.forEach(shoppingList => {
      if (selectedUser !== 'all' && shoppingList.userId !== selectedUser) return;
      
      const updatedItems = shoppingList.items.filter(item => item.ingredientId !== deletingItemId);
      onUpdateShoppingList(shoppingList.userId, updatedItems);
    });
    setDeletingItemId(null);
  };

  const cancelRemoveItem = () => {
    setDeletingItemId(null);
  };

  const handleAddItem = () => {
    if (!newItem.ingredientId || newItem.quantity <= 0) return;
    
    const ingredient = ingredients.find(ing => ing.id === newItem.ingredientId);
    if (!ingredient) return;

    // Add to all shopping lists or create new ones
    if (selectedUser === 'all') {
      // Add to all users' shopping lists
      users.forEach(user => {
        const existingList = shoppingLists.find(list => list.userId === user.id);
        if (existingList) {
          const existingItem = existingList.items.find(item => item.ingredientId === newItem.ingredientId);
          if (existingItem) {
            const updatedItems = existingList.items.map(item =>
              item.ingredientId === newItem.ingredientId
                ? { ...item, totalQuantity: item.totalQuantity + newItem.quantity }
                : item
            );
            onUpdateShoppingList(user.id, updatedItems);
          } else {
            const newShoppingItem: ShoppingListItem = {
              ingredientId: newItem.ingredientId,
              ingredientName: ingredient.name,
              totalQuantity: newItem.quantity,
              unit: ingredient.unit,
              recipes: ['Manually added'],
              checked: false,
            };
            onUpdateShoppingList(user.id, [...existingList.items, newShoppingItem]);
          }
        }
      });
    } else {
      // Add to specific user's shopping list
      const existingList = shoppingLists.find(list => list.userId === selectedUser);
      if (existingList) {
        const existingItem = existingList.items.find(item => item.ingredientId === newItem.ingredientId);
        if (existingItem) {
          const updatedItems = existingList.items.map(item =>
            item.ingredientId === newItem.ingredientId
              ? { ...item, totalQuantity: item.totalQuantity + newItem.quantity }
              : item
          );
          onUpdateShoppingList(selectedUser, updatedItems);
        } else {
          const newShoppingItem: ShoppingListItem = {
            ingredientId: newItem.ingredientId,
            ingredientName: ingredient.name,
            totalQuantity: newItem.quantity,
            unit: ingredient.unit,
            recipes: ['Manually added'],
            checked: false,
          };
          onUpdateShoppingList(selectedUser, [...existingList.items, newShoppingItem]);
        }
      }
    }
    
    setNewItem({ ingredientId: '', quantity: 1 });
    setIsAddingItem(false);
  };

  const handleClearAll = () => {
    setShowClearAllConfirm(true);
  };

  const confirmClearAll = () => {
    onClearAllShoppingLists();
    setShowClearAllConfirm(false);
  };

  const cancelClearAll = () => {
    setShowClearAllConfirm(false);
  };

  const handleDownloadList = () => {
    const listText = filteredItems
      .map(item => `${item.checked ? '✓' : '○'} ${item.ingredientName} - ${item.totalQuantity}${item.unit}`)
      .join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'global-shopping-list.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getStats = () => {
    const totalItems = consolidatedItems.length;
    const checkedItems = consolidatedItems.filter(item => item.checked).length;
    const totalQuantity = consolidatedItems.reduce((total, item) => total + item.totalQuantity, 0);
    const totalUsers = selectedUser === 'all' 
      ? shoppingLists.length 
      : shoppingLists.filter(list => list.userId === selectedUser).length;

    return { totalItems, checkedItems, totalQuantity, totalUsers };
  };

  const stats = getStats();

  const getUsersWithMealPlans = () => {
    return users.filter(user => {
      const userMealPlan = userMealPlans.find(plan => plan.userId === user.id);
      return userMealPlan && userMealPlan.days.length > 0;
    });
  };

  const handleGenerateGlobalList = async () => {
    setIsGenerating(true);
    
    // Generate shopping lists for all users who have meal plans
    const usersWithMealPlans = getUsersWithMealPlans();

    // Generate shopping lists for each user
    for (const user of usersWithMealPlans) {
      onGenerateShoppingList(user.id);
    }

    // Simulate generation delay for better UX
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsGenerating(false);
  };

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

      {/* Global Shopping List */}
      <Card className="shadow-modern-lg border-border/50">
        <CardHeader className="space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl font-bold gradient-text flex items-center gap-2">
                <ShoppingCart className="h-6 w-6" />
                Global Shopping List
              </CardTitle>
              <CardDescription className="text-base">
                Consolidated shopping list from all users' meal plans
              </CardDescription>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleGenerateGlobalList}
                disabled={isGenerating || getUsersWithMealPlans().length === 0}
                className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
              >
                {isGenerating ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                {isGenerating ? 'Generating...' : 'Generate Global List'}
              </Button>
              <Button
                onClick={handleDownloadList}
                disabled={filteredItems.length === 0}
                variant="outline"
                className="hover-lift"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="hover-lift">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Item
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
                  <DialogHeader className="space-y-3">
                    <DialogTitle className="text-2xl font-bold gradient-text">Add Item to Global Shopping List</DialogTitle>
                    <DialogDescription className="text-base">
                      Add a new ingredient to the global shopping list
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid gap-3">
                      <Label htmlFor="ingredient-select" className="text-sm font-semibold">Ingredient</Label>
                      <Select
                        value={newItem.ingredientId}
                        onValueChange={(value) => setNewItem({ ...newItem, ingredientId: value })}
                        placeholder="Select an ingredient"
                        options={ingredients.map((ingredient) => ({
                          value: ingredient.id,
                          label: ingredient.name,
                        }))}
                        className="focus-ring h-11"
                      />
                    </div>
                    
                    <div className="grid gap-3">
                      <Label htmlFor="quantity" className="text-sm font-semibold">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        min="1"
                        value={newItem.quantity}
                        onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
                        className="focus-ring h-11"
                      />
                    </div>
                  </div>
                  <DialogFooter className="gap-3">
                    <Button type="button" variant="outline" onClick={() => setIsAddingItem(false)} className="hover-lift">
                      Cancel
                    </Button>
                    <Button 
                      type="button" 
                      onClick={handleAddItem}
                      disabled={!newItem.ingredientId || newItem.quantity <= 0}
                      className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
                    >
                      Add Item
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                onClick={handleClearAll}
                disabled={shoppingLists.length === 0}
                variant="outline"
                className="hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-200 hover-lift"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <Card className="glass shadow-modern-lg border-border/50 mb-6">
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <label className="text-sm font-semibold mb-2 block">Filter by User</label>
                  <Select
                    value={selectedUser}
                    onValueChange={setSelectedUser}
                    placeholder="Select user"
                    options={[
                      {
                        value: 'all',
                        label: 'All Users',
                        icon: <Users className="h-4 w-4" />,
                      },
                      ...users.map((user) => ({
                        value: user.id,
                        label: user.name,
                        icon: (
                          <div className="w-4 h-4 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                            {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                          </div>
                        ),
                      })),
                    ]}
                    className="focus-ring h-11"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-unchecked"
                    checked={showOnlyUnchecked}
                    onCheckedChange={(checked) => setShowOnlyUnchecked(checked === true)}
                  />
                  <label htmlFor="show-unchecked" className="text-sm font-medium">
                    Show only unchecked items
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {consolidatedItems.length === 0 ? (
            <Card className="text-center py-16 glass shadow-modern-lg border-dashed border-2 border-border/50">
              <CardContent>
                <div className="space-y-4">
                  <div className="text-6xl opacity-50">🛒</div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-muted-foreground">No shopping lists found</h3>
                    <p className="text-muted-foreground">
                      Generate shopping lists for individual users to see the global consolidated list here
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {/* Summary Card */}
              <Card className="glass shadow-modern-lg border-border/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Global Shopping Summary
                  </CardTitle>
                  <CardDescription>
                    {selectedUser === 'all' 
                      ? `Consolidated from ${stats.totalUsers} users` 
                      : `From ${users.find(u => u.id === selectedUser)?.name}'s list`
                    }
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{stats.totalItems}</div>
                      <div className="text-sm text-muted-foreground">Total Items</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">{stats.checkedItems}</div>
                      <div className="text-sm text-muted-foreground">Checked Off</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">{stats.totalQuantity}</div>
                      <div className="text-sm text-muted-foreground">Total Quantity</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">{stats.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">Users</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Shopping List Items */}
              <div className="space-y-3">
                {filteredItems.map((item) => (
                  <Card
                    key={item.ingredientId}
                    className={`group hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 ${
                      item.checked ? 'opacity-60 bg-muted/30' : ''
                    }`}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 flex-1">
                          <Checkbox
                            checked={item.checked}
                            onCheckedChange={() => handleToggleItem(item.ingredientId)}
                            className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                          />
                          <div className="space-y-1 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className={`text-lg font-semibold ${item.checked ? 'line-through text-muted-foreground' : ''}`}>
                                {item.ingredientName}
                              </h3>
                              {editingItemId === item.ingredientId ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    value={item.totalQuantity}
                                    onChange={(e) => handleUpdateQuantity(item.ingredientId, parseInt(e.target.value) || 1)}
                                    className="w-20 h-8 text-sm"
                                  />
                                  <span className="text-sm text-muted-foreground">{item.unit}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setEditingItemId(null)}
                                    className="h-8 px-2"
                                  >
                                    <CheckCircle2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <Badge variant="secondary" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                                  {item.totalQuantity}{item.unit}
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300">
                                <Package className="h-3 w-3 mr-1" />
                                {item.recipes.length} recipe{item.recipes.length !== 1 ? 's' : ''}
                              </Badge>
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Used in: {item.recipes.join(', ')}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {editingItemId !== item.ingredientId && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingItemId(item.ingredientId)}
                              className="h-8 w-8 p-0 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all duration-200"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveItem(item.ingredientId)}
                            className="h-8 w-8 p-0 hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-200"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                          {item.checked ? (
                            <CheckCircle2 className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {filteredItems.length === 0 && showOnlyUnchecked && (
                <Card className="text-center py-16 glass shadow-modern-lg border-dashed border-2 border-border/50">
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-6xl opacity-50">✅</div>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-muted-foreground">All items checked!</h3>
                        <p className="text-muted-foreground">
                          Great job! All items in the shopping list have been checked off.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Item Confirmation Dialog */}
      <Dialog open={deletingItemId !== null} onOpenChange={() => setDeletingItemId(null)}>
        <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-destructive">Remove Item</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to remove this item from all shopping lists? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={cancelRemoveItem} className="hover-lift">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmRemoveItem}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
            >
              Remove Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Clear All Confirmation Dialog */}
      <Dialog open={showClearAllConfirm} onOpenChange={setShowClearAllConfirm}>
        <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-destructive">Clear All Shopping Lists</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to clear ALL shopping lists for ALL users? This action cannot be undone and will remove all items from every user's shopping list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={cancelClearAll} className="hover-lift">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmClearAll}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
            >
              Clear All Lists
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GlobalOverview;
