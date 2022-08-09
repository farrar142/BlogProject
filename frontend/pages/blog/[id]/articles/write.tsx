import { Button, Container, FormControl, TextField } from "@mui/material";
import { Box } from "@mui/system";
import axios from "axios";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useRef, useState } from "react";
import API from "../../../../api";
import AsideNavBar from "../../../../components/blog/article/AsideNavBar";
import MyImageUploader, {
  MyImageType,
  removeFile,
  ValidFiles,
} from "../../../../components/blog/article/ImageUploader";
import { useSysMsg } from "../../../../components/MySnackBar";
import { useDarkMode } from "../../../../src/atoms";
import { getCookie } from "../../../../src/functions/cookies";
import { API_BASE } from "../../../../src/global";
import {
  ArticleType,
  BlogInfoType,
  Tags,
} from "../../../../types/blog/blogTags";
import Error from "../../../_error";

const ToastEditor = dynamic(
  () => import("../../../../components/blog/article/ArticleEditor"),
  {
    ssr: false,
  }
);
const ToastEditorDark = dynamic(
  () => import("../../../../components/blog/article/ArticleEditorDark"),
  {
    ssr: false,
  }
);
type WriteArticleProps = {
  blog: BlogInfoType;
  tags: Tags;
  errorCode: number | boolean;
};
const WriteArticle = ({ errorCode, blog, tags }: WriteArticleProps) => {
  const [context, setContext] = useState<string>("");
  const [msg, setMsg] = useSysMsg();
  const router = useRouter();
  const editorRef = useRef(null);
  const contextRef = useRef("");
  const [isDark] = useDarkMode();
  const userId = router.query.id as string;
  const [images, setImages] = useState<MyImageType[]>([]);
  const [discardImages, setDiscardImages] = useState<MyImageType[]>([]);

  const onSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") || "";
    const tags = formData.get("tags") || "";
    const _text = contextRef.current;
    const token = getCookie("token");
    let validImages: boolean[] = [];
    discardImages.map((image) => removeFile(image));
    for (let key in images) {
      const image = images[key];
      const res = await ValidFiles(image);
      validImages.push(res.data.result);
    }
    if (validImages.filter((res) => res === false).length >= 1) {
      return alert("이미지 인증 오류");
    }
    if (!title) {
      return;
    }
    const data = {
      title,
      tags,
      context: getContext(),
      token,
      images: images,
    };
    console.log(data);
    const res = await API.Article.postArticleById(0, "write", data);
    const success = res.data[0];
    if (success) {
      router.push(`/blog/${success.blog_id}/articles/${success.id}/edit`);
      setMsg({ type: "success", message: "저장되었어요" });
    } else {
      setMsg({
        type: "error",
        message: "문제가 발생했어요, 잠시후에 다시 시도해주세요",
      });
    }
  };
  const getContext = () => {
    const toast = editorRef.current as any;
    if (toast) {
      return toast.getInstance().getMarkdown();
    } else {
      return "";
    }
  };
  // const onChangeContext = (e: any) => {
  // const cont = getContext()
  //   contextRef.current = cont
  //   setContext(cont);
  // };
  if (errorCode == 404) {
    return <Error statusCode={errorCode}></Error>;
  }
  const EditorProps = {
    context: context,
    editorRef: editorRef,
    onChange: () => {},
  };
  return (
    <Container maxWidth={false} sx={styles.articleCon}>
      <FormControl component="form" onSubmit={onSubmit} sx={styles.innerCon}>
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
          }}
        >
          <TextField
            sx={styles.textArea}
            color="secondary"
            name="title"
            fullWidth
            label="제목을 입력해주세요"
            id="fullWidth"
            required
          />
          <TextField
            sx={styles.textArea}
            color="secondary"
            fullWidth
            name="tags"
            label="태그를 입력해주세요"
            id="fullWidth"
          />
        </Box>
        {isDark ? (
          <ToastEditorDark {...EditorProps} />
        ) : (
          <ToastEditor {...EditorProps} />
        )}
        <Button variant="contained" color="secondary" type="submit">
          저장하기
        </Button>
      </FormControl>
      <MyImageUploader
        discardImages={discardImages}
        setDiscardImages={setDiscardImages}
        images={images}
        setImages={setImages}
        userId={typeof userId === "string" ? parseInt(userId, 10) : userId}
      />
    </Container>
  );
};
export default WriteArticle;
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const blogInfo = await API.Blog.getBlogInfoById(query.id);
  const blogTags = await API.Blog.getBlogTagsById(query.id);
  const errorCode = blogInfo.data.length == 0 ? 404 : false;
  if (errorCode) {
    return {
      props: { errorCode, blog: {}, tags: [] },
    };
  }
  return {
    props: { errorCode, blog: blogInfo.data[0], tags: blogTags.data },
  };
};

const styles = {
  articleCon: {
    display: "flex",
    flexDirection: "column",
    // justifyContent: "center",
    // alignItems: "center",
    width: "100%",
  },
  emptyCon: {
    width: "15%",
    marginLeft: "10px",
    marginRight: "10px",
    display: {
      xs: "none",
      md: "block",
    },
  },
  asideCon: {
    width: "15%",
    marginLeft: "10px",
    marginRight: "10px",
    display: {
      xs: "none",
      md: "block",
    },
  },
  innerCon: {
    width: {
      xs: "100%",
      md: "100%",
    },
  },
  editorCon: {
    marginTop: "50px",
  },
  textArea: {
    marginTop: "5px",
    marginBottom: "5px",
  },
  asidebar: {
    position: "sticky",
    top: "70px",
    width: "100%",
    color: "secondary",
  },
};
