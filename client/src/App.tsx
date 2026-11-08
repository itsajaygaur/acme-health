import { Switch, Route, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider, useQuery } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WindowsAuth } from "@/components/windows-auth";
import { RoleProvider } from "@/contexts/RoleContext";
import { useState } from "react";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import JobsFamily from "@/pages/jobs-family";
import Editing from "@/pages/editing";
import JobFinalReview from "@/pages/job-final-review";
import Users from "@/pages/users";
import Notifications from "@/pages/notifications";
import Downloads from "@/pages/downloads";
import CompareVersions from "@/pages/compare-versions";
import Settings from "@/pages/settings";
import AccessDenied from "@/pages/access-denied";
import NotFound from "@/pages/not-found";
import { fetchWithCredentials, getLoggedInUser, User } from "./lib/utils";
import { useLocation } from "wouter";
import { Loader2 } from "lucide-react";
import AdLogin from "./pages/AdLogin";
import Crypto from "./pages/Crypto";
import ProtectedRoute from "./components/protected-route";

const publicRoutes = ["/login", "/", "/admin-login", "/crypto"]

function Router() {

  const [location, setLocation] = useLocation();
  const { data, isPending, isSuccess, isError, isFetching } = useQuery({
    queryKey: ["/api/verify-token"],
    queryFn: async () => {
      const response = await fetchWithCredentials("/api/verify-token");
      if (!response.ok) throw new Error("Failed to verify token");
      return await response.json();
    },
    // enabled: location !== "/login" && location !== "/" && location !== "/admin-login",
    enabled: !publicRoutes.includes(location),
  });

  if(isPending && isFetching) return (
    <div className="h-screen flex justify-center items-center" >
      <Loader2 className="animate-spin" />
    </div>
  )

  if (data?.success && data.user && isSuccess) {
    sessionStorage.setItem("user", JSON.stringify(data.user));
  }

  if(isError){
    sessionStorage.clear()
    localStorage.clear();
    setLocation("/login")
    // return
  }

  // const sessionUser = getLoggedInUser()
  // if(!sessionUser?.id && !publicRoutes.includes(location)) {
  //   setLocation("/login")
  //   return
  // }

  return (
<Switch>
  {/* <Route path="/" component={Home} /> */}
  <Route path="/" component={() => <Redirect to="/login" />} />
  <Route path="/login" component={Login} />
  {/* <Route path="/login" component={AdLogin} /> */}

  <ProtectedRoute path="/dashboard" component={Dashboard} />
  <ProtectedRoute path="/jobs" component={JobsFamily} />
  <ProtectedRoute path="/editing" component={Editing} />
  <ProtectedRoute path="/job-final-review" component={JobFinalReview} />
  <ProtectedRoute path="/notifications" component={Notifications} />
  <ProtectedRoute path="/compare-versions" component={CompareVersions} />
  <ProtectedRoute path="/settings" component={Settings} />

  <Route component={NotFound} />
</Switch>
  );
}

function App() {

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RoleProvider>
          <Toaster />
          <Router />
        </RoleProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
