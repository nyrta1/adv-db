import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ShoppingBag, LogOut, User, Settings } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👟</span>
            <h1 className="text-2xl font-bold">ShoeStore</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/admin")}>
              <Settings className="mr-2 h-4 w-4" />
              Admin
            </Button>
            <Button variant="outline" onClick={() => navigate("/profile")}>
              <User className="mr-2 h-4 w-4" />
              Profile
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Welcome to ShoeStore!</h2>
            <p className="text-xl text-muted-foreground">
              You've successfully logged in. Start exploring our collection of premium footwear.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mt-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="h-5 w-5" />
                  Browse Shoes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Explore our latest collection of shoes for every occasion
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  Featured
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Check out our featured products and special deals
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Your Style
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Personalized recommendations just for you
                </CardDescription>
              </CardContent>
            </Card>
          </div>

          <div className="pt-8">
            <Button size="lg" className="text-lg px-8" onClick={() => navigate("/products")}>
              <ShoppingBag className="mr-2 h-5 w-5" />
              Start Shopping
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
