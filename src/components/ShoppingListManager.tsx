import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { ShoppingCart, RefreshCw, Download, Trash2, CheckCircle2, Circle, Edit, Plus, X } from 'lucide-react';
import type { ShoppingList, ShoppingListItem, Day, Ingredient } from '../types';

interface ShoppingListManagerProps {
  userId: string;
  userName: string;
  shoppingList: ShoppingList | null;
  days: Day[];
  ingredients: Ingredient[];
  onGenerateShoppingList: (userId: string) => void;
  onUpdateShoppingList: (userId: string, items: ShoppingListItem[]) => void;
  onClearShoppingList: (userId: string) => void;
}

const ShoppingListManager: React.FC<ShoppingListManagerProps> = ({
  userId,
  userName,
  shoppingList,
  days,
  ingredients,
  onGenerateShoppingList,
  onUpdateShoppingList,
  onClearShoppingList,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [newItem, setNewItem] = useState({
    ingredientId: '',
    quantity: 1,
  });

  const handleGenerateList = async () => {
    setIsGenerating(true);
    // Simulate generation delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    onGenerateShoppingList(userId);
    setIsGenerating(false);
  };

  const handleToggleItem = (ingredientId: string) => {
    if (!shoppingList) return;
    
    const updatedItems = shoppingList.items.map(item =>
      item.ingredientId === ingredientId
        ? { ...item, checked: !item.checked }
        : item
    );
    onUpdateShoppingList(userId, updatedItems);
  };

  const handleUpdateQuantity = (ingredientId: string, newQuantity: number) => {
    if (!shoppingList || newQuantity <= 0) return;
    
    const updatedItems = shoppingList.items.map(item =>
      item.ingredientId === ingredientId
        ? { ...item, totalQuantity: newQuantity }
        : item
    );
    onUpdateShoppingList(userId, updatedItems);
  };

  const handleRemoveItem = (ingredientId: string) => {
    setDeletingItemId(ingredientId);
  };

  const confirmRemoveItem = () => {
    if (!shoppingList || !deletingItemId) return;
    
    const updatedItems = shoppingList.items.filter(item => item.ingredientId !== deletingItemId);
    onUpdateShoppingList(userId, updatedItems);
    setDeletingItemId(null);
  };

  const cancelRemoveItem = () => {
    setDeletingItemId(null);
  };

  const handleAddItem = () => {
    if (!shoppingList || !newItem.ingredientId || newItem.quantity <= 0) return;
    
    const ingredient = ingredients.find(ing => ing.id === newItem.ingredientId);
    if (!ingredient) return;

    // Check if ingredient already exists in the list
    const existingItem = shoppingList.items.find(item => item.ingredientId === newItem.ingredientId);
    
    if (existingItem) {
      // Update existing item quantity
      const updatedItems = shoppingList.items.map(item =>
        item.ingredientId === newItem.ingredientId
          ? { ...item, totalQuantity: item.totalQuantity + newItem.quantity }
          : item
      );
      onUpdateShoppingList(userId, updatedItems);
    } else {
      // Add new item
      const newShoppingItem: ShoppingListItem = {
        ingredientId: newItem.ingredientId,
        ingredientName: ingredient.name,
        totalQuantity: newItem.quantity,
        unit: ingredient.unit,
        recipes: ['Manually added'],
        checked: false,
      };
      
      const updatedItems = [...shoppingList.items, newShoppingItem];
      onUpdateShoppingList(userId, updatedItems);
    }
    
    setNewItem({ ingredientId: '', quantity: 1 });
    setIsAddingItem(false);
  };

  const handleCancelAdd = () => {
    setNewItem({ ingredientId: '', quantity: 1 });
    setIsAddingItem(false);
  };

  const handleClearList = () => {
    setShowClearConfirm(true);
  };

  const confirmClearList = () => {
    onClearShoppingList(userId);
    setShowClearConfirm(false);
  };

  const cancelClearList = () => {
    setShowClearConfirm(false);
  };

  const handleDownloadList = () => {
    if (!shoppingList) return;
    
    const listText = shoppingList.items
      .map(item => `${item.checked ? '✓' : '○'} ${item.ingredientName} - ${item.totalQuantity}${item.unit}`)
      .join('\n');
    
    const blob = new Blob([listText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${userName}-shopping-list.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getCheckedCount = () => {
    if (!shoppingList) return 0;
    return shoppingList.items.filter(item => item.checked).length;
  };

  const getTotalCount = () => {
    if (!shoppingList) return 0;
    return shoppingList.items.length;
  };

  const getTotalQuantity = () => {
    if (!shoppingList) return 0;
    return shoppingList.items.reduce((total, item) => total + item.totalQuantity, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight gradient-text">Shopping List</h2>
          <p className="text-lg text-muted-foreground">
            Generate and manage {userName}'s shopping list based on their meal plan
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleGenerateList}
            disabled={isGenerating || days.length === 0}
            className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
          >
            {isGenerating ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {isGenerating ? 'Generating...' : 'Generate List'}
          </Button>
          {shoppingList && (
            <Dialog open={isAddingItem} onOpenChange={setIsAddingItem}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hover-lift">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
                <DialogHeader className="space-y-3">
                  <DialogTitle className="text-2xl font-bold gradient-text">Add Item to Shopping List</DialogTitle>
                  <DialogDescription className="text-base">
                    Add a new ingredient to {userName}'s shopping list
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
                  <Button type="button" variant="outline" onClick={handleCancelAdd} className="hover-lift">
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
          )}
          {shoppingList && shoppingList.items.length > 0 && (
            <>
              <Button
                onClick={handleDownloadList}
                variant="outline"
                className="hover-lift"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                onClick={handleClearList}
                variant="outline"
                className="hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-200 hover-lift"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </>
          )}
        </div>
      </div>

      {days.length === 0 && (
        <Card className="text-center py-16 glass shadow-modern-lg border-dashed border-2 border-border/50">
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl opacity-50">📅</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">No meal plan found</h3>
                <p className="text-muted-foreground">
                  Add meals to {userName}'s weekly planner to generate a shopping list
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {shoppingList && shoppingList.items.length > 0 && (
        <div className="space-y-6">
          {/* Summary Card */}
          <Card className="glass shadow-modern-lg border-border/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Shopping List Summary
              </CardTitle>
              <CardDescription>
                Generated on {new Date(shoppingList.createdAt).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{getTotalCount()}</div>
                  <div className="text-sm text-muted-foreground">Total Items</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getCheckedCount()}</div>
                  <div className="text-sm text-muted-foreground">Checked Off</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getTotalQuantity()}</div>
                  <div className="text-sm text-muted-foreground">Total Quantity</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Shopping List Items */}
          <div className="space-y-3">
            {shoppingList.items.map((item) => (
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
        </div>
      )}

      {shoppingList && shoppingList.items.length === 0 && (
        <Card className="text-center py-16 glass shadow-modern-lg border-dashed border-2 border-border/50">
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl opacity-50">🛒</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">Shopping list is empty</h3>
                <p className="text-muted-foreground">
                  No ingredients found in {userName}'s meal plan. Add some recipes to generate a shopping list.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Item Confirmation Dialog */}
      <Dialog open={deletingItemId !== null} onOpenChange={() => setDeletingItemId(null)}>
        <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-destructive">Remove Item</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to remove this item from the shopping list? This action cannot be undone.
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

      {/* Clear List Confirmation Dialog */}
      <Dialog open={showClearConfirm} onOpenChange={setShowClearConfirm}>
        <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-destructive">Clear Shopping List</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to clear {userName}'s entire shopping list? This action cannot be undone and will remove all items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={cancelClearList} className="hover-lift">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmClearList}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
            >
              Clear List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ShoppingListManager;
