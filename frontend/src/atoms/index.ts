import useSetUserInfo, { UserInfoDefault } from "./../hooks/useSetUserInfo";
import { useEffect } from "react";

import {
  atom,
  AtomEffect,
  atomFamily,
  Resetter,
  selector,
  SetterOrUpdater,
  useRecoilState,
  useRecoilValue,
  useResetRecoilState,
  useSetRecoilState,
} from "recoil";
import { recoilPersist } from "recoil-persist";
import { getCookie } from "../functions/cookies";
import { UserInfo } from "../../types/accounts";
const { persistAtom } = recoilPersist();

const darkModeAtom = atom({
  key: "darkModeAtom",
  default: true,
  effects_UNSTABLE: [persistAtom],
});

export const useDarkMode = (): [boolean, (e: boolean) => void] => {
  const [getter, setter] = useRecoilState(darkModeAtom);
  const handler = (e: boolean) => {
    setter(e);
  };
  return [getter, setter];
};
const ssrCompletedState = atom({
  key: "SsrCompleted",
  default: false,
});
const userDataAtom = atom<UserInfo>({
  key: "userDataAtom",
  default: UserInfoDefault,
  effects_UNSTABLE: [persistAtom],
});

export const useUserInfo = (): [UserInfo, (e: UserInfo) => void] => {
  const [getter, setter] = useRecoilState(userDataAtom);
  return [getter, setter];
};

export const useSsrComplectedState = (): boolean => {
  const [ssrCompleted, setSsrCompleted] =
    useRecoilState<boolean>(ssrCompletedState);

  useEffect(() => {
    if (!ssrCompleted) setSsrCompleted(true);
  }, [ssrCompleted]);
  return ssrCompleted;
};

const pagePerBlogAtom = atomFamily({
  key: "pagePerBlogAtom",
  default: (page: number) => 1,
  effects_UNSTABLE: [persistAtom],
});

export const useBlogPagination = (
  page: number
): [number, (e: number) => void] => {
  const [getter, setter] = useRecoilState(pagePerBlogAtom(page));
  return [getter, setter];
};
