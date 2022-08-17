import { ArticlesType, ArticleType } from "../types/blog/blogTags";
import { AxiosResponse } from "axios";
import client from "./client";
import { Args, Paginated, PostArticleType, SimpleResponse } from "./types";
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

type ThirdPartRequestParams = {
  code: string;
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
  postIdfind: (form: {
    email: string;
  }): Promise<AxiosResponse<SimpleResponse>> => {
    return client.post(`/auth/idfind`, form);
  },
  patchUser: (form: {
    key: string;
    value: string;
  }): Promise<AxiosResponse<SimpleResponse>> => {
    return client.patch(`/auth/update`, form, { data: form });
  },
  kakaoLogin: (): Promise<AxiosResponse<{ url: string }>> => {
    return client.get(`/auth/kakao/login`);
  },
  kakaoCallback: (
    params: ThirdPartRequestParams
  ): Promise<AxiosResponse<SignInResponse>> => {
    return client.post(`/auth/kakao/callback`, params);
  },
};
export default Auth;
