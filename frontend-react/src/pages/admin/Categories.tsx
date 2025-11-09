import { useEffect, useState } from "react";
import axios from "axios";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

export default function Categories() {
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [newCategoryName, setNewCategoryName] = useState("");

  const token = localStorage.getItem("authToken");

  // 🔹 Получить список категорий
  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:3000/categories", {
        withCredentials: true,
        headers: { Authorization: token },
      });
      setCategories(res.data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔹 Добавить новую категорию
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Enter category name");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/categories",
        { name: newCategoryName },
        {
          withCredentials: true,
          headers: { Authorization: token },
        }
      );

      toast.success("Category added successfully!");
      setCategories((prev) => [...prev, res.data.category]);
      setNewCategoryName("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to add category");
    }
  };

  // 🔹 Удаление (пока заглушка)
  const handleDelete = (id) => {
    toast.warning(`Delete category ${id} (not implemented yet)`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-muted-foreground">Manage product categories</p>
          </div>

          {/* Add Category Dialog */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input
                    id="categoryName"
                    placeholder="Enter category name"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <Button onClick={handleAddCategory} className="w-full">
                  Add
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Categories grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category) => (
            <Card key={category.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{category.name}</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDelete(category.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  ID: {category.id}
                </p>
              </CardContent>
            </Card>
          ))}

          {categories.length === 0 && (
            <p className="text-center text-muted-foreground col-span-full">
              No categories yet
            </p>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
