import { useState } from 'react';
import { useGetUserBikes, useDeleteBike } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import RequireAuthAction from '../components/RequireAuthAction';
import BikeForm from '../components/BikeForm';
import type { Bike } from '../backend';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const regionLabels: Record<string, string> = {
  asia: 'Asia',
  europe: 'Europe',
  usa: 'USA',
  middleEast: 'Middle East',
};

export default function ManageBikesPage() {
  const { data: bikes, isLoading } = useGetUserBikes();
  const deleteBike = useDeleteBike();
  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bikeToDelete, setBikeToDelete] = useState<bigint | null>(null);

  const handleEdit = (bike: Bike) => {
    setEditingBike(bike);
    setShowForm(true);
  };

  const handleCreate = () => {
    setEditingBike(null);
    setShowForm(true);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingBike(null);
  };

  const handleDeleteClick = (bikeId: bigint) => {
    setBikeToDelete(bikeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (bikeToDelete) {
      await deleteBike.mutateAsync(bikeToDelete);
      setDeleteDialogOpen(false);
      setBikeToDelete(null);
    }
  };

  return (
    <RequireAuthAction action="manage bikes">
      <div className="container py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight">Manage Bikes</h1>
              <p className="text-muted-foreground mt-2">
                Create and manage your motorcycle listings
              </p>
            </div>
            {!showForm && (
              <Button onClick={handleCreate} className="gap-2">
                <PlusCircle className="h-4 w-4" />
                Create New Bike
              </Button>
            )}
          </div>

          {/* Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <CardTitle>{editingBike ? 'Edit Bike' : 'Create New Bike'}</CardTitle>
              </CardHeader>
              <CardContent>
                <BikeForm bike={editingBike} onSuccess={handleFormClose} onCancel={handleFormClose} />
              </CardContent>
            </Card>
          )}

          {/* Bikes List */}
          {!showForm && (
            <>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-48 w-full" />
                  ))}
                </div>
              ) : bikes && bikes.length > 0 ? (
                <div className="grid gap-6 md:grid-cols-2">
                  {bikes.map((bike) => (
                    <Card key={bike.id.toString()} className="overflow-hidden">
                      <div className="aspect-video relative bg-muted">
                        <img
                          src={
                            bike.images && bike.images.length > 0
                              ? bike.images[0]
                              : '/assets/generated/bike-placeholder.dim_1200x800.png'
                          }
                          alt={`${bike.brand} ${bike.name}`}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/generated/bike-placeholder.dim_1200x800.png';
                          }}
                        />
                      </div>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="space-y-2">
                            <CardTitle className="line-clamp-1">
                              {bike.brand} {bike.name}
                            </CardTitle>
                            <Badge variant="outline">{regionLabels[bike.region] || bike.region}</Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                          {bike.specs || 'No specifications available'}
                        </p>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(bike)}
                            className="gap-2"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteClick(bike.id)}
                            className="gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center space-y-4">
                    <p className="text-muted-foreground">
                      You haven't created any bikes yet. Click "Create New Bike" to get started.
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the bike from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RequireAuthAction>
  );
}
