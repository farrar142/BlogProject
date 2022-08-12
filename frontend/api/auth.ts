import { ArticlesType, ArticleType } from "../types/blog/blogTags";
import { AxiosResponse } from "axios";
import client from "./client";
import { Args, Paginated, PostArticleType } from "./types";
import { UserInfo } from "../types/accounts";

type SignUpResponse = {
  status: number;
  message: string;
  data: any[];
};

type SignUpParams = {
  email: string;
  username: string;
  password: string;
};

type SignInParams = Omit<SignUpParams, "email">;

type SignInResponse = {
  token: string;
};

const Auth = {
  signUp: (params: SignUpParams): Promise<AxiosResponse<SignUpResponse>> => {
    return client.post<SignUpResponse>(`/auth/signup`, params);
  },
  signIn: (params: SignInParams): Promise<AxiosResponse<SignInResponse>> => {
    return client.post(`/auth/signin`, params);
  },
  getUserInfo: (): Promise<AxiosResponse<UserInfo>> => {
    return client.post(`/auth/userinfo`);
  },
};
export default Auth;
