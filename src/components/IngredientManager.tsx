import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { Ingredient } from '../types';

interface IngredientManagerProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  onDeleteIngredient: (id: string) => void;
}

const IngredientManager: React.FC<IngredientManagerProps> = ({
  ingredients,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    caloriesPer100g: 0,
    proteinPer100g: 0,
    unit: 'g' as 'g' | 'ml' | 'pieces',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId) {
      onUpdateIngredient(editingId, formData);
      setEditingId(null);
    } else {
      onAddIngredient(formData);
    }
    setFormData({ name: '', caloriesPer100g: 0, proteinPer100g: 0, unit: 'g' as 'g' | 'ml' | 'pieces' });
    setIsAdding(false);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setFormData({
      name: ingredient.name,
      caloriesPer100g: ingredient.caloriesPer100g,
      proteinPer100g: ingredient.proteinPer100g,
      unit: ingredient.unit,
    });
    setEditingId(ingredient.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', caloriesPer100g: 0, proteinPer100g: 0, unit: 'g' as 'g' | 'ml' | 'pieces' });
    setEditingId(null);
    setIsAdding(false);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight gradient-text">Ingredients</h2>
          <p className="text-lg text-muted-foreground">Manage your ingredient database with precision</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
              <Plus className="mr-2 h-4 w-4" />
              Add Ingredient
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold gradient-text">
                {editingId ? 'Edit Ingredient' : 'Add New Ingredient'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingId ? 'Update the ingredient information.' : 'Add a new ingredient to your database.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-sm font-semibold">Ingredient Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter ingredient name"
                    className="focus-ring h-11"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-3">
                    <Label htmlFor="calories" className="text-sm font-semibold">Calories per 100g/ml</Label>
                    <Input
                      id="calories"
                      type="number"
                      value={formData.caloriesPer100g}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, caloriesPer100g: Number(e.target.value) })
                      }
                      min="0"
                      step="0.1"
                      className="focus-ring h-11"
                      required
                    />
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="protein" className="text-sm font-semibold">Protein per 100g/ml (g)</Label>
                    <Input
                      id="protein"
                      type="number"
                      value={formData.proteinPer100g}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                        setFormData({ ...formData, proteinPer100g: Number(e.target.value) })
                      }
                      min="0"
                      step="0.1"
                      className="focus-ring h-11"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-3">
                  <Label htmlFor="unit" className="text-sm font-semibold">Unit</Label>
                  <Select
                    value={formData.unit}
                    onValueChange={(value: string) =>
                      setFormData({ ...formData, unit: value as 'g' | 'ml' | 'pieces' })
                    }
                  >
                    <SelectTrigger className="focus-ring h-11">
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="g">g (grams)</SelectItem>
                      <SelectItem value="ml">ml (milliliters)</SelectItem>
                      <SelectItem value="pieces">pieces</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="outline" onClick={handleCancel} className="hover-lift">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
                  {editingId ? 'Update' : 'Add'} Ingredient
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {ingredients.map((ingredient) => (
          <Card key={ingredient.id} className="group hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-200">
                    {ingredient.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Nutritional info per 100{ingredient.unit}
                  </CardDescription>
                </div>
                <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                  🥗
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300">
                  🔥 {ingredient.caloriesPer100g} cal
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                  💪 {ingredient.proteinPer100g}g protein
                </Badge>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(ingredient)}
                  className="flex-1 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDeleteIngredient(ingredient.id)}
                  className="flex-1 hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-200"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {ingredients.length === 0 && (
        <Card className="text-center py-16 glass shadow-modern-lg border-dashed border-2 border-border/50">
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl opacity-50">🥗</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">No ingredients added yet</h3>
                <p className="text-muted-foreground">Click "Add Ingredient" to start building your nutrition database</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default IngredientManager;