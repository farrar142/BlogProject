import {
  Stack,
  Box,
  Divider,
  Typography,
  TextField,
  TextareaAutosize,
  Button,
  useTheme,
} from "@mui/material";
import { ArticleComment } from "../../../types/blog/blogTags";
import PersonIcon from "@mui/icons-material/Person";
import Image from "next/image";
import { FormEvent, FormEventHandler, useEffect, useState } from "react";
import { getCookie } from "../../../src/functions/cookies";
import axios from "axios";
import { useDarkMode, useUserInfo } from "../../../src/atoms";
import { API_BASE } from "../../../src/global";

type CommentViewProps = {
  comments: ArticleComment[];
  article_id: string;
};
const CommentView: React.FC<CommentViewProps> = ({ comments, article_id }) => {
  const [_comments, setComments] = useState(comments);
  const [userInfo, setUserInfo] = useUserInfo();
  const [isDark, setDark] = useDarkMode();
  const theme = useTheme();
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const token = getCookie("token");
    // if (!token) return;
    const data = {
      token,
      user_id: userInfo.user_id != 0 ? userInfo.user_id : null,
      article_id,
      context: formData.get("context"),
      username: formData.get("username"),
      password: formData.get("password"),
      parent_id: null,
    };
    console.log(data);
    const res = await axios.post(API_BASE + "/comment/", data);
    console.log(res);
    setComments([..._comments, res.data[0]]);
  };
  const delComment = async (id: number) => {
    const token = getCookie("token");
    if (!token) {
      return;
    }
    const res = await axios.delete(API_BASE + `/comment/${id}/`, {
      data: { token },
    });
    console.log(res);
    setComments(_comments.filter((comment) => comment.id !== id));
  };
  return (
    <Box>
      <Divider sx={{ marginY: 10 }} />
      <Typography sx={{ margin: 1 }}>총 {comments.length}개의 댓글</Typography>
      <Stack
        sx={
          {
            //   border: '1px solid red',
          }
        }
      >
        {_comments.map((comment, idx) => {
          return (
            <CommentDetail
              comment={comment}
              key={idx}
              idx={idx}
              length={comments.length}
              delComment={delComment}
            />
          );
        })}
      </Stack>
      <Box component="form" onSubmit={submitHandler}>
        {userInfo.user_id < 1 && (
          <Box sx={{ width: "100%" }}>
            <TextField sx={{ width: "50%" }} name="username" label="username" />
            <TextField sx={{ width: "50%" }} name="password" label="password" />
          </Box>
        )}
        <TextareaAutosize
          name="context"
          placeholder="내용을 입력해 주세요"
          style={{
            width: "100%",
            padding: 20,
            maxWidth: "100%",
            resize: "vertical",
            backgroundColor: theme.palette.background.default,
            color: theme.palette.text.primary,
          }}
          minRows="4"
        />
        <Box
          sx={{
            width: "100%",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            margin: 1,
          }}
        >
          <Button type="submit" variant="contained">
            작성
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CommentView;

const CommentDetail: React.FC<{
  comment: ArticleComment;
  idx: number;
  length: number;
  delComment: (id: number) => void;
}> = ({ comment, length, idx, delComment }) => {
  return (
    <Box
      onClick={() => {
        delComment(comment.id);
      }}
      sx={{ cursor: "pointer" }}
    >
      <Box sx={{ display: "flex", flex: 1, flexDirection: "row" }}>
        <Box
          sx={{
            width: 50,
            height: 50,
            borderRadius: "100%",
            margin: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "gray",
          }}
        >
          {comment.profile_url ? (
            <Image
              src={comment.profile_url}
              width={50}
              alt=""
              height={50}
              style={{ borderRadius: "100%" }}
            />
          ) : (
            <PersonIcon sx={{ width: "80%", height: "80%" }} />
          )}
        </Box>
        <Box
          sx={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Typography variant="h5">
            {comment.username || comment.username_with_id}
          </Typography>
          <Typography>{comment.reg_date}</Typography>
        </Box>
      </Box>
      <Typography component="h1" variant="h5">
        {comment.context}
      </Typography>
      {idx <= length && <Divider />}
    </Box>
  );
};
