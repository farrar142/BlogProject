import { UserInfo } from "./../../types/accounts/index";
import axios from "axios";
import { getCookie } from "../functions/cookies";
import { API_BASE } from "../global";
import API from "../../api";

export const checkLogin = () => {
  return new Promise<boolean | UserInfo>((resolve, reject) => {
    try {
      const token = getCookie("token");
      if (!token) {
        resolve(false);
      } else {
        API.Auth.getUserInfo().then((res) => {
          resolve(res.data);
        });
      }
    } catch {
      resolve(false);
    }
  });
};

const getUserInfo = async (handler: (e: UserInfo) => void) => {
  const res = await checkLogin();
  if (res && typeof res !== "boolean") {
    handler(res);
    return res;
  } else {
    handler(UserInfoDefault);
    return UserInfoDefault;
  }
};
export const UserInfoDefault = {
  username: "",
  user_id: 0,
  email: "",
  blog_id: 0,
  blog_name: "",
  profile_url: "",
};
export default getUserInfo;
