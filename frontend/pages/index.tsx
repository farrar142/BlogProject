import { Button, Container } from "@mui/material";
import axios from "axios";
import type { GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import API from "../api";
import { ArticlesRenderer } from "../components/blog/ArticleRenderer";
import { MainTagRenderer } from "../components/blog/TagRenderer";
import { useUserInfo } from "../src/atoms";
import { API_BASE } from "../src/global";
import { ArticlesType, ArticleType, Tags } from "../types/blog/blogTags";
const Home = (props: { tags: Tags }) => {
  const { tags } = props;
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [userinfo, setuserinfo] = useUserInfo();
  console.log(userinfo);
  useEffect(() => {
    API.Article.getArticleByBlog("random", {}).then(({ data }) => {
      setArticles(data.results);
    });
  }, []);
  return (
    <Container sx={styles.mainCon}>
      {/* <Video className="video_components" src={url} /> */}
      {/* <video controls src={url}></video> */}
      <MainTagRenderer tags={tags} />
      <ArticlesRenderer articles={articles} page={0} />
    </Container>
  );
};
export default Home;

export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const tags = await axios.get(API_BASE + `/api/blogs/0/tags`);
  // const errorCode = articles.data.length == 0 ? 404 : false;
  // const errorCode = false;
  // return {
  //   props: {
  //     errorCode,
  //     articles: [],
  //     tags: [],
  //   },
  // };
  // if (errorCode) {
  //   return {
  //     props: {
  //       errorCode,
  //       articles: [],
  //       tags: [],
  //     },
  //   };
  // }
  return {
    props: {
      // errorCode,
      // articles: articles.data,
      tags: tags.data,
      // tags: [],
    },
  };
};
const styles = {
  mainCon: {},
};
