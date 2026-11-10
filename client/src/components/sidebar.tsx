import {
  Users,
  Settings,
  LayoutDashboard,
  Edit3,
  Bell,
  Shield,
  Eye,
  EyeOff,
  AlertTriangle,
  FileText,
  X,
  LogIn,
  ThumbsUp,
  Check,
  Clock,
  Bug,
  LogOutIcon,
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import acmeHealthLogo from "@assets/acme-health-logo.svg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRole } from "@/contexts/RoleContext";
import { useQuery } from "@tanstack/react-query";
import { fetchWithCredentials, getLoggedInUser, routeAccessRules } from "@/lib/utils";
import { json } from "stream/consumers";
import { queryClient } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";


export function Sidebar() {
  const [location, setLocation] = useLocation();
  const { isAdminMode, setIsAdminMode } = useRole();
  const [testLoginMode, setTestLoginMode] = useState(false);
  const [ssoMode, setSsoMode] = useState(false);
  const [activeDirectoryMode, setActiveDirectoryMode] = useState(true);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("user") !== null;
  });
  const [loginError, setLoginError] = useState("");

  // Brute force protection states
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<number | null>(null);
  const [showLockoutDialog, setShowLockoutDialog] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0);

  // Form states
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpName, setSignUpName] = useState("");
  const [signUpDepartment, setSignUpDepartment] = useState("");

  // Fetch users data for authentication
  const { data: usersData } = useQuery({
    queryKey: ["/api/users"],
    enabled: testLoginMode,
  });

  // Initialize lockout state from localStorage on component mount
  useEffect(() => {
    const savedLockoutEndTime = localStorage.getItem("lockoutEndTime");
    const savedFailedAttempts = localStorage.getItem("failedAttempts");

    if (savedLockoutEndTime) {
      const endTime = parseInt(savedLockoutEndTime);
      const now = Date.now();

      if (endTime > now) {
        setIsLocked(true);
        setLockoutEndTime(endTime);
        setRemainingTime(endTime - now);
        if (savedFailedAttempts) {
          setFailedAttempts(parseInt(savedFailedAttempts));
        }
      } else {
        // Lockout expired, clear localStorage
        localStorage.removeItem("lockoutEndTime");
        localStorage.removeItem("failedAttempts");
      }
    }
  }, []);

  // Countdown timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isLocked && lockoutEndTime) {
      interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(0, lockoutEndTime - now);
        setRemainingTime(remaining);

        if (remaining === 0) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setFailedAttempts(0);
          setShowLockoutDialog(false);
          // Clear localStorage when lockout expires
          localStorage.removeItem("lockoutEndTime");
          localStorage.removeItem("failedAttempts");
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLocked, lockoutEndTime]);

  // Format remaining time as MM:SS
  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  // Password validation
  const validatePassword = (password: string) => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    const score = Object.values(requirements).filter(Boolean).length;
    return {
      requirements,
      isStrong: score >= 4,
      score,
    };
  };

  const passwordValidation = validatePassword(signUpPassword);

  const handleTestLoginToggle = () => {
    if (isAuthenticated) {
      setIsAuthenticated(false);
      setTestLoginMode(false);
    } else if (isLocked) {
      setShowLockoutDialog(true);
    } else {
      setTestLoginMode(true);
      setShowLoginDialog(true);
    }
  };

  const handleSSOToggle = async () => {
    try {
      const response = await fetchWithCredentials("/api/sso/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ enabled: !ssoMode }),
      });

      if (response.ok) {
        const data = await response.json();
        setSsoMode(data.enabled);
        // console.log(`SSO ${data.enabled ? "enabled" : "disabled"}`);
      } else {
        // console.error("Failed to toggle SSO");
      }
    } catch (error) {
      // console.error("SSO toggle error:", error);
    }
  };

  const handleActiveDirectoryToggle = () => {
    setActiveDirectoryMode(!activeDirectoryMode);
    if (!activeDirectoryMode) {
      // console.log("Active Directory integration enabled");
      localStorage.setItem("activeDirectoryMode", "true");
    } else {
      // console.log("Active Directory integration disabled");
      localStorage.removeItem("activeDirectoryMode");
    }
  };

  const handleSignIn = () => {
    setLoginError("");
    if (!signInEmail) {
      setLoginError("Please enter your email");
      return;
    }

    const emailPrefix = signInEmail.split("@")[0];
    const users = (usersData as any)?.users || [];
    const foundUser = users.find((user: any) => {
      const userEmailPrefix = user.email.split("@")[0];
      return userEmailPrefix === emailPrefix;
    });

    if (foundUser) {
      // Successful login - reset failed attempts
      setIsAuthenticated(true);
      setShowLoginDialog(false);
      setSignInEmail("");
      setSignInPassword("");
      setLoginError("");
      setFailedAttempts(0);
      // Clear localStorage on successful login
      localStorage.removeItem("lockoutEndTime");
      localStorage.removeItem("failedAttempts");
    } else {
      // Failed login - increment attempts
      const newFailedAttempts = failedAttempts + 1;
      setFailedAttempts(newFailedAttempts);

      if (newFailedAttempts >= 3) {
        // Lock out for 25 minutes (1500 seconds)
        const lockoutDuration = 25 * 60 * 1000; // 25 minutes in milliseconds
        const endTime = Date.now() + lockoutDuration;

        setIsLocked(true);
        setLockoutEndTime(endTime);
        setRemainingTime(lockoutDuration);
        setShowLoginDialog(false);
        setShowLockoutDialog(true);

        // Save lockout state to localStorage
        localStorage.setItem("lockoutEndTime", endTime.toString());
        localStorage.setItem("failedAttempts", newFailedAttempts.toString());

        // Redirect to access denied page
        setLocation("/access-denied");
      } else {
        setLoginError(
          `Login unsuccessful. ${3 - newFailedAttempts} attempt(s) remaining.`
        );
        // Save failed attempts to localStorage
        localStorage.setItem("failedAttempts", newFailedAttempts.toString());
      }
    }
  };

  const handleSignUp = () => {
    setLoginError("");
    if (!signUpEmail || !signUpName || !signUpDepartment) {
      setLoginError("Please fill in all fields");
      return;
    }

    const emailPrefix = signUpEmail.split("@")[0];
    const users = (usersData as any)?.users || [];
    const existingUser = users.find((user: any) => {
      const userEmailPrefix = user.email.split("@")[0];
      return userEmailPrefix === emailPrefix;
    });

    if (existingUser) {
      setLoginError("User already exists. Please sign in instead.");
      return;
    }

    // In a real app, this would create the user in the database
    setIsAuthenticated(true);
    setShowLoginDialog(false);
    setSignInEmail("");
    setSignInPassword("");
    setSignUpEmail("");
    setSignUpPassword("");
    setSignUpName("");
    setSignUpDepartment("");
    setLoginError("");
  };

  // export function Sidebar() {
  // const [location, setLocation] = useLocation();
  // const [isAuthenticated, setIsAuthenticated] = useState(() => {
  //   return sessionStorage.getItem("user") !== null;
  // });

  const generateUserInitials = (user: any) => {
    if (!user || !user.name) return "";
    const names = user.name.split(" ");
    const initials = names
      .map((n: string) => n.charAt(0).toUpperCase())
      .join("");
    return initials;
  };

  const user = JSON.parse(sessionStorage.getItem("user") || "{}");

  const [userName] = useState(user.name || "");
  const [userInitials] = useState(generateUserInitials(user) || "");

  useEffect(() => {
    setIsAdminMode(getLoggedInUser().group?.split(':')?.includes('hrleader'));
  }, [user.Role]);

  // const [isAdminMode, setIsAdminMode] = useState(user.department === "Human Resources");

  const handleLoginCancel = () => {
    setShowLoginDialog(false);
    setTestLoginMode(false);
    setLocation("/access-denied");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      path: "/dashboard",
      active: false,
    },
    { icon: Users, label: "Jobs", path: "/jobs", active: true },
    {
      icon: Edit3,
      label: "Editing",
      path: "/editing",
      active: false,
      hidden: true,
    },
    {
      icon: FileText,
      label: "Job Final Review",
      path: "/job-final-review",
      active: false,
      hidden: true,
    },
    {
      icon: Bell,
      label: "Notifications",
      path: "/notifications",
      active: false,
    },

    { icon: Settings, label: "Settings", path: "/settings", active: false },
    {
      icon: LogOutIcon,
      label: "Sign Out",
      path: "/logout",
      active: false,
      hidden: !isAuthenticated,
      onClick: async() => {
        try {
          await fetchWithCredentials('/api/logout');
          sessionStorage.removeItem("user");
          sessionStorage.removeItem("HRLeader");
          sessionStorage.removeItem("dashboardAuthenticated");
          setIsAuthenticated(false);
          window.location.href = "/login"; // Refresh the page after sign out
          
        } catch (error) {
          toast({
            title: "Error",
            description: "Failed to sign out",
            variant: "destructive",
          });
        }
      },
    },
  ];

