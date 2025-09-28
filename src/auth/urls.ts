export const loginCallbackPath = "/login/callback/";

export interface LoginOpenidconnectUrlQueryParams {
  code: string;
  state: string;
}
export type LoginUrlQueryParams = LoginOpenidconnectUrlQueryParams;
