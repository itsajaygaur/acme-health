import { Redirect, Route } from "wouter";
import { getLoggedInUser, routeAccessRules } from "@/lib/utils";
import { SessionExpiredModalProvider } from "./session-expire-modal-provider";

const ProtectedRoute = ({ path, component: Component }: { path: string; component: any }) => {
  const user = getLoggedInUser();
  const rule = routeAccessRules.find((r) => r.path === path);

  const isAllowed = rule ? rule.allow(user) : true;

  return (
    <Route path={path}>
      {(params) => (isAllowed ? <SessionExpiredModalProvider> <Component {...params} /> </SessionExpiredModalProvider>: <Redirect to={"/notfound"} />)}
    </Route>
  );
};

export default ProtectedRoute;
