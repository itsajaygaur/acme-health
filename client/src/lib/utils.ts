import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SessionExpiredModalProvider } from "@/components/session-expire-modal-provider";
import { triggerSessionExpiredModal } from "./sessionExpired";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  lastLogin: string; // You can use Date if you're parsing to JS Date object
  IsHRLeader: boolean;
  group: string
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLoggedInUser(): User {
  return JSON.parse(sessionStorage.getItem("user") || "{}");
}

// utils/fetchWithCredentials.ts
export const fetchWithCredentials = async (input: RequestInfo, init?: RequestInit): Promise<Response> => {
  const defaultOptions: RequestInit = {
    credentials: 'include',
    ...init,
  };
  // return fetch(input, defaultOptions);
  const response = await fetch(input, defaultOptions)

  if(response.status === 401){
    triggerSessionExpiredModal()
    // alert('Your login has expired, Please login again.')
    // window.location.href = '/'
  }

  return response 
};

// routeAccessRules.ts
type RouteAccess = {
  path: string;
  allow: (user: any) => boolean;
};

export const routeAccessRules: RouteAccess[] = [
  {
    path: "/dashboard",
    allow: (user) => user.group?.split(":").includes("hrleader"),
  },
  {
    path: "/jobs",
    allow: (user) => user.group?.split(":").includes("hrleader") || user.group?.split(":").includes("manager"),
  },
  {
    path: "/editing",
    allow: (user) => user.group?.split(":").includes("hrleader") || user.group?.split(":").includes("manager"),
  },
  {
    path: "/job-final-review",
    allow: (user) => user.group?.split(":").includes("hrleader") || user.group?.split(":").includes("manager"),
  },
  {
    path: "/notifications",
    allow: (user) => user.group?.split(":").includes("hrleader") || user.group?.split(":").includes("manager"),
  },
  {
    path: "/compare-versions",
    allow: (user) => user.group?.split(":").includes("hrleader") || user.group?.split(":").includes("manager"),
  },
  {
    path: "/settings",
    allow: (user) => user.group?.split(":").includes("security"),
  },
  {
    path: "/", // fallback home route
    allow: () => true,
  },
];

// redirectToAccessibleRoute.ts

export function routeToRedirect(user: any) {
  for (const rule of routeAccessRules) {
    if (rule.allow(user)) {
      return rule.path;
    }
  }

  // If no accessible route found, redirect to not found or unauthorized
  return "/notfound" 
}

