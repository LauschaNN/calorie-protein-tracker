import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2 } from 'lucide-react';
import type { User as UserType } from '../types';

interface UserManagerProps {
  users: UserType[];
  onAddUser: (user: Omit<UserType, 'id' | 'createdAt'>) => void;
  onUpdateUser: (id: string, user: Partial<UserType>) => void;
  onDeleteUser: (id: string) => void;
  selectedUserId: string | null;
  onSelectUser: (userId: string) => void;
}

const UserManager: React.FC<UserManagerProps> = ({
  users,
  onAddUser,
  onUpdateUser,
  onDeleteUser,
  selectedUserId,
  onSelectUser,
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (editingId) {
      onUpdateUser(editingId, formData);
      setEditingId(null);
    } else {
      onAddUser(formData);
    }
    setFormData({ name: '', email: '' });
    setIsAdding(false);
  };

  const handleEdit = (user: UserType) => {
    setFormData({
      name: user.name,
      email: user.email || '',
    });
    setEditingId(user.id);
    setIsAdding(true);
  };

  const handleCancel = () => {
    setFormData({ name: '', email: '' });
    setEditingId(null);
    setIsAdding(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-4xl font-bold tracking-tight gradient-text">People</h2>
          <p className="text-lg text-muted-foreground">Manage different people and their meal plans</p>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
              <Plus className="mr-2 h-4 w-4" />
              Add Person
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] glass shadow-modern-lg">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-2xl font-bold gradient-text">
                {editingId ? 'Edit Person' : 'Add New Person'}
              </DialogTitle>
              <DialogDescription className="text-base">
                {editingId ? 'Update the person information.' : 'Add a new person to manage their meal plans.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit}>
              <div className="grid gap-6 py-6">
                <div className="grid gap-3">
                  <Label htmlFor="name" className="text-sm font-semibold">Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter person's name"
                    className="focus-ring h-11"
                    required
                  />
                </div>
                
                <div className="grid gap-3">
                  <Label htmlFor="email" className="text-sm font-semibold">Email (Optional)</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="Enter email address"
                    className="focus-ring h-11"
                  />
                </div>
              </div>
              <DialogFooter className="gap-3">
                <Button type="button" variant="outline" onClick={handleCancel} className="hover-lift">
                  Cancel
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary shadow-modern hover:shadow-modern-lg transition-all duration-300 hover-lift">
                  {editingId ? 'Update' : 'Add'} Person
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {users.map((user) => (
          <Card 
            key={user.id} 
            className={`group hover-lift shadow-modern hover:shadow-modern-lg border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
              selectedUserId === user.id 
                ? 'ring-2 ring-primary border-primary/50 bg-primary/5' 
                : ''
            }`}
            onClick={() => onSelectUser(user.id)}
          >
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors duration-200">
                    {user.name}
                  </CardTitle>
                  <CardDescription className="text-sm">
                    {user.email || 'No email provided'}
                  </CardDescription>
                </div>
                <div className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 text-primary font-bold text-lg">
                  {getInitials(user.name)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Badge variant="secondary" className="bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300">
                  👤 Active
                </Badge>
                {selectedUserId === user.id && (
                  <Badge variant="default" className="bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300">
                    📋 Selected
                  </Badge>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                Created: {new Date(user.createdAt).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEdit(user);
                  }}
                  className="flex-1 hover:bg-primary/10 hover:border-primary/20 hover:text-primary transition-all duration-200"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteUser(user.id);
                  }}
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

      {users.length === 0 && (
        <Card className="text-center py-16 glass shadow-modern-lg border-dashed border-2 border-border/50">
          <CardContent>
            <div className="space-y-4">
              <div className="text-6xl opacity-50">👥</div>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold text-muted-foreground">No people added yet</h3>
                <p className="text-muted-foreground">Click "Add Person" to start managing meal plans for different people</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManager;
