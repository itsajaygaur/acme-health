import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, AlertTriangle, Clock, Shield, Loader2 } from "lucide-react";
// import SHA256 from 'crypto-js/sha256';
import { fetchWithCredentials, getLoggedInUser, routeToRedirect } from "@/lib/utils";
import acmeHealthLogo from "@assets/acme-health-logo.svg";

export default function AdLogin() {
  const [, setLocation] = useLocation();
  const [loginError, setLoginError] = useState("");
  const { toast } = useToast();
  
  // Brute force protection states
  // const [failedAttempts, setFailedAttempts] = useState(0);
  // const [isLocked, setIsLocked] = useState(false);
  // const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  // const [remainingTime, setRemainingTime] = useState(0);
  
  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [domain, setDomain] = useState("@acme-health.com");

  // Active Directory authentication mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: { email: string; password: string, domain: string }) => {
        // const hashedPassword = SHA256(password).toString();
      const response = await fetchWithCredentials('/api/ad/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: email, password: password, domain }),
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
      
      // Reset lockout state on successful login
      // localStorage.removeItem('lockoutEndTime');
      // localStorage.removeItem('failedAttempts');
      // setFailedAttempts(0);
      // setIsLocked(false);
      
      // Redirect to dashboard
      // setLocation('/dashboard');
      const route = routeToRedirect(data.user)
      setLocation(route)
      // if(data.user.IsHRLeader === true || getLoggedInUser().role === "Admin") {
      //   window.location.href = '/dashboard';
      // } else {
      //   window.location.href = '/jobs';
      // }
    },
    onError: (error: Error) => {
      
      toast({
        title: "Authentication Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // // Initialize lockout state from localStorage on component mount
  // useEffect(() => {
  //   const savedLockoutEndTime = localStorage.getItem('lockoutEndTime');
  //   const savedFailedAttempts = localStorage.getItem('failedAttempts');
    
  //   if (savedLockoutEndTime) {
  //     const endTime = parseInt(savedLockoutEndTime);
  //     const currentTime = Date.now();
      
  //     if (currentTime < endTime) {
  //       // Still locked out
  //       setIsLocked(true);
  //       setLockoutEndTime(endTime);
  //       setRemainingTime(endTime - currentTime);
  //     } else {
  //       // Lockout has expired
  //       localStorage.removeItem('lockoutEndTime');
  //       localStorage.removeItem('failedAttempts');
  //       setIsLocked(false);
  //       setFailedAttempts(0);
  //     }
  //   }
    
  //   if (savedFailedAttempts) {
  //     setFailedAttempts(parseInt(savedFailedAttempts));
  //   }
  // }, []);

  // Timer effect for lockout countdown
  // useEffect(() => {
  //   if (isLocked && lockoutEndTime) {
  //     const timer = setInterval(() => {
  //       const currentTime = Date.now();
  //       const timeLeft = lockoutEndTime - currentTime;
        
  //       if (timeLeft <= 0) {
  //         // Lockout has expired
  //         setIsLocked(false);
  //         setLockoutEndTime(null);
  //         setRemainingTime(0);
  //         setFailedAttempts(0);
  //         localStorage.removeItem('lockoutEndTime');
  //         localStorage.removeItem('failedAttempts');
  //         clearInterval(timer);
  //       } else {
  //         setRemainingTime(timeLeft);
  //       }
  //     }, 1000);
      
  //     return () => clearInterval(timer);
  //   }
  // }, [isLocked, lockoutEndTime]);

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    
    // if (isLocked) {
    //   toast({
    //     title: "Account Locked",
    //     description: `Please wait ${Math.ceil(remainingTime / 60000)} minutes before trying again`,
    //     variant: "destructive",
    //   });
    //   return;
    // }

    if (!email || !password) {
      setLoginError("Please enter your OPID and password");
      return;
    }

    setLoginError("");
    loginMutation.mutate({ email, password, domain });
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  //   const { data, isPending, isError } = useQuery({
  //   queryKey: ['ad-users'],
  //   queryFn: () => fetchWithCredentials('/api/auth/ad', {
  //     method: 'GET',
  //     credentials: 'include',
  //   }).then(res => {
  //     if (!res.ok) {
  //       // This will cause the isError state to be true
  //       throw new Error('Authentication failed');
  //     }
  //     return res.json();
  //   }),
  //   retry: false, // Important: prevent retrying on auth errors
  // });

  // if (isPending) {
  //   return <div className="h-screen grid place-content-center" ><Loader2 className="animate-spin h-10 w-10 text-blue-500" /> </div>;
  // }

  // if (data?.success && data?.user) {
  //   // Set the user session so the rest of the app knows the user is logged in
  //   sessionStorage.setItem('user', JSON.stringify(data.user));
  //   setLocation('/jobs');
  //   return
  // }


  // if (isLocked) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center">
  //       <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
  //         <div className="text-center space-y-4">
  //           <div className="flex items-center justify-center space-x-2 mb-4">
  //             <AlertTriangle className="w-8 h-8 text-red-500" />
  //             <h2 className="text-xl font-bold text-red-600">Account Temporarily Locked</h2>
  //           </div>
  //           <p className="text-sm text-gray-600">
  //             Too many failed login attempts. Your account has been temporarily locked for security purposes.
  //           </p>
  //           <div className="bg-red-50 border border-red-200 rounded-lg p-4">
  //             <p className="text-sm font-medium text-red-800 mb-2">Time Remaining:</p>
  //             <div className="text-2xl font-bold text-red-600 font-mono">
  //               {formatTime(remainingTime)}
  //             </div>
  //           </div>
  //           <Button onClick={() => setLocation('/')} className="w-full">
  //             Return to Home
  //           </Button>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

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
            <Label htmlFor="email"> OPID</Label>
            <Input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your OPID"
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

          <div className="my-4" >
            <label htmlFor="">Domain</label>
          <select value={domain} onChange={(e) => setDomain(e.target.value)} className="w-full p-3 rounded-lg border">
            <option value="@acme-health.com">acme-health.com</option>
            {/* <option value="localhost">localhost</option> */}
          </select>
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

        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Secure authentication through Active Directory</p>
          <p className="mt-1">Contact IT support if you need assistance</p>
        </div>
      </div>
    </div>
  );
}