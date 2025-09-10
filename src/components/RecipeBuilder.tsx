import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, Minus } from 'lucide-react';
import type { Recipe, Ingredient, RecipeIngredient } from '../types';

interface RecipeBuilderProps {
  recipes: Recipe[];
  ingredients: Ingredient[];
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onUpdateRecipe: (id: string, recipe: Partial<Recipe>) => void;
  onDeleteRecipe: (id: string) => void;
}

const RecipeBuilder: React.FC<RecipeBuilderProps> = ({
  recipes,
  ingredients,
  onAddRecipe,
  onUpdateRecipe,
  onDeleteRecipe,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    ingredients: [] as RecipeIngredient[],
  });

  const calculateRecipeNutrition = (recipeIngredients: RecipeIngredient[]): { calories: number; protein: number } => {
    return recipeIngredients.reduce(
      (totals, recipeIngredient) => {
        const ingredient = ingredients.find(ing => ing.id === recipeIngredient.ingredientId);
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
  };

  const handleAddIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { ingredientId: '', quantity: 0 }],
    });
  };

  const handleUpdateIngredient = (index: number, field: keyof RecipeIngredient, value: any) => {
    const updatedIngredients = [...formData.ingredients];
    updatedIngredients[index] = { ...updatedIngredients[index], [field]: value };
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleRemoveIngredient = (index: number) => {
    const updatedIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: updatedIngredients });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nutrition = calculateRecipeNutrition(formData.ingredients);
    
    const recipeData = {
      ...formData,
      totalCalories: nutrition.calories,
      totalProtein: nutrition.protein,
    };

    if (editingId) {
      onUpdateRecipe(editingId, recipeData);
      setEditingId(null);
    } else {
      onAddRecipe(recipeData);
    }
    
    setFormData({ name: '', ingredients: [] });
    setIsAdding(false);
  };

  const handleEdit = (recipe: Recipe) => {
    setFormData({
      name: recipe.name,
      ingredients: recipe.ingredients,
    });
    setEditingId(recipe.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', ingredients: [] });
    setEditingId(null);
    setIsAdding(false);
  };

  const handleDelete = (id: string) => {
    setDeletingId(id);
  };

  const confirmDelete = () => {
    if (deletingId) {
      onDeleteRecipe(deletingId);
      setDeletingId(null);
    }
  };

  const cancelDelete = () => {
    setDeletingId(null);
  };

  const currentNutrition = calculateRecipeNutrition(formData.ingredients);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight gradient-text">Recipes</h2>
          <p className="text-lg text-muted-foreground">Create and manage your delicious recipes</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
              <Plus className="mr-2 h-4 w-4" />
              Add Recipe
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] glass shadow-modern-lg">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold gradient-text">
                {editingId ? 'Edit Recipe' : 'Add New Recipe'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingId ? 'Update the recipe information.' : 'Create a new recipe by combining ingredients.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-sm font-semibold">Recipe Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter recipe name"
                    className="focus-ring h-11"
                    required
                  />
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <Label className="text-sm font-semibold">Ingredients</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddIngredient}
                      className="hover-lift"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Ingredient
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {formData.ingredients.map((ingredient, index) => {
                      const selectedIngredient = ingredients.find(ing => ing.id === ingredient.ingredientId);
                      return (
                        <div key={index} className="flex items-center gap-3 p-4 border border-border/50 rounded-xl bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                          <div className="flex-1">
                            <Select
                              value={ingredient.ingredientId}
                              onValueChange={(value: string) => handleUpdateIngredient(index, 'ingredientId', value)}
                              placeholder="Select ingredient"
                              options={ingredients.map((ing) => ({
                                value: ing.id,
                                label: ing.name,
                              }))}
                              className="focus-ring h-10"
                            />
                          </div>
                          
                          <div className="w-20">
                            <Input
                              type="number"
                              value={ingredient.quantity}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleUpdateIngredient(index, 'quantity', Number(e.target.value))}
                              min="0"
                              step="0.1"
                              placeholder="Qty"
                              className="focus-ring h-10 text-center"
                              required
                            />
                          </div>
                          
                          <span className="text-sm text-muted-foreground min-w-[40px] font-medium">
                            {selectedIngredient?.unit || 'g'}
                          </span>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveIngredient(index)}
                            className="hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-200"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {formData.ingredients.length > 0 && (
                  <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
                    <CardContent className="pt-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-primary">Recipe Nutrition Preview</h4>
                        <div className="flex gap-3">
                          <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300">
                            🔥 {currentNutrition.calories.toFixed(1)} calories
                          </Badge>
                          <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                            💪 {currentNutrition.protein.toFixed(1)}g protein
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="outline" onClick={handleCancel} className="hover-lift">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
                  {editingId ? 'Update' : 'Add'} Recipe
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recipes.map((recipe) => (
          <Card key={recipe.id} className="group hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-200">
                    {recipe.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Recipe nutrition information
                  </CardDescription>
                </div>
                <div className="text-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-200">
                  👨‍🍳
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300">
                  🔥 {recipe.totalCalories.toFixed(1)} calories
                </Badge>
                <Badge variant="outline" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                  💪 {recipe.totalProtein.toFixed(1)}g protein
                </Badge>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Ingredients:</h4>
                <div className="space-y-2">
                  {recipe.ingredients.map((ingredient: any, index: number) => {
                    const ing = ingredients.find(i => i.id === ingredient.ingredientId);
                    return (
                      <div key={index} className="text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded-md">
                        {ingredient.quantity}{ing?.unit || 'g'} {ing?.name || 'Unknown ingredient'}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEdit(recipe)}
                  className="flex-1 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(recipe.id)}
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

      {recipes.length === 0 && (
        <Card className="text-center py-16 glass shadow-modern-lg border-dashed border-2 border-border/50">
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl opacity-50">👨‍🍳</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">No recipes created yet</h3>
                <p className="text-muted-foreground">Click "Add Recipe" to create your first delicious recipe</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deletingId !== null} onOpenChange={() => setDeletingId(null)}>
        <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
          <DialogHeader className="space-y-3">
            <DialogTitle className="text-2xl font-bold text-destructive">Delete Recipe</DialogTitle>
            <DialogDescription className="text-base">
              Are you sure you want to delete this recipe? This action cannot be undone and will remove it from all meal plans.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-3">
            <Button type="button" variant="outline" onClick={cancelDelete} className="hover-lift">
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift"
            >
              Delete Recipe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RecipeBuilder;