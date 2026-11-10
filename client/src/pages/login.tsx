import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertTriangle, Clock, Shield, Loader2 } from "lucide-react";
import { fetchWithCredentials, routeToRedirect } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import acmeHealthLogo from "@assets/acme-health-logo.svg";

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState({
    admin: true,
    hrleader: true,
    functionalleader: true,
  });

  // Active Directory authentication mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
        // const hashedPassword = SHA256(password).toString();
      // roles are joined like admin:hrleader:functionalleader


      //fix ts error
      const role = Object.keys(roles).filter(key => (roles as any)[key] === true).join(':')
            
      const response = await fetch('/api/user/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, role}),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Authentication failed');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome ${data.user.name}`,
      });

      //save user to session storage
      sessionStorage.setItem("user", JSON.stringify(data.user));
      
      const route = routeToRedirect(data.user)
      // console.log('route', route)
      setLocation(route)

    },
    onError: (error: Error) => {

      
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      setLoginError("Please enter your username and password");
      return;
    }

    setLoginError("");
    loginMutation.mutate({ email, password });
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <div className="bg-white p-2">
              <img
                src={acmeHealthLogo}
                alt="Acme Health Logo"
                className="w-44 h-auto object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Job Management System</h1>
          <p className="text-gray-600 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            Sign in with your credentials
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Username</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your username"
              disabled={loginMutation.isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                disabled={loginMutation.isPending}
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          <div className="space-y-4" >
            <label htmlFor="">Choose your role</label>
            <div className="flex gap-2 items-center" >
              <Checkbox id="admin" name="admin" checked={roles.admin} onCheckedChange={(value: boolean) => setRoles({ ...roles, admin: value })} />
              <label htmlFor="admin" className="text-sm" >Admin</label>
            </div>
            <div className="flex gap-2 items-center" >
              <Checkbox id="hrleader" name="hrleader" checked={roles.hrleader} onCheckedChange={(value: boolean) => setRoles({ ...roles, hrleader: value })} />
              <label htmlFor="hrleader" className="text-sm" >HR Leader</label>
            </div>
            <div className="flex gap-2 items-center" >
              <Checkbox id="functionalleader" name="functionalleader" checked={roles.functionalleader} onCheckedChange={(value: boolean) => setRoles({ ...roles, functionalleader: value })} />
              <label htmlFor="functionalleader" className="text-sm" >Functional Leader</label>
            </div>
          </div>
          
          {loginError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {loginError}
            </div>
          )}

          {/* {failedAttempts > 0 && failedAttempts < 5 && (
            <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded">
              {5 - failedAttempts} attempt(s) remaining before account lockout
            </div>
          )} */}

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loginMutation.isPending}
          >
            {loginMutation.isPending ? "Authenticating..." : "Sign In"}
          </Button>
        </form>

        {/* <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure authentication through Acme Health Active Directory</p>
          <p className="mt-1">Contact IT support if you need assistance</p>
        </div> */}
      </div>
    </div>
  );
}