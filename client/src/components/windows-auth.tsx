import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { User, X, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { fetchWithCredentials } from "@/lib/utils";

interface WindowsAuthProps {
  onAuthenticated: (userData: { username: string, fullName: string, email: string }) => void;
}

export function WindowsAuth({ onAuthenticated }: WindowsAuthProps) {
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true); // Start in loading state

  useEffect(() => {
    // This effect runs once when the component mounts to check for SSO
    const attemptSso = async () => {
      try {
        const response = await fetchWithCredentials('/api/auth/windows-user');
        if (!response.ok) throw new Error('SSO check failed');
        
        const ssoUser = await response.json();

        if (ssoUser && ssoUser.isAuthenticated) {
          // SSO SUCCESS: Automatically authenticate the user
          const userData = {
            username: ssoUser.username,
            fullName: ssoUser.username, // Use username as fullName for now
            email: `${ssoUser.username}@acme-health.com` // Construct an email
          };
          
          // You might want to check if this user exists in your DB
          // and create them if not, before calling onAuthenticated.
          // For now, we'll just pass the data.
          onAuthenticated(userData);

        } else {
          // SSO FAILED: Show the manual registration form
          setIsLoading(false);
          setShowAuthDialog(true);
        }
      } catch (error) {
        // console.error("Error during SSO attempt:", error);
        // On error, fall back to manual registration
        setIsLoading(false);
        setShowAuthDialog(true);
      }
    };

    attemptSso();
  }, [onAuthenticated]);


  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    }
    
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      const userData = { username, fullName, email };
      
      // Save user data to reviewers table via API
      const response = await fetchWithCredentials('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Save to localStorage for future sessions
        localStorage.setItem('windowsAuthUser', JSON.stringify(userData));
        
        toast({
          title: "Authentication Successful",
          description: "User registered successfully",
        });
        
        setShowAuthDialog(false);
        onAuthenticated(userData);
      } else {
        toast({
          title: "Registration Failed",
          description: "Failed to register user",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred during registration",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setShowAuthDialog(false);
  };

  // While checking for SSO, show a loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // If SSO fails, show the manual registration dialog
  return (
    <Dialog open={showAuthDialog} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-blue-600" />
            <DialogTitle>Windows Authentication</DialogTitle>
          </div>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Username
            </label>
            <Input
              type="text"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-red-500 text-sm mt-1">{errors.username}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Full Name
            </label>
            <Input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={errors.fullName ? "border-red-500" : ""}
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-2">
              Email Address
            </label>
            <Input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>
          
          <Button type="submit" className="w-full bg-blue-600 text-white hover:bg-blue-700">
            Register & Continue
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
