import { UserInfo } from "../../types/accounts/index";
import axios from "axios";
import { getCookie } from "../functions/cookies";
import { API_BASE } from "../global";
import API from "../../api";
import { useUserInfo } from "../atoms";

export const checkLogin = () => {
  return new Promise<UserInfo | boolean>((resolve, reject) => {
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

const useSetUserInfo = () => {
  const [user, setUser] = useUserInfo();
  return async () => {
    const res = await checkLogin();
    if (res && typeof res !== "boolean") {
      setUser(res);
      return res;
    } else {
      setUser(UserInfoDefault);
      return UserInfoDefault;
    }
  };
};
export const UserInfoDefault = {
  username: "",
  user_id: 0,
  email: "",
  blog_id: 0,
  blog_name: "",
  profile_url: "",
};
export default useSetUserInfo;
