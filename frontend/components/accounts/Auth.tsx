import axios from 'axios';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { getCookie } from '../../src/functions/cookies';
import { API_BASE } from '../../src/global';
import getUserInfo, { UserInfoDefault } from '../../src/hooks/getUserInfo';
import { UserInfo } from '../../types/accounts';
type AuthProps = {
  handleAuth: (e: UserInfo) => void;
};
const Auth = ({ handleAuth }: AuthProps) => {
  const router = useRouter();
  useEffect(() => {
    const token = getCookie('token');
    if (token) {
      getUserInfo(handleAuth);
    } else {
      handleAuth(UserInfoDefault);
    }
  }, [router.asPath]);
  return <></>;
};

export default Auth;
