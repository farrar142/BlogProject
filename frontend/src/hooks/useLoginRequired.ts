import { useLoading } from "./index";

import axios from "axios";
import Router from "next/router";
import { useEffect, useState } from "react";
import { useSsrComplectedState } from "../atoms";
import { deleteCookie, getCookie } from "../functions/cookies";
import { checkLogin } from "./useSetUserInfo";

export const useLoginRequired = (paths: string[]): void => {
  const ssrCompleted = useSsrComplectedState();
  const isLoading = useLoading();
  useEffect(() => {
    const fullPath = Router.pathname;
    const isIncluded =
      paths.filter((res) => fullPath.includes(res)).length >= 1;
    const check_login = async () => {
      const info = checkLogin();
      if (info && typeof info !== "boolean") {
      } else {
        Router.push("/accounts/signin");
        deleteCookie("token");
      }
    };
    if (ssrCompleted && isIncluded) {
      check_login();
    } else {
    }
  }, [ssrCompleted, paths]);
};
