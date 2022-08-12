import { Box, Container, Typography } from "@mui/material";
import axios from "axios";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import dynamic from "next/dynamic";
import Error from "next/error";
import { useRouter } from "next/router";
import { useRef } from "react";
import Request from "../../../../../api";
import AsideNavBar from "../../../../../components/blog/article/AsideNavBar";
import CommentView from "../../../../../components/blog/article/CommentView";
import { TagRenderer } from "../../../../../components/blog/TagRenderer";
import { useDarkMode } from "../../../../../src/atoms";
import { API_BASE } from "../../../../../src/global";
import {
  ArticleComment,
  ArticleType,
  ArticleViewType,
  BlogInfoType,
} from "../../../../../types/blog/blogTags";

const ToastViewer = dynamic(
  () => import("../../../../../components/blog/article/ArticleViewer"),
  {
    ssr: false,
  }
);

const ToastViewerDark = dynamic(
  () => import("../../../../../components/blog/article/ArticleViewerDark"),
  {
    ssr: false,
  }
);
type ArticleViewPageProps = {
  article: ArticleViewType;
  blog: BlogInfoType;
  errorCode: number | boolean;
  comments: ArticleComment[];
};
const ArticleViewPage = ({
  errorCode,
  article,
  blog,
  comments,
}: ArticleViewPageProps) => {
  const router = useRouter();
  const viewerRef = useRef(null);
  const [isDark, setDark] = useDarkMode();
  console.log(article);
  if (errorCode == 404) {
    return <Error statusCode={errorCode} />;
  }
  return (
    <Container
      maxWidth={false}
      sx={styles.articleCon}
      className="ViewerContainer"
    >
      <Container sx={styles.emptyCon}>
        <div></div>
      </Container>
      <Container sx={styles.innerCon}>
        <Typography
          component="h1"
          variant="h3"
          color="inherit"
          gutterBottom
          textAlign={"center"}
        >
          {article.title}
        </Typography>
        <TagRenderer blog_id={article.blog_id} hashtags={article.hashtags} />
        <Typography variant="subtitle1" color="textSecondary">
          작성 / {article.reg_date}
        </Typography>
        <Typography variant="subtitle1" color="textSecondary">
          수정 / {article.update_date}
        </Typography>
        <Box sx={styles.viewer}>
          {isDark ? (
            <ToastViewerDark viewerRef={viewerRef} context={article.context} />
          ) : (
            <ToastViewer viewerRef={viewerRef} context={article.context} />
          )}
        </Box>
        <CommentView
          comments={comments}
          article_id={router.query.articleId as unknown as string}
        />
      </Container>
      <Container sx={styles.asideCon}>
        <AsideNavBar
          router={router.asPath}
          sx={styles.asidebar}
          highlighter={"green"}
          htmlEl={viewerRef}
          editortrue={false}
        ></AsideNavBar>
      </Container>
    </Container>
  );
};

export default ArticleViewPage;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const blogInfo = await Request.Blog.getBlogInfoById(query.id);
  const articles = await Request.Article.getArticleById(
    query.articleId as string
  );
  const comments = await Request.Comment.getCommentByArticleId(query.articleId);
  const article = articles.data.results;

  const errorCode =
    article.length == 0 || blogInfo.data.length == 0 ? 404 : false;
  if (errorCode) {
    return {
      props: {
        errorCode,
        blog: {},
        article: {},
        comments: {},
      },
    };
  }
  return {
    props: {
      errorCode,
      blog: blogInfo.data[0],
      article: article[0],
      comments: comments.data,
    },
  };
};
const styles = {
  articleCon: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    width: "100%",
    marginBottom: "20%",
  },
  viewer: {
    width: "100%",
    // paddingLeft: "20px",
    // paddingRight: "20px",
  },
  emptyCon: {
    width: "15%",
    marginLeft: "0",
    marginRight: "0",
    display: {
      xs: "none",
      md: "block",
    },
  },
  innerCon: {
    width: {
      xs: "100%",
      md: "70%",
    },
    margin: 0,
    padding: 0,
  },
  asideCon: {
    width: "15%",
    marginLeft: "0",
    marginRight: "0",
    display: {
      xs: "none",
      md: "block",
    },
  },
  asidebar: {
    position: "sticky",
    top: "20vh",
    width: "100%",
    marginLeft: "0",
    marginRight: "0",
    color: "secondary",
    transition: "0.3s",
  },
};
