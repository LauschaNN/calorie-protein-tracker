import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart, Download, Trash2, CheckCircle2, Circle, Users, Package, Edit, X } from 'lucide-react';
import type { ShoppingList, ShoppingListItem, User } from '../types';

interface GlobalShoppingListProps {
  users: User[];
  shoppingLists: ShoppingList[];
  onUpdateShoppingList: (userId: string, items: ShoppingListItem[]) => void;
  onClearAllShoppingLists: () => void;
}

const GlobalShoppingList: React.FC<GlobalShoppingListProps> = ({
  users,
  shoppingLists,
  onUpdateShoppingList,
  onClearAllShoppingLists,
}) => {
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const [showOnlyUnchecked, setShowOnlyUnchecked] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [deletingItemId, setDeletingItemId] = useState<string | null>(null);
  const [showClearAllConfirm, setShowClearAllConfirm] = useState(false);

  // Get consolidated shopping list
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
    
    // Update all shopping lists that contain this ingredient
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
    
    // Update all shopping lists that contain this ingredient
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
    
    // Remove from all shopping lists that contain this ingredient
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight gradient-text">Global Shopping List</h2>
          <p className="text-lg text-muted-foreground">
            Consolidated shopping list from all users' meal plans
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={handleDownloadList}
            disabled={filteredItems.length === 0}
            variant="outline"
            className="hover-lift"
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
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

      {/* Filters */}
      <Card className="glass shadow-modern-lg border-border/50">
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

export default GlobalShoppingList;
