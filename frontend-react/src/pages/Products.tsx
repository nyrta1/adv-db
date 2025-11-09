import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
  Search,
  LogOut,
  User,
  Home as HomeIcon,
  Loader2,
  SlidersHorizontal,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

const API_BASE = "http://localhost:3000";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const token = localStorage.getItem("authToken");
        const [bRes, cRes] = await Promise.all([
          axios.get(`${API_BASE}/brands`, { headers: { Authorization: token } }),
          axios.get(`${API_BASE}/categories`, {
            headers: { Authorization: token },
          }),
        ]);
        setBrands(bRes.data.brands || []);
        setCategories(cRes.data.categories || []);
      } catch (err) {
        console.warn("Failed to fetch brands/categories");
      }
    };
    fetchFilters();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem("authToken");
      if (!token) {
        toast({
          variant: "destructive",
          title: "Unauthorized",
          description: "Please login to access the catalog.",
        });
        navigate("/login");
        return;
      }

      const res = await axios.get(`${API_BASE}/products`, {
        withCredentials: true,
        headers: { Authorization: token },
        params: {
          query: searchQuery || undefined,
          brand: selectedBrand !== "all" ? selectedBrand : undefined,
          category: selectedCategory !== "all" ? selectedCategory : undefined,
        },
      });

      setProducts(res.data.products || []);
    } catch (error: any) {
      console.error("Failed to fetch products:", error);
      toast({
        variant: "destructive",
        title: "Failed to load products",
        description:
          error.response?.data?.message ||
          "Server unavailable or unauthorized.",
      });

      if (error.response?.status === 401) {
        localStorage.removeItem("authToken");
        navigate("/login");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedBrand, selectedCategory]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👟</span>
            <h1 className="text-2xl font-bold">ShoeStore</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <Button variant="ghost" onClick={() => navigate("/home")}>
              Home
            </Button>
            <Button variant="ghost" onClick={() => navigate("/products")}>
              Catalog
            </Button>
            <Button variant="ghost" onClick={() => navigate("/recommendations")}>
              Recommendations
            </Button>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={() => navigate("/home")}>
              <HomeIcon className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={() => navigate("/profile")}>
              <User className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                localStorage.removeItem("authToken");
                navigate("/login");
              }}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6 space-y-4 md:space-y-0 md:flex md:items-center md:justify-between">
          <div className="relative w-full md:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for shoes..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <Select onValueChange={setSelectedBrand} value={selectedBrand}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Brands" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Brands</SelectItem>
                {brands.map((b) => (
                  <SelectItem key={b.id} value={b.name}>
                    {b.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedCategory} value={selectedCategory}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.name}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="secondary" onClick={fetchProducts}>
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              Apply
            </Button>
          </div>
        </div>
      </div>

      {/* Product List */}
      <main className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-semibold mb-6">
              {products.length} Products Found
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <Card
                  key={product.id}
                  className="overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                  onClick={() => navigate(`/products/${product.id}`)}
                >
                  <div className="aspect-square bg-muted flex items-center justify-center overflow-hidden">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-6xl">👟</div>
                    )}
                  </div>
                  <CardContent className="p-4 space-y-2">
                    <h3 className="font-semibold text-lg">{product.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {product.brand?.name || "—"}
                    </p>
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xl font-bold text-primary">
                        ${product.price || 0}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Stock: {product.stock || 0}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {products.length === 0 && (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No products found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Try another filter or keyword
                </p>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © 2025 ShoeStore. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Products;
