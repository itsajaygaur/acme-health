import { useQuery } from "@tanstack/react-query";
import { ArrowRight, HeartPulse, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { fetchWithCredentials, routeToRedirect } from "@/lib/utils";

export default function Home() {
  const [, setLocation] = useLocation();

  const { data, isPending, isError } = useQuery({
    queryKey: ['ad-users'],
    queryFn: () => fetchWithCredentials('/api/auth/ad', {
      method: 'GET',
      credentials: 'include',
    }).then(res => {
      // if (!res.ok) {
      //   // This will cause the isError state to be true
      //   throw new Error('Authentication failed');
      // }
      return res.json();
    }),
    retry: false, // Important: prevent retrying on auth errors
  });

  if (isPending) {
    return <div className="h-screen grid place-content-center" ><Loader2 className="animate-spin h-10 w-10 text-blue-500" /> </div>;
  }

  if (isError || !data || !data.success || !data.user || !data.success) {
    sessionStorage.clear();
    return <AccessDenied message={data?.message} />;
  }

  if (data.success && data.user) {
    // Set the user session so the rest of the app knows the user is logged in
    sessionStorage.setItem('user', JSON.stringify(data.user));
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8 flex justify-center">
          <div className="inline-flex items-center gap-3 rounded-lg bg-white px-5 py-3 text-blue-700 shadow-lg">
            <HeartPulse className="h-8 w-8" aria-hidden="true" />
            <span className="text-2xl font-semibold">Acme Health</span>
          </div>
        </div>
        
        {/* Welcome Message */}
        {data && data.user && (
          <h2 className="text-4xl font-semibold text-white mb-4">
            Welcome, {data.user.name}
          </h2>
        )}
        
        {/* Main title */}
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
          Acme Health Job Review
        </h1>
        
        {/* Subtitle */}
        <p className="text-xl text-blue-100 font-light mb-8">
          Streamlined Job Description Management Platform
        </p>

        {/* Redirect Button */}
        {data && data.user && (
          <Button
            size="lg"
            className="bg-white text-blue-700 hover:bg-gray-200 text-lg px-8 py-6 rounded-lg shadow-lg"
            onClick={() => {
              const route = routeToRedirect(data.user)
              setLocation(route)
            }}
          >
            Proceed
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}

function AccessDenied({message}: {message: string}) {
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-md w-full text-center">
        <div className="text-red-500 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h1>
       {message && <p className="my-4" >{message}</p>}
        <p className="text-gray-600 mb-6">
          You don&apos;t have permission to access this application.
        </p>
        <a
          href="#"
          className="inline-block bg-red-500 hover:bg-red-600 text-white px-6 py-2 rounded-full transition"
        >
          Contact Admin
        </a>
      </div>
    </div>
  );
}