const userFromSession = getLoggedInUser();

const filterMenuItems = menuItems.filter((item) => {
  if (!userFromSession) return false;

  // Find matching route access rule for this menu path
  const rule = routeAccessRules.find((route) => route.path === item.path);

  if (!rule) return true; // If no rule is defined, allow access

  return rule.allow(userFromSession);
});




  const saveSearchPreferences = async (preferences: string) => {
    const response = await fetchWithCredentials("/api/users/savepreferences/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // id: getLoggedInUser().id,
        pageName: "sidebar",
        preferences,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to save user preferences");
    }
    queryClient.invalidateQueries({
      queryKey: ["userSidebarPreferences"],
    });
    return response.json();
  };

  const { data: searchPreferences } = useQuery({
    queryKey: ["userSidebarPreferences"],
    queryFn: async () => {
      const response = await fetchWithCredentials(
        `/api/users/fetchpreferences/sidebar`
      );
      if (!response.ok) throw new Error("Failed to fetch user preferences");
      return await response.json();
    },
  });

  useEffect(() => {
    let defaultVal = false;
    if (user.department === "Human Resources") {
      defaultVal = !isAdminMode;
    }

    const defaultJson = `[{"role":${defaultVal}}]`;
    if (searchPreferences && searchPreferences.FilterJson) {
      const preferences = JSON.parse(
        searchPreferences.FilterJson || defaultJson
      );
      const merged = Object.assign({}, ...preferences);
      setIsAdminMode(merged.role === true);
    }
  }, [searchPreferences]);

  return (
    <div className="bg-blue-900 text-white w-64 shrink-0 h-screen sticky top-0 overflow-y-auto p-4 flex flex-col">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <div className="bg-white rounded-lg p-3">
          <img
            src={acmeHealthLogo}
            alt="Acme Health Logo"
            className="w-44 h-auto mx-auto"
          />
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="space-y-2 flex-1">
        {filterMenuItems
          .filter((item) => !item.hidden)
          .map((item: any) => {
            const Icon = item.icon;
            // Special case for Jobs Family: highlight when on root path or jobs path
            const isActive =
              item.path === "/jobs"
                ? location === "/" || location === "/jobs"
                : location === item.path;

            const handleClick = (e: React.MouseEvent) => {
              if (item.onClick) {
                e.preventDefault();
                item.onClick();
              }
            };

            const href = item.onClick ? "#" : item.path;

            return (
              <Link key={item.path} href={href}>
                <div
                  className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
                    isActive
                      ? "bg-blue-700 text-white"
                      : "text-blue-200 hover:bg-blue-800 hover:text-white"
                  }`}
                  onClick={handleClick}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
              </Link>
            );
          })}
      </nav>

      {/* Role Toggle - positioned above user profile */}

      {/* {getLoggedInUser().role == "Admin" && (
        <div className="mb-6">
          <div className="bg-blue-800 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-blue-200 text-sm font-medium">Role</span>
              <div className="relative">
                <button
                  onClick={async () => {
                    if (user.department === "Human Resources") {
                      setIsAdminMode(!isAdminMode);
                    }

                    const preferences = [
                      {
                        role: !isAdminMode,
                      },
                    ];
                    await saveSearchPreferences(JSON.stringify(preferences));
                    // Do nothing if not Human Resources
                  }}
                  disabled={user.department !== "Human Resources"}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                    user.department === "Human Resources"
                      ? "bg-blue-600"
                      : "bg-blue-700 opacity-50 cursor-not-allowed"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isAdminMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
            <div className="text-center">
              <span className="text-white text-sm font-medium">
                {isAdminMode ? "Admin" : "Reviewer"}
              </span>
            </div>
          </div>
        </div>
      )} */}

          {/* SSO Toggle */}
          {/* <div className="mb-4">
        <div className="bg-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">SSO</span>
            </div>
            <div className="relative">
              <button
                onClick={handleSSOToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                  ssoMode ? 'bg-green-600' : 'bg-blue-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    ssoMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="text-center">
            <span className={`text-sm font-medium ${ssoMode ? 'text-green-200' : 'text-white'}`}>
              {ssoMode ? 'Enabled' : 'Disabled'}
            </span>
          </div>
        </div>
      </div> */}

          {/* Active Directory Toggle */}
          {/* <div className="mb-6">
        <div className="bg-blue-800 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Bug className="w-4 h-4 text-blue-200" />
              <span className="text-blue-200 text-sm font-medium">Active Directory</span>
            </div>
            <div className="relative">
              <button
                onClick={handleActiveDirectoryToggle}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-blue-900 ${
                  activeDirectoryMode ? 'bg-orange-600' : 'bg-blue-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    activeDirectoryMode ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
          <div className="text-center">
            <span className={`text-sm font-medium ${activeDirectoryMode ? 'text-orange-200' : 'text-white'}`}>
              {activeDirectoryMode ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div> */}
      

      {/* User Profile - positioned at bottom */}
      <div className="mb-4">
        <div className="flex items-center space-x-3 p-3 text-blue-200 rounded-lg">
          <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">
              {userInitials}
            </span>
          </div>
          <div className="flex flex-col" >
            <span className="text-sm font-medium">{userName}</span>
            <span className="text-xs text-blue-300">{user?.role}</span>
          </div>
        </div>
      </div>

      {/* Test User Login Dialog */}
      <Dialog open={showLoginDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center space-x-2">
                <LogIn className="w-5 h-5 text-blue-600" />
                <span>User Authentication</span>
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLoginCancel}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  name="signin-unique-field-xyz123"
                  type="text"
                  value={signInEmail}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (
                      value.includes("@") &&
                      !value.includes("@acme-health.com")
                    ) {
                      value = value.split("@")[0] + "@acme-health.com";
                    }
                    setSignInEmail(value);
                  }}
                  placeholder="Enter email"
                  onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Input
                    id="signin-password"
                    name="signin-password-field-xyz789"
                    type={showSignInPassword ? "text" : "password"}
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    placeholder="Enter password"
                    onKeyPress={(e) => e.key === "Enter" && handleSignIn()}
                    autoComplete="one-time-code"
                    autoCorrect="off"
                    spellCheck="false"
                    data-form-type="other"
                    className="pr-10"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowSignInPassword(!showSignInPassword)}
                  >
                    {showSignInPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400" />
                    )}
                  </Button>
                </div>
              </div>

              {loginError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {loginError}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleLoginCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSignIn}
                  disabled={!signInEmail || !signInPassword}
                >
                  Submit
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  name="signup-unique-field-abc456"
                  type="text"
                  value={signUpEmail}
                  onChange={(e) => {
                    let value = e.target.value;
                    if (
                      value.includes("@") &&
                      !value.includes("@acme-health.com")
                    ) {
                      value = value.split("@")[0] + "@acme-health.com";
                    }
                    setSignUpEmail(value);
                  }}
                  placeholder="Enter email"
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="signup-password">Password</Label>
                  {passwordValidation.isStrong && (
                    <ThumbsUp className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <Input
                  id="signup-password"
                  name="signup-password-field-abc123"
                  type="text"
                  value={signUpPassword}
                  onChange={(e) => setSignUpPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                />
                <div className="text-xs space-y-1">
                  <div className="text-gray-600 font-medium">
                    Password Requirements:
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      passwordValidation.requirements.length
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    <span>At least 8 characters</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      passwordValidation.requirements.uppercase
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    <span>One uppercase letter</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      passwordValidation.requirements.lowercase
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    <span>One lowercase letter</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      passwordValidation.requirements.number
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    <span>One number</span>
                  </div>
                  <div
                    className={`flex items-center space-x-1 ${
                      passwordValidation.requirements.special
                        ? "text-green-600"
                        : "text-gray-400"
                    }`}
                  >
                    <Check className="h-3 w-3" />
                    <span>One special character</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  name="signup-name-field-def789"
                  type="text"
                  value={signUpName}
                  onChange={(e) => setSignUpName(e.target.value)}
                  placeholder="Enter your full name"
                  autoComplete="one-time-code"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-department">Department</Label>
                <Select
                  value={signUpDepartment}
                  onValueChange={setSignUpDepartment}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select your department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Human Resources">
                      Human Resources
                    </SelectItem>
                    <SelectItem value="Information Technology">
                      Information Technology
                    </SelectItem>
                    <SelectItem value="Finance">Finance</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Operations">Operations</SelectItem>
                    <SelectItem value="Sales">Sales</SelectItem>
                    <SelectItem value="Customer Service">
                      Customer Service
                    </SelectItem>
                    <SelectItem value="Research & Development">
                      Research & Development
                    </SelectItem>
                    <SelectItem value="Quality Assurance">
                      Quality Assurance
                    </SelectItem>
                    <SelectItem value="Legal">Legal</SelectItem>
                    <SelectItem value="Facilities">Facilities</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {loginError && (
                <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
                  {loginError}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={handleLoginCancel}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSignUp}
                  disabled={
                    !signUpEmail ||
                    !signUpPassword ||
                    !signUpName ||
                    !signUpDepartment ||
                    !passwordValidation.isStrong
                  }
                >
                  Submit
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Lockout Dialog */}
      <Dialog open={showLockoutDialog} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-[400px] [&>button]:hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2 text-red-600">
              <AlertTriangle className="w-5 h-5" />
              <span>Account Temporarily Locked</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Clock className="w-8 h-8 text-red-500" />
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Too many failed login attempts. Your account has been
                temporarily locked for security purposes.
              </p>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm font-medium text-red-800 mb-2">
                  Time Remaining:
                </p>
                <div className="text-2xl font-bold text-red-600 font-mono">
                  {formatTime(remainingTime)}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-4">
                Please wait until the timer expires before attempting to log in
                again.
              </p>
            </div>

            <div className="flex justify-center space-x-3">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLockoutDialog(false);
                  setLocation("/access-denied");
                }}
              >
                OK
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowLockoutDialog(false);
                  setLocation("/access-denied");
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
