import { useState } from 'react';
import { useGetUserBikes, useDeleteBike, useSeedSampleBikes } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlusCircle, Edit, Trash2, Database } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import RequireAuthAction from '../components/RequireAuthAction';
import BikeForm from '../components/BikeForm';
import type { Bike } from '../backend';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { useQueryClient } from '@tanstack/react-query';
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
  const { isAdmin } = useCurrentUser();
  const deleteBike = useDeleteBike();
  const seedBikes = useSeedSampleBikes();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingBike, setEditingBike] = useState<Bike | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [seedDialogOpen, setSeedDialogOpen] = useState(false);
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
    // Explicitly refetch user bikes to ensure list is updated
    queryClient.invalidateQueries({ queryKey: ['userBikes'] });
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

  const handleSeedClick = () => {
    setSeedDialogOpen(true);
  };

  const handleSeedConfirm = async () => {
    await seedBikes.mutateAsync();
    setSeedDialogOpen(false);
  };

  const getImageUrl = (bike: Bike) => {
    if (bike.mainImages && bike.mainImages.length > 0) {
      const firstImage = bike.mainImages[0];
      if (firstImage.__kind__ === 'uploaded') {
        return firstImage.uploaded.getDirectURL();
      } else {
        return firstImage.linked;
      }
    }
    return '/assets/generated/bike-placeholder.dim_1200x800.png';
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
              <div className="flex gap-2">
                {isAdmin && (
                  <Button
                    onClick={handleSeedClick}
                    variant="outline"
                    className="gap-2"
                    disabled={seedBikes.isPending}
                  >
                    <Database className="h-4 w-4" />
                    {seedBikes.isPending ? 'Seeding...' : 'Seed Sample Bikes'}
                  </Button>
                )}
                <Button onClick={handleCreate} className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Create New Bike
                </Button>
              </div>
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
                          src={getImageUrl(bike)}
                          alt={bike.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = '/assets/generated/bike-placeholder.dim_1200x800.png';
                          }}
                        />
                      </div>
                      <CardContent className="p-6">
                        <div className="space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="text-xl font-bold">{bike.name}</h3>
                                <p className="text-sm text-muted-foreground">{bike.brand}</p>
                              </div>
                              <Badge variant="outline">{regionLabels[bike.region]}</Badge>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Specs</p>
                              <p className="text-sm">{bike.specs}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Price Range</p>
                              <p className="text-sm">
                                ${bike.priceRange.min.toLocaleString()} - $
                                {bike.priceRange.max.toLocaleString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(bike)}
                              className="flex-1 gap-2"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDeleteClick(bike.id)}
                              className="flex-1 gap-2"
                              disabled={deleteBike.isPending}
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      No bikes yet. Create your first bike to get started.
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
            <AlertDialogTitle>Delete Bike</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bike? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Seed Confirmation Dialog */}
      <AlertDialog open={seedDialogOpen} onOpenChange={setSeedDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Seed Sample Bikes</AlertDialogTitle>
            <AlertDialogDescription>
              This will add sample motorcycle entries to the database. Continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSeedConfirm}>Seed Bikes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </RequireAuthAction>
  );
}
