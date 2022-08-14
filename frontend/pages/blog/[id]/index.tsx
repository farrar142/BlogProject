import { Container } from "@mui/material";
import axios from "axios";
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import API from "../../../api";
import { ArticlesRenderer } from "../../../components/blog/ArticleRenderer";
import BlogNavBar from "../../../components/blog/navbar";
import { MainTagRenderer } from "../../../components/blog/TagRenderer";
import MyPagination from "../../../components/MyPagination";
import { useBlogPagination, useUserInfo } from "../../../src/atoms";
import { API_BASE } from "../../../src/global";
import { usePaginatedQuery } from "../../../src/hooks/usePagination";
import {
  ArticlesType,
  ArticleType,
  BlogInfoType,
  Tags,
} from "../../../types/blog/blogTags";
import Error from "../../_error";
const PersonalBlog = ({
  errorCode,
  blog,
  tags,
}: {
  errorCode: number | boolean;
  blog: BlogInfoType;
  tags: Tags;
}) => {
  const router = useRouter();
  const blogId = router.query.id as unknown as number;
  const tag = router.query.tag as string;
  const [isLoaded, setLoaded] = useState<boolean>(false);
  const [page, setPage] = useBlogPagination(blogId);
  const { queryset, maxPage, getPage } = usePaginatedQuery(
    { blog_id: blogId, page, perPage: 10, tag },
    API.Article.getArticleByBlog
  );
  const onPageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    getPage(value);
  };

  useEffect(() => {
    if (page > maxPage) {
      setPage(maxPage);
      getPage(maxPage);
    }
  }, [page, maxPage]);

  useEffect(() => {
    getPage(page);
  }, [tag]);

  useEffect(() => {
    if (!isLoaded) {
      return setLoaded(true);
    } else {
      getPage(page);
    }
  }, [isLoaded]);

  if (errorCode == 404) {
    return <Error statusCode={errorCode} />;
  }
  return (
    <Container>
      <MainTagRenderer tags={tags} />
      <ArticlesRenderer articles={queryset} page={1} />
      <MyPagination
        page={page}
        onPageChange={onPageChange}
        articleLength={maxPage}
      />
    </Container>
  );
};
export default PersonalBlog;

type paramsType = {
  id: number;
};
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const blogInfo = await axios.get(API_BASE + `/api/blog/${query.id}`);
  const blogTags = await axios.get(API_BASE + `/api/blog/${query.id}/tags`);
  const errorCode = blogInfo.data.length == 0 ? 404 : false;

  if (errorCode) {
    return {
      props: {
        errorCode,
        blog: {},
        tags: [],
      },
    };
  }
  return {
    props: {
      errorCode,
      blog: blogInfo.data[0],
      tags: blogTags.data,
    },
  };
};
const styles = {
  mainCon: {},
  articleCon: {
    marginBottom: "100px",
  },
  pagination: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position: "fixed",
    bottom: "60px",
    margin: "0 auto",
    left: 0,
    right: 0,
  },
};
