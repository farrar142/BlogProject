import { Box } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useEffect } from "react";
import API from "../../api";
import { setCookie } from "../../src/functions/cookies";
import useSetUserInfo from "../../src/hooks/useSetUserInfo";

const Kakao: NextPage = () => {
  const router = useRouter();
  const setUserInfo = useSetUserInfo();
  useEffect(() => {
    if (router.query.code) {
      const code = router.query.code as string;
      API.Auth.kakaoCallback({ code }).then((res) => {
        setCookie("token", res.data.token);
        setUserInfo().then((res) => {
          router.push("/");
        });
      });
    }
  }, [router.query]);
  return <Box>로그인 중입니다</Box>;
};

export default Kakao;
