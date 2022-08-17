import axios from "axios";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { getCookie } from "../../src/functions/cookies";
import { API_BASE } from "../../src/global";
import useSetUserInfo, {
  UserInfoDefault,
} from "../../src/hooks/useSetUserInfo";
import { UserInfo } from "../../types/accounts";
type AuthProps = {
  handleAuth: (e: UserInfo) => void;
};
const Auth = ({ handleAuth }: AuthProps) => {
  const setUserInfo = useSetUserInfo();
  const router = useRouter();
  useEffect(() => {
    const token = getCookie("token");
    if (token) {
      setUserInfo();
    } else {
      handleAuth(UserInfoDefault);
    }
  }, [router.asPath]);
  return <></>;
};

export default Auth;
