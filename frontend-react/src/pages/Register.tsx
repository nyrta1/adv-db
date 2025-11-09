import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Mail, Lock, User, Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import axios from "axios";

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    age: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Name is required",
      });
      return false;
    }
    if (!formData.email.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Email is required",
      });
      return false;
    }
    if (!formData.email.includes("@")) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid email address",
      });
      return false;
    }
    if (!formData.age.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Age is required",
      });
      return false;
    }
    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Please enter a valid age",
      });
      return false;
    }
    if (!formData.password.trim()) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password is required",
      });
      return false;
    }
    if (formData.password.length < 6) {
      toast({
        variant: "destructive",
        title: "Validation Error",
        description: "Password must be at least 6 characters",
      });
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await axios.post("http://localhost:3000/users/register", {
        name: formData.name,
        email: formData.email,
        age: parseInt(formData.age),
        password: formData.password,
      });

      if (response.data.success) {
        const user = response.data.user;
        const credentials = btoa(`${formData.email}:${formData.password}`);
        const basicToken = `Basic ${credentials}`;

        localStorage.setItem("authToken", basicToken);
        localStorage.setItem("userData", JSON.stringify(user));

        toast({
          title: "Registration Successful!",
          description: `Welcome, ${user.name}! Redirecting...`,
          className: "bg-success text-success-foreground",
        });

        setTimeout(() => navigate("/home"), 500);
      } else {
        toast({
          variant: "destructive",
          title: "Registration Failed",
          description: response.data?.message || "Server error",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description:
          error.response?.data?.message ||
          "Something went wrong. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 text-center">
          <div className="text-5xl mb-2">👟</div>
          <CardTitle className="text-3xl font-bold">ShoeStore</CardTitle>
          <CardDescription className="text-base">
            Create your account to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="name"
                  name="name"
                  type="text"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="age"
                  name="age"
                  type="number"
                  placeholder="25"
                  value={formData.age}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={isLoading}
                  min="1"
                  max="120"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Register"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">
              Already have an account?{" "}
            </span>
            <Link
              to="/login"
              className="text-primary font-medium hover:underline"
            >
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
