import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  Eye,
  Heart,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";

const API_BASE = "http://localhost:3000";

const UserProfile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<any>(null);
  const [viewed, setViewed] = useState<any[]>([]);
  const [liked, setLiked] = useState<any[]>([]);
  const [bought, setBought] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("userData");

        if (!token || !storedUser) {
          toast({
            variant: "destructive",
            title: "Unauthorized",
            description: "Please login to access your profile.",
          });
          navigate("/login");
          return;
        }

        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);

        const res = await axios.get(`${API_BASE}/users/${parsedUser.id}/history`, {
          withCredentials: true,
          headers: { Authorization: token },
        });

const allHistory = res.data.history || [];

const uniqueHistoryMap = new Map();

for (const h of allHistory) {
  const existing = uniqueHistoryMap.get(h.id);
  if (!existing || new Date(h.timestamp?.year?.low, h.timestamp?.month?.low, h.timestamp?.day?.low, h.timestamp?.hour?.low, h.timestamp?.minute?.low, h.timestamp?.second?.low) >
      new Date(existing.timestamp?.year?.low, existing.timestamp?.month?.low, existing.timestamp?.day?.low, existing.timestamp?.hour?.low, existing.timestamp?.minute?.low, existing.timestamp?.second?.low)
  ) {
    uniqueHistoryMap.set(h.id, h);
  }
}

const uniqueHistory = Array.from(uniqueHistoryMap.values());

uniqueHistory.sort((a, b) => {
  const da = new Date(a.timestamp?.year?.low, a.timestamp?.month?.low, a.timestamp?.day?.low, a.timestamp?.hour?.low, a.timestamp?.minute?.low, a.timestamp?.second?.low);
  const db = new Date(b.timestamp?.year?.low, b.timestamp?.month?.low, b.timestamp?.day?.low, b.timestamp?.hour?.low, b.timestamp?.minute?.low, b.timestamp?.second?.low);
  return db - da;
});

setViewed(uniqueHistory.filter((h) => h.type === "VIEWED"));
setLiked(uniqueHistory.filter((h) => h.type === "LIKED"));
setBought(uniqueHistory.filter((h) => h.type === "BOUGHT"));

      } catch (err: any) {
        console.error("Failed to fetch user history:", err);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load user history or profile info.",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserHistory();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-muted-foreground">
        Loading profile...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="text-3xl">👟</span>
            <h1 className="text-2xl font-bold">NeoStore</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/home")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>
      </header>

      {/* Main */}
      <main className="container mx-auto px-4 py-12 space-y-8">
        <div className="max-w-4xl mx-auto">
          {/* 👤 User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <User className="h-6 w-6" />
                User Profile
              </CardTitle>
              <CardDescription>
                View and manage your account information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                <Input id="name" defaultValue={user?.name || "—"} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                <Input id="email" defaultValue={user?.email || "—"} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Age
                </Label>
                <Input
                  id="age"
                  type="number"
                  defaultValue={user?.age || "—"}
                  disabled
                />
              </div>
              <Button className="w-full mt-4">Edit Profile</Button>
            </CardContent>
          </Card>

          {/* 🕓 Activity */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-2xl">Activity History</CardTitle>
              <CardDescription>
                Your viewed, liked, and purchased products
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="viewed" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="viewed">
                    <Eye className="mr-2 h-4 w-4" /> Viewed
                  </TabsTrigger>
                  <TabsTrigger value="liked">
                    <Heart className="mr-2 h-4 w-4" /> Liked
                  </TabsTrigger>
                  <TabsTrigger value="bought">
                    <ShoppingBag className="mr-2 h-4 w-4" /> Bought
                  </TabsTrigger>
                </TabsList>

                {/* VIEWED */}
                <TabsContent value="viewed" className="space-y-4 mt-6">
                  {viewed.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No viewed products yet
                    </p>
                  ) : (
                    viewed.map((p) => (
                      <Card
                        key={p.id}
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => navigate(`/products/${p.id}`)}
                      >
                        <div className="flex gap-4 p-4">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {p.brand?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Badge variant="outline">
                                {p.category?.name}
                              </Badge>
                              <span>• Viewed recently</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* LIKED */}
                <TabsContent value="liked" className="space-y-4 mt-6">
                  {liked.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No liked products yet
                    </p>
                  ) : (
                    liked.map((p) => (
                      <Card
                        key={p.id}
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => navigate(`/products/${p.id}`)}
                      >
                        <div className="flex gap-4 p-4">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {p.brand?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Heart className="h-3 w-3 text-red-500 fill-red-500" />
                              <span>Liked recently</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>

                {/* BOUGHT */}
                <TabsContent value="bought" className="space-y-4 mt-6">
                  {bought.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">
                      No purchased products yet
                    </p>
                  ) : (
                    bought.map((p) => (
                      <Card
                        key={p.id}
                        className="hover:shadow-lg transition cursor-pointer"
                        onClick={() => navigate(`/products/${p.id}`)}
                      >
                        <div className="flex gap-4 p-4">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-24 h-24 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {p.brand?.name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <ShoppingBag className="h-3 w-3" />
                              <span>Purchased recently</span>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default UserProfile;
