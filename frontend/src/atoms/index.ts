import getUserInfo, { UserInfoDefault } from "./../hooks/getUserInfo";
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

const testStorage = (key: string): Promise<any> => {
  return new Promise<any>((res, rej) => {
    setTimeout(() => {
      res(key);
    }, 1000);
  });
};

const userDataAtom = atom<UserInfo>({
  key: "userDataAtom",
  default: UserInfoDefault,
  effects_UNSTABLE: [persistAtom],
});

const tokenAtom = atom<string>({
  key: "token",
  default: typeof window === "undefined" ? "" : getCookie("token"),
  effects_UNSTABLE: [persistAtom],
});

const userInfoSelector = selector<UserInfo>({
  key: "userInfoSelector",
  get: async ({ get }) => {
    const token = get(tokenAtom);
    console.log("tokenHer", token);
    if (!token) {
      return get(userDataAtom);
    } else {
      const res = await getUserInfo((e: UserInfo) => {});
      return res;
    }
  },
  set: ({ set }, newValue) => {
    console.log("set!!", newValue);
    set(userDataAtom, newValue);
  },
});

export const useUserInfo = (): [UserInfo, (e: UserInfo) => void] => {
  const [getter, setter] = useRecoilState(userDataAtom);
  return [getter, setter];
};

const testAtom = atom({
  key: "testAtom",
  default: "what i have to do",
});
const testSelector = selector({
  key: "testSelector",
  get: async ({ get }) => testStorage(get(testAtom)),
  set: async ({ set }, newValue) => {
    set(testAtom, newValue);
  },
});

export const useTestSelector = () => {
  const [getter, _setter] = useRecoilState(testSelector);
  const [_getter, setter] = useRecoilState(testAtom);
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
