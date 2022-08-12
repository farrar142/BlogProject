import { useEffect, useState } from "react";
import {
  Box,
  Container,
  Paper,
  TextField,
  Typography,
  Divider,
  Button,
  Theme,
} from "@mui/material";
import Router, { useRouter } from "next/router";
import { NextPage } from "next";
import { useUserInfo } from "../../src/atoms";
import API from "../../api";
const MyPage: NextPage = () => {
  const router = useRouter();
  const [infos, setInfo] = useUserInfo();
  const m_styles = styles;
  const [blogName, setBlogName] = useState("");

  useEffect(() => {
    setBlogName(infos.blog_name);
  }, [infos.blog_name]);

  const blogNameHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBlogName(e.target.value);
  };

  const blogNameChange = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (blogName.length <= 1) {
      console.log("err! 좀더 긴 이름을 사용하길 원함");
      return;
    }
    const data = {
      blog_id: infos.blog_id,
      blog_name: blogName,
    };
    console.log(data);
    const blogs = await API.Blog.postBlogName(data);
    if (blogs.status >= 400) {
      console.log("err!");
    } else {
      console.log("success!");
      const { id, name } = blogs.data[0];
      router.push(`/blog/${blogs.data[0].id}`);
      setInfo({ ...infos, blog_id: id, blog_name: name });
    }
  };

  return (
    <Container sx={m_styles.mainContainer}>
      <Paper sx={m_styles.infoCon}>
        <Box sx={m_styles.infoBox}>
          <Typography sx={m_styles.infoItems}>유저아이디 </Typography>
          <Divider />
          <Typography sx={m_styles.infoItems}>유저이메일 </Typography>
          <Divider />
          <Typography sx={m_styles.infoItems}>블로그이름 </Typography>
          <Divider />
        </Box>
        <Box component="form" onSubmit={blogNameChange} sx={m_styles.infoBox}>
          <Typography sx={m_styles.infoItems}>{infos.username}</Typography>
          <Divider />
          <Typography sx={m_styles.infoItems}>{infos.email}</Typography>
          <Divider />
          <Box sx={m_styles.infoItems}>
            <TextField
              size="small"
              color="secondary"
              label={blogName}
              onChange={blogNameHandler}
            />
            <Button type="submit" variant="contained">
              변경
            </Button>
            <Divider />
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

const styles = {
  mainContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  infoCon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    padding: "20px",
    width: "500px",
  },
  infoBox: {
    marginRight: "20px",
    marginLeft: "20p",
  },
  infoItems: {
    height: "40px",
    marginTop: "5px",
    marginBottom: "5pxx",
    marginRight: "5px",
    marginLeft: "5px",
    display: "flex",
    alignItems: "center",
  },
};
export default MyPage;
