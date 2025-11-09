import { useEffect, useState } from "react";
import axios from "axios";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function Brands() {
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState([]);
  const [newBrandName, setNewBrandName] = useState("");

  // 🔹 Получаем токен из localStorage
  const token = localStorage.getItem("authToken");

  // 🔹 Получаем бренды с API
  const fetchBrands = async () => {
    try {
      const res = await axios.get("http://localhost:3000/brands", {
        withCredentials: true,
        headers: { Authorization: token },
      });
      setBrands(res.data.brands || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load brands");
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  // 🔹 Добавление бренда
  const handleAddBrand = async () => {
    if (!newBrandName.trim()) {
      toast.error("Enter brand name");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/brands",
        { name: newBrandName },
        {
          withCredentials: true,
          headers: { Authorization: token },
        }
      );

      toast.success("Brand added successfully!");
      setBrands((prev) => [...prev, res.data.brand]);
      setOpen(false);
      setNewBrandName("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to add brand");
    }
  };

  // 🔹 Удаление бренда (если потом добавишь delete endpoint)
  const handleDelete = (id) => {
    toast.warning(`Delete ${id} (not implemented yet)`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Brands</h1>
            <p className="text-muted-foreground">Manage product brands</p>
          </div>

          {/* Add Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Brand
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Brand</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="brandName">Brand Name</Label>
                  <Input
                    id="brandName"
                    placeholder="Enter brand name"
                    value={newBrandName}
                    onChange={(e) => setNewBrandName(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddBrand} className="w-full">
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Brands Table */}
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b bg-muted/50">
                  <tr>
                    <th className="text-left p-4 font-medium">ID</th>
                    <th className="text-left p-4 font-medium">Name</th>
                    <th className="text-left p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {brands.map((brand) => (
                    <tr key={brand.id} className="border-b hover:bg-muted/30">
                      <td className="p-4 text-muted-foreground">{brand.id}</td>
                      <td className="p-4 font-medium">{brand.name}</td>
                      <td className="p-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(brand.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {brands.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center text-muted-foreground py-6"
                      >
                        No brands yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
