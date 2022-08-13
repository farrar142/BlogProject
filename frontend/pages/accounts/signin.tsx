import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Container from "@mui/material/Container";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import API from "../../api";
import { useSysMsg } from "../../components/MySnackBar";
import { useUserInfo } from "../../src/atoms";
import { cipher, decipher } from "../../src/crypto";
import { deleteCookie, setCookie } from "../../src/functions/cookies";
import getUserInfo from "../../src/hooks/getUserInfo";
function Copyright(props: any) {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href="https://soundcloud.com/sandring-443999826">
        Your Website
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
}
type SignIn = { username: string; password: string };

const userDataDefault: SignIn = {
  username: "",
  password: "",
};

const rememberUserData = {
  setRemember: (e: boolean) => {
    localStorage.setItem("isRemember", JSON.stringify(e));
  },
  getIsRemember: (): boolean => {
    return JSON.parse(localStorage.getItem("isRemember") || "false");
  },
  getUserData: (): Promise<SignIn> => {
    return new Promise((resolve, reject) => {
      const { username, password } =
        JSON.parse(localStorage.getItem("userData") || "false") ||
        userDataDefault;
      decipher(password)
        .then((res) => {
          resolve({ username, password: res });
        })
        .catch(() => {
          resolve(userDataDefault);
        });
    });
  },
  setUserData: ({ username, password }: typeof userDataDefault) => {
    cipher(password).then((res) => {
      localStorage.setItem(
        "userData",
        JSON.stringify({ username, password: res })
      );
    });
  },
};

export default function SignIn() {
  //Login
  const [msg, setMsg] = useSysMsg();
  const router = useRouter();
  const [userInfo, setUserInfo] = useUserInfo();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);

  useEffect(() => {
    const isRemember = rememberUserData.getIsRemember();
    setRemember(isRemember);
    if (isRemember) {
      rememberUserData.getUserData().then((userData) => {
        setUsername(userData.username);
        setPassword(userData.password);
      });
    }
  }, []);

  const handleSubmit = async (event: React.SyntheticEvent<HTMLFormElement>) => {
    event.preventDefault();
    const datas = {
      username,
      password,
    };
    if (remember) {
      rememberUserData.setUserData(datas);
    } else {
      rememberUserData.setUserData(userDataDefault);
    }
    const res = await API.Auth.signIn(datas);
    if (res.status == 200) {
      // sessionStorage.setItem("token", res.data[0].token);
      deleteCookie("token");
      const token = res.data.token;
      setCookie("token", token);
      getUserInfo(setUserInfo).then((res) => {
        router.back();
      });
      setMsg({ type: "success", message: "로그인되었습니다!" });
    } else {
      setMsg({ type: "warning", message: "일치하는 회원 정보가 없어요!" });
    }
  };
  //getInfo
  const handleLogout = () => {};
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
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            color="secondary"
            value={username}
            onChange={({ target: { value } }) => {
              setUsername(value);
            }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            color="secondary"
            value={password}
            onChange={({ target: { value } }) => {
              setPassword(value);
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={remember}
                onChange={({ target: { checked } }) => {
                  setRemember(checked);
                  rememberUserData.setRemember(checked);
                }}
                color="secondary"
              />
            }
            label="Remember me"
            color="secondary"
          />
          <Button
            color="secondary"
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Sign In
          </Button>
          <Grid container>
            <Grid item xs>
              <Link href="/accounts/Idfinder" color="secondary">
                <Typography>Forgot password?</Typography>
              </Link>
            </Grid>
            <Grid item>
              <Link href="/accounts/signup" color="secondary">
                <Typography>Sign Up</Typography>
              </Link>
            </Grid>
          </Grid>
        </Box>
      </Box>
      <Copyright sx={{ mt: 8, mb: 4 }} />
    </Container>
  );
}
