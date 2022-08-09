import { CacheProvider, EmotionCache } from '@emotion/react';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import { CssBaseline, Theme, ThemeProvider } from '@mui/material';
import axios from 'axios';
import { NextComponentType } from 'next';
import type { AppContext, AppInitialProps, AppLayoutProps } from 'next/app';
import Head from 'next/head';
import React, { ReactNode, useEffect, useState } from 'react';
import { RecoilRoot } from 'recoil';
import Auth from '../components/accounts/Auth';
import Layout from '../components/blog/navbar';
import MySnackBar from '../components/MySnackBar';
import BasicSpeedDial from '../components/SpeedDial';
import { useDarkMode, useUserInfo } from '../src/atoms';
import { useLoginRequired } from '../src/hooks/useLoginRequired';
import '../styles/globals.css';
import { darkTheme, lightTheme } from '../styles/theme/lightThemeOptions';
import { UserInfo } from '../types/accounts';
import createEmotionCache from '../utility/createEmotionCache';
export interface MyAppProps extends AppLayoutProps {
  emotionCache?: EmotionCache;
}
import '../components/blog/article/toast.css';
const clientSideEmotionCache = createEmotionCache();

const MyApp: NextComponentType<AppContext, AppInitialProps, AppLayoutProps> = (
  props: MyAppProps
) => {
  axios.defaults.withCredentials = true;
  const isServer = typeof window !== 'undefined';
  return (
    <RecoilRoot>{isServer ? <RecoilRenderer {...props} /> : null}</RecoilRoot>
  );
};
const RecoilRenderer = (props: MyAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  const [isDark, setDark] = useDarkMode();
  const [theme, setTheme] = useState<Theme>(lightTheme);
  useEffect(() => {
    if (isDark) {
      setTheme(darkTheme);
    } else {
      setTheme(lightTheme);
    }
  }, [isDark]);
  // const handleAuth = (e: UserInfo) => {
  //   setAuth(e);
  // };
  return (
    <CacheProvider value={emotionCache}>
      <Head>
        <meta name='viewport' content='initial-scale=1, width=device-width' />
        <title>Blog</title>
        <link rel='icon' href='/favicon.ico' />
      </Head>
      <ThemeProvider theme={theme}>
        <React.Suspense fallback={<div>Loading</div>}>
          <MainPages {...props} />
        </React.Suspense>
      </ThemeProvider>
    </CacheProvider>
  );
};

const MainPages = (props: MyAppProps) => {
  const { Component, emotionCache = clientSideEmotionCache, pageProps } = props;
  useLoginRequired(['cli', 'write', 'edit']);
  const getLayout = Component.getLayout || ((page: ReactNode) => page);
  const [userInfo, setUserInfo] = useUserInfo();
  console.log('전체 앱 렌더링 횟수');
  console.log('userInfo', userInfo);
  return (
    <>
      <CssBaseline />
      {/* <Auth handleAuth={handleAuth} /> */}
      <Layout auth={userInfo} />
      {getLayout(<Component {...pageProps} />)}
      <MySnackBar />
      <BasicSpeedDial auth={userInfo} />
    </>
  );
};

MyApp.getInitialProps = async ({ Component, ctx }) => {
  let pageProps = {};
  // 하위 컴포넌트에 getInitialProps가 있다면 추가 (각 개별 컴포넌트에서 사용할 값 추가)
  if (Component.getInitialProps) {
    pageProps = await Component.getInitialProps(ctx);
  }

  // _app에서 props 추가 (모든 컴포넌트에서 공통적으로 사용할 값 추가)
  pageProps = { ...pageProps, posttt: { title: 11111, content: 3333 } };

  return { pageProps };
};

export default MyApp;
