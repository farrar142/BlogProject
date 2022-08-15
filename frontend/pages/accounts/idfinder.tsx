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
import Router from "next/router";
import { useSysMsg } from "../../components/MySnackBar";
import { NextPage } from "next";
import Link from "next/link";
import Copyright from "../../components/accounts/Copyright";
import emailValidation from "../../src/validation/EmailValidation";
import API from "../../api";

const Idfinder: NextPage = () => {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useSysMsg();
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = emailValidation(email);
    if (validation) {
      setMsg({ type: "warning", message: validation });
    } else {
      const res = await API.Auth.postIdfind({ email });
      if (res.data.result) {
        setMsg({ ...res.data, type: "success" });
      } else {
        setMsg({ ...res.data, type: "warning" });
      }
    }
  };
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
          이메일/아이디 찾기
        </Typography>
        <Box
          component="form"
          onSubmit={submitHandler}
          noValidate
          sx={{ mt: 1 }}
        >
          <Typography>이메일로 아이디 찾기</Typography>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email"
            name="email"
            autoComplete="email"
            autoFocus
            color="secondary"
            value={email}
            onChange={({ target: { value } }) => setEmail(value)}
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

export default Idfinder;
