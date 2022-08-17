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
import { CommentUpserArgs } from "../../../api/comment";
import { checkLogin } from "../../../src/hooks/useSetUserInfo";
import API from "../../../api";
import { useSysMsg } from "../../MySnackBar";
import { UserInfo } from "../../../types/accounts";
import { SimpleResponse } from "../../../api/types";

type CommentViewProps = {
  comments: ArticleComment[];
  article_id: string;
};
const CommentView: React.FC<CommentViewProps> = ({ comments, article_id }) => {
  const [_comments, setComments] = useState(comments);
  const [sysMsg, setSysMsg] = useSysMsg();
  const [userInfo, setUserInfo] = useUserInfo();
  const [isDark, setDark] = useDarkMode();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [context, setContext] = useState("");
  const theme = useTheme();
  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (context.length == 0) {
      return setSysMsg({ type: "warning", message: "내용을 입력 해 주세요" });
    }
    const isAuthorized = await checkLogin();
    if (typeof isAuthorized !== "boolean" && isAuthorized) {
      const res = await API.Comment.postComment({
        article_id: parseInt(article_id, 10),
        user_id: isAuthorized.user_id,
        context: context,
      });
      setComments([..._comments, res.data[0]]);
    } else {
      if (username.length <= 1) {
        return setSysMsg({
          type: "warning",
          message: "유저 이름은 2자 이상으로 입력 해 주세요",
        });
      } else if (password.length <= 3) {
        return setSysMsg({
          type: "warning",
          message: "비밀 번호는 4자 이상 입력 해 주세요",
        });
      }
      const res = await API.Comment.postComment({
        article_id: parseInt(article_id, 10),
        username: username,
        password: password,
        context: context,
      });
      setComments([..._comments, res.data[0]]);
    }
    setContext("");
  };

  const delComment = async (comment_id: number, _password?: string) => {
    const isAuthorized = await checkLogin();
    let result: SimpleResponse[] = [];
    if (typeof isAuthorized !== "boolean" && isAuthorized) {
      result = (
        await API.Comment.delComment({ comment_id, type: "authorized" })
      ).data;
    } else {
      if (!_password) {
        return setSysMsg({
          type: "warning",
          message: "비밀번호를 입력해주세요",
        });
      } else if (_password.length <= 3) {
        return setSysMsg({
          type: "warning",
          message: "비밀번호는 4자 이상이여야 합니다",
        });
      } else {
        result = (
          await API.Comment.delComment({
            comment_id,
            type: "unauthorized",
            password: _password,
          })
        ).data;
      }
    }
    if (result.length >= 1) {
      if (result[0].result === true) {
        setComments(_comments.filter((comment) => comment.id !== comment_id));
        setSysMsg({ type: "success", message: result[0].message });
      } else {
        setSysMsg({ type: "warning", message: result[0].message });
      }
    }
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
              userInfo={userInfo}
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
            <TextField
              sx={{ width: "50%" }}
              name="username"
              label="username"
              value={username}
              onChange={({ target: { value } }) => setUsername(value)}
            />
            <TextField
              sx={{ width: "50%" }}
              name="password"
              label="password"
              type="password"
              value={password}
              onChange={({ target: { value } }) => setPassword(value)}
            />
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
          value={context}
          onChange={({ target: { value } }) => setContext(value)}
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
  userInfo: UserInfo;
  comment: ArticleComment;
  idx: number;
  length: number;
  delComment: (id: number, password?: string) => void;
}> = ({ comment, length, idx, delComment, userInfo }) => {
  const isAuthor =
    comment.user_id === userInfo.user_id && userInfo.user_id !== 0;
  const [onEdit, setOnEdit] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  return (
    <Box sx={{ cursor: "pointer", paddingBottom: 1 }}>
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
        {isAuthor && (
          <Button
            onClick={() => {
              delComment(comment.id);
            }}
          >
            삭제
          </Button>
        )}
        {!isAuthor && !onEdit && (
          <Button onClick={() => setOnEdit(true)}>수정</Button>
        )}
        {!isAuthor && onEdit && (
          <Button
            onClick={() => {
              delComment(comment.id, password);
            }}
          >
            삭제
          </Button>
        )}
      </Box>
      {onEdit && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "90%", flex: 1 }}>
            <TextField
              sx={{ width: "50%" }}
              size={"small"}
              name="password"
              label="password"
              type="password"
              value={password}
              onChange={({ target: { value } }) => setPassword(value)}
            />
          </Box>
          <Button onClick={() => setOnEdit(false)}>취소</Button>
        </Box>
      )}
      <Typography component="h1" variant="h5" sx={{ marginBottom: 1 }}>
        {comment.context}
      </Typography>
      {idx <= length && <Divider />}
    </Box>
  );
};
