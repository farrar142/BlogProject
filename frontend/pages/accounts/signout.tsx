import { useRouter } from "next/router";
import { useEffect } from "react";
import { useSysMsg } from "../../components/MySnackBar";
import { useUserInfo } from "../../src/atoms";
import {
  deleteCookie,
  getCookie,
  setCookie,
} from "../../src/functions/cookies";
import useSetUserInfo, {
  UserInfoDefault,
} from "../../src/hooks/useSetUserInfo";
import { UserInfo } from "../../types/accounts";

const Signout = () => {
  const router = useRouter();
  const [msg, setMsg] = useSysMsg();
  const [userInfo, setUserInfo] = useUserInfo();
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      deleteCookie("token");
      setUserInfo(UserInfoDefault);
      router.back();
      setMsg({ type: "success", message: "로그아웃되었습니다" });
    } else {
      setUserInfo(UserInfoDefault);
      setMsg({ type: "warning", message: "잘못된 접근" });
      router.push("/");
    }
  }, []);
  return <div></div>;
};

export default Signout;
