import Snackbar from "@mui/material/Snackbar";
import { Alert, AlertColor } from "@mui/material";
import React, { useEffect, useState } from "react";
import { atom, useRecoilState } from "recoil";
// function Alert(props) {
//   return <MuiAlert elevation={6} variant="filled" {...props} />;
// }

const MySnackBar = () => {
  const [message, setMessage] = useSysMsg();
  const [open, setOpen] = useSnackBarOpen();
  const handleClose = (
    event: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  return (
    <Snackbar open={open} autoHideDuration={6000} onClose={handleClose}>
      <Alert severity={message.type} onClose={handleClose}>
        {message.message}
      </Alert>
    </Snackbar>
  );
};

const styles = {
  msgCon: {
    position: "fixed",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    bottom: "55px",

    margin: "0 auto",
    left: 0,
    right: 0,
    transition: "0.25s",
  },
  msg: {
    fontSize: "1.5rem",
    width: "100%",
  },
  icon: {
    paddingTop: "7px",
    cursor: "pointer",
  },
};
export default MySnackBar;
export function useSnackBarOpen(): [boolean, (e: boolean) => void] {
  const [open, setOpen] = useRecoilState(snackBarOpenAtom);
  function handler(a: boolean) {
    setOpen(a);
  }
  return [open, handler];
}
export function useSysMsg(): [SysMessageType, (e: SysMessageType) => void] {
  const [msg, setMsg] = useRecoilState(systemMessageState);
  const [open, setOpen] = useSnackBarOpen();
  function handler(e: SysMessageType) {
    setOpen(true);
    setMsg(e);
  }
  return [msg, handler];
}
const snackBarOpenAtom = atom({
  key: "snackBarOpenAtom",
  default: false,
});

const systemMessageState = atom({
  key: "systemMessage",
  default: { type: "success" as AlertColor, message: "" },
});

export type SysMessageType = {
  type: AlertColor;
  message: string;
};
