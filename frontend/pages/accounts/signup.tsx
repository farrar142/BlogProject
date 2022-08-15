import * as React from "react";
import Link from "@mui/material/Link";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import {
  Box,
  Typography,
  Container,
  Button,
  Avatar,
  TextField,
} from "@mui/material";
import { API_BASE } from "../../src/global";
import Router, { useRouter } from "next/router";
import axios from "axios";
import { useSysMsg } from "../../components/MySnackBar";
import API from "../../api";
import Copyright from "../../components/accounts/Copyright";
import emailValidation from "../../src/validation/EmailValidation";
import passwordValidation from "../../src/validation/PasswordValidation";

export default function SignUp() {
  const [sysMsg, setMsg] = useSysMsg();
  const [email, setEmail] = React.useState("");
  const [username, setUsername] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [password2, setPassword2] = React.useState("");
  const router = useRouter();

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!(password === password2)) {
      return setMsg({ type: "warning", message: "정보가 옳바르지 않아요" });
    }
    const emailValid = emailValidation(email);
    if (emailValid) {
      return setMsg({ type: "warning", message: emailValid });
    }
    const datas = { username, email, password };
    const res = await API.Auth.signUp(datas);

    if (res.data.status === 0) {
      setMsg({
        type: "success",
        message: `가입한 것을 환영합니다 ${username}님`,
      });
      Router.push("/accounts/signin");
    } else {
      setMsg({ type: "warning", message: "정보가 옳바르지 않아요" });
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
          회원 가입
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            onChange={(e) => setUsername(e.target.value)}
            value={username}
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="off"
            autoFocus
            color="secondary"
          />
          <TextField
            error={emailValidation(email) ? true : false}
            margin="normal"
            required
            fullWidth
            name="email"
            label="Email"
            type="email"
            id="email"
            autoComplete="true"
            color="secondary"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            helperText={emailValidation(email)}
          />
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
            회원가입
          </Button>
          <Button
            color="secondary"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            onClick={() => router.back()}
          >
            로그인 페이지로
          </Button>
        </Box>
      </Box>
      <Copyright sx={{ mb: 4 }} />
    </Container>
  );
}
