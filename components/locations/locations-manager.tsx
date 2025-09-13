"use client"

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/core/button";
import { Input } from "@/components/ui/core/input";
import { Label } from "@/components/ui/core/label";
import { Trash2, Edit, Plus } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/feedback/alert-dialog";

interface Location {
  id: number;
  name: string;
}

export function LocationsManager() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [newLocationName, setNewLocationName] = useState("");
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await apiClient.get("/locations/");
      if (response.data) {
        setLocations(response.data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleAddLocation = async () => {
    if (!newLocationName.trim()) return;
    try {
      const response = await apiClient.post("/locations/", { name: newLocationName });
      if (response.data) {
        setLocations([...locations, response.data]);
        setNewLocationName("");
      }
    } catch (error) {
      console.error("Error adding location:", error);
    }
  };

  const handleUpdateLocation = async () => {
    if (!editingLocation || !editingLocation.name.trim()) return;
    try {
      const response = await apiClient.put(`/locations/${editingLocation.id}/`, { name: editingLocation.name });
      if (response.data) {
        setLocations(
          locations.map((loc) => (loc.id === editingLocation.id ? response.data : loc))
        );
        setEditingLocation(null);
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleDeleteLocation = async (id: number) => {
    try {
      await apiClient.delete(`/locations/${id}/`);
      setLocations(locations.filter((loc) => loc.id !== id));
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex gap-4">
        <Input
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          placeholder="New location name"
        />
        <Button onClick={handleAddLocation}>
          <Plus className="mr-2 h-4 w-4" /> Add
        </Button>
      </div>

      <div className="space-y-2">
        {locations.map((location) => (
          <div key={location.id} className="flex items-center justify-between p-2 border rounded-md">
            {editingLocation?.id === location.id ? (
              <Input
                value={editingLocation.name}
                onChange={(e) => setEditingLocation({ ...editingLocation, name: e.target.value })}
                className="flex-grow"
              />
            ) : (
              <span className="flex-grow">{location.name}</span>
            )}
            <div className="flex gap-2 ml-4">
              {editingLocation?.id === location.id ? (
                <Button onClick={handleUpdateLocation} size="sm">Save</Button>
              ) : (
                <Button onClick={() => setEditingLocation(location)} size="sm" variant="ghost">
                  <Edit className="h-4 w-4" />
                </Button>
              )}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-600">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the location.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDeleteLocation(location.id)}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}