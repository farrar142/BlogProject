import {
  Button,
  Container,
  TextField,
  Box,
  Typography,
  Grid,
} from "@mui/material";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import React, { useState, useEffect } from "react";
import Router, { useRouter } from "next/router";
import { useSysMsg } from "../../components/MySnackBar";
import { NextPage } from "next";
import Link from "next/link";
import Copyright from "../../components/accounts/Copyright";
import emailValidation from "../../src/validation/EmailValidation";
import API from "../../api";
import passwordValidation from "../../src/validation/PasswordValidation";
import { setCookie } from "../../src/functions/cookies";

const ResetPassword: NextPage = () => {
  const [msg, setMsg] = useSysMsg();
  const router = useRouter();
  const token = router.query.token as string;
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");

  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = passwordValidation(password, password2);
    if (validation) {
      setMsg({ type: "warning", message: validation });
    } else {
      const res = await API.Auth.patchUser({
        key: "password",
        value: password,
      });
      if (res.data.result) {
        setMsg({ ...res.data, type: "success" });
        router.push("/accounts/signin");
      } else {
        setMsg({ ...res.data, type: "warning" });
      }
    }
  };

  useEffect(() => {
    if (!token) {
      return;
    } else {
      setCookie("token", token);
    }
  }, [token]);

  return (
    <Container component="main" maxWidth="xs" sx={{ marginTop: "20vh" }}>
      <Box
        sx={{
          marginTop: 8,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Avatar sx={{ m: 1, bgcolor: "secondary.main" }}>
          <LockOutlinedIcon />
        </Avatar>
        <Typography component="h1" variant="h5">
          비밀번호 초기화
        </Typography>
        <Box
          component="form"
          onSubmit={submitHandler}
          noValidate
          sx={{ mt: 1 }}
        >
          <Typography>비밀번호 초기화</Typography>
          <TextField
            error={passwordValidation(password, password2) ? true : false}
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
            }}
            helperText={passwordValidation(password, password2)}
            autoComplete="off"
            color="secondary"
          />
          <TextField
            error={passwordValidation(password, password2) ? true : false}
            margin="normal"
            required
            fullWidth
            name="password2"
            label="Password2"
            type="password"
            id="password2"
            helperText={passwordValidation(password, password2)}
            value={password2}
            onChange={(e) => {
              setPassword2(e.target.value);
            }}
            autoComplete="off"
            color="secondary"
          />
          <Button
            color="secondary"
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            아이디 찾기
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
};

const styles = {
  mainCon: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
};

export default ResetPassword;
