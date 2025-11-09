import { useEffect, useState } from "react";
import axios from "axios";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function AdminProducts() {
  const [open, setOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [newProduct, setNewProduct] = useState({
    name: "",
    price: "",
    stock: "",
    brandId: "",
    categoryId: "",
    imageUrl: "",
  });

  const token = localStorage.getItem("authToken");

  // 🔹 Загрузка брендов и категорий
  const fetchFilters = async () => {
    try {
      const [brandsRes, categoriesRes] = await Promise.all([
        axios.get("http://localhost:3000/brands", {
          withCredentials: true,
          headers: { Authorization: token },
        }),
        axios.get("http://localhost:3000/categories", {
          withCredentials: true,
          headers: { Authorization: token },
        }),
      ]);
      setBrands(brandsRes.data.brands || []);
      setCategories(categoriesRes.data.categories || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load brands or categories");
    }
  };

  // 🔹 Загрузка продуктов
  const fetchProducts = async () => {
    try {
      const res = await axios.get("http://localhost:3000/products", {
        withCredentials: true,
        headers: { Authorization: token },
      });
      setProducts(res.data.products || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load products");
    }
  };

  useEffect(() => {
    fetchFilters();
    fetchProducts();
  }, []);

  // 🔹 Добавление продукта через API
  const handleAddProduct = async () => {
    const { name, price, stock, brandId, categoryId, imageUrl } = newProduct;

    if (!name || !brandId || !categoryId) {
      toast.error("Please fill all required fields!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:3000/products",
        {
          name,
          price: parseFloat(price) || 0,
          stock: parseInt(stock) || 0,
          brandId,
          categoryId,
          imageUrl: imageUrl || null,
        },
        {
          withCredentials: true,
          headers: { Authorization: token },
        }
      );

      toast.success("Product created successfully!");
      setProducts((prev) => [...prev, res.data.product]);
      setOpen(false);
      setNewProduct({
        name: "",
        price: "",
        stock: "",
        brandId: "",
        categoryId: "",
        imageUrl: "",
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to create product");
    }
  };

  // 🔹 Обновление состояния формы
  const handleChange = (field, value) => {
    setNewProduct((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage product inventory</p>
          </div>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add New Product
              </Button>
            </DialogTrigger>

            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Product</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">Product Name</Label>
                    <Input
                      id="productName"
                      placeholder="Enter product name"
                      value={newProduct.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input
                      id="price"
                      type="number"
                      placeholder="0.00"
                      value={newProduct.price}
                      onChange={(e) => handleChange("price", e.target.value)}
                    />
                  </div>
                </div>

                {/* 🔹 Image URL */}
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL (or emoji)</Label>
                  <Input
                    id="imageUrl"
                    placeholder="https://example.com/image.jpg or 👟"
                    value={newProduct.imageUrl}
                    onChange={(e) => handleChange("imageUrl", e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="brand">Brand</Label>
                    <Select
                      onValueChange={(val) => handleChange("brandId", val)}
                      value={newProduct.brandId}
                    >
                      <SelectTrigger id="brand">
                        <SelectValue placeholder="Select brand" />
                      </SelectTrigger>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      onValueChange={(val) => handleChange("categoryId", val)}
                      value={newProduct.categoryId}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="stock">Stock</Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="0"
                    value={newProduct.stock}
                    onChange={(e) => handleChange("stock", e.target.value)}
                  />
                </div>

                <Button onClick={handleAddProduct} className="w-full">
                  Add Product
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Products List */}
        <Card>
          <CardContent className="p-6">
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search products..." className="pl-10" />
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((p) => (
                <Card key={p.id} className="group hover:shadow-lg transition-all">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center mb-4 overflow-hidden">
                      {p.imageUrl ? (
                        p.imageUrl.startsWith("http") ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="object-cover w-full h-full"
                          />
                        ) : (
                          <div className="text-6xl">{p.imageUrl}</div>
                        )
                      ) : (
                        <div className="text-6xl">👟</div>
                      )}
                    </div>

                    <h3 className="font-semibold mb-1">{p.name}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">
                      ${p.price || "—"}
                    </p>
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <span>{p.brand?.name || "—"}</span>
                      <span className="text-xs bg-muted px-2 py-1 rounded">
                        {p.category?.name || "—"}
                      </span>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toast.info("Edit functionality")}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1"
                        onClick={() => toast.error("Delete functionality")}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {products.length === 0 && (
                <p className="text-center text-muted-foreground col-span-full">
                  No products yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
