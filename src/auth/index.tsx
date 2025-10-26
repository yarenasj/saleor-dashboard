import { Route } from "@dashboard/components/Router";
import { parse as parseQs } from "qs";
import React, { useContext } from "react";
import { Switch } from "react-router-dom";

import Layout from "./components/Layout";
import { UserContext as Context } from "./types";
import { LoginUrlQueryParams } from "./urls";
import LoginViewComponent from "./views/Login";

const LoginView = () => {
  const qs = parseQs(location.search.substr(1)) as any;
  const params: LoginUrlQueryParams = qs;

  return <LoginViewComponent params={params} />;
};

export const UserContext = React.createContext<Context>({
  login: undefined,
  loginByExternalPlugin: undefined,
  logout: undefined,
  requestLoginByExternalPlugin: undefined,
  authenticating: false,
  isCredentialsLogin: false,
  authenticated: false,
  errors: [],
  refetchUser: undefined,
});

const AuthRouter = () => (
  <Layout>
    <Switch>
      <Route component={LoginView} />
    </Switch>
  </Layout>
);

AuthRouter.displayName = "AuthRouter";
export default AuthRouter;

export * from "./utils";
export const useUser = () => useContext(UserContext);
