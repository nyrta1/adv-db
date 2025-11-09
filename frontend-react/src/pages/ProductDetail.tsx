import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ShoppingCart, Loader2, Heart } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:3000";

const ProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [product, setProduct] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        if (!token) {
          toast({
            variant: "destructive",
            title: "Unauthorized",
            description: "Please login to access product details.",
          });
          navigate("/login");
          return;
        }

        const res = await axios.get(`${API_BASE}/products/${id}`, {
          withCredentials: true,
          headers: { Authorization: token },
        });

        if (res.data?.success && res.data.product) {
          setProduct(res.data.product);
        } else {
          toast({
            variant: "destructive",
            title: "Product Not Found",
            description: "The requested product does not exist.",
          });
          navigate("/products");
        }
      } catch (error: any) {
        console.error("Error loading product:", error);
        toast({
          variant: "destructive",
          title: "Failed to load product",
          description:
            error.response?.data?.message ||
            "Server unavailable or unauthorized.",
        });
        if (error.response?.status === 401) {
          localStorage.removeItem("authToken");
          navigate("/login");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, navigate]);

  const handleLike = async () => {
    if (!product) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      await axios.post(`${API_BASE}/products/${product.id}/like`, {}, {
        headers: { Authorization: token },
        withCredentials: true,
      });

      setIsLiked(!isLiked);
      toast({
        title: isLiked ? "Removed from Favorites 💔" : "Added to Favorites ❤️",
        description: `${product.name} ${isLiked ? "removed" : "added"} from favorites.`,
      });
    } catch (err: any) {
      console.error("Like error:", err);
      toast({
        variant: "destructive",
        title: "Failed to update favorites",
        description: err.response?.data?.message || "Server error.",
      });
    }
  };

  const handleBuy = async () => {
    if (!product) return;
    const token = localStorage.getItem("authToken");
    if (!token) return;

    try {
      setBuying(true);
      const res = await axios.post(`${API_BASE}/products/${product.id}/buy`, {}, {
        headers: { Authorization: token },
        withCredentials: true,
      });

      toast({
        title: "Purchase Successful 🛍️",
        description: `${product.name} purchased successfully.`,
      });

      if (res.data?.newStock !== undefined) {
        setProduct({ ...product, stock: res.data.newStock });
      }
    } catch (err: any) {
      console.error("Buy error:", err);
      toast({
        variant: "destructive",
        title: "Purchase Failed",
        description: err.response?.data?.message || "Server error.",
      });
    } finally {
      setBuying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <Button onClick={() => navigate("/products")}>Back to Catalog</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-3xl">👟</span>
              <h1 className="text-2xl font-bold">ShoeStore</h1>
            </div>
            <Button variant="ghost" onClick={() => navigate("/products")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Catalog
            </Button>
          </div>
        </div>
      </header>

      {/* Product Details */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Product Image */}
          <div>
            <Card className="overflow-hidden">
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
            </Card>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <Badge variant="secondary" className="mb-2">
                {product.category?.name || "Uncategorized"}
              </Badge>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <p className="text-xl text-muted-foreground">
                {product.brand?.name || "Unknown Brand"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-primary">
                  ${product.price || 0}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">Stock:</span>
                  <Badge variant={product.stock > 10 ? "default" : "destructive"}>
                    {product.stock} units
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="space-y-3 pt-4">
              <div className="flex gap-3">
                <Button
                  size="lg"
                  className="flex-1"
                  onClick={handleBuy}
                  disabled={product.stock === 0 || buying}
                >
                  {buying ? (
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  ) : (
                    <ShoppingCart className="mr-2 h-5 w-5" />
                  )}
                  {product.stock > 0 ? "Buy Now" : "Out of Stock"}
                </Button>

                <Button
                  size="lg"
                  variant={isLiked ? "default" : "outline"}
                  onClick={handleLike}
                  className="w-14"
                >
                  <Heart
                    className={`h-5 w-5 ${
                      isLiked ? "fill-current text-red-500" : ""
                    }`}
                  />
                </Button>
              </div>

              <Button
                variant="ghost"
                size="lg"
                className="w-full"
                onClick={() => navigate("/products")}
              >
                Continue Shopping
              </Button>
            </div>

            <Card className="bg-muted/50">
              <CardContent className="p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Brand:</span>
                  <span className="font-medium">
                    {product.brand?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Category:</span>
                  <span className="font-medium">
                    {product.category?.name || "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Availability:</span>
                  <span className="font-medium">
                    {product.stock > 0 ? "In Stock" : "Out of Stock"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
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

export default ProductDetail;
