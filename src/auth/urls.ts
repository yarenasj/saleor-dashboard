import { stringifyQs } from "@dashboard/utils/urls";

export const loginCallbackPath = "/login/callback/";
export const newPasswordPath = "/new-password/";

export interface LoginOpenidconnectUrlQueryParams {
  code: string;
  state: string;
}
export type LoginUrlQueryParams = LoginOpenidconnectUrlQueryParams;

export interface NewPasswordUrlQueryParams {
  email: string;
  token: string;
}
export const newPasswordUrl = (params?: NewPasswordUrlQueryParams) =>
  newPasswordPath + "?" + stringifyQs(params);
