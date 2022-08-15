import { ArticlesType, ArticleType } from "../types/blog/blogTags";
import { AxiosResponse } from "axios";
import client from "./client";
import { Args, Paginated, PostArticleType, SimpleResponse } from "./types";

const Article = {
  getRandomArticle: (
    tag?: string
  ): Promise<AxiosResponse<Paginated<ArticleType>>> => {
    return client.get(`/api/articles/random`, { params: { tag } });
  },
  getArticleByBlog: (params: {
    blog_id: Args;
    page: number;
    perPage: number;
    tag?: string;
    title?: string;
  }): Promise<AxiosResponse<Paginated<ArticleType>>> => {
    return client.get(`/api/articles`, {
      params,
    });
  },
  getArticleById: (
    articleId: Args
  ): Promise<AxiosResponse<Paginated<ArticleType>>> => {
    return client.get(`/api/article/${articleId}`, {
      params: { context: true },
    });
  },
  postArticleById: (
    articleId: Args,
    action: string,
    params: PostArticleType
  ): Promise<AxiosResponse<ArticleType[]>> => {
    return client.post(`/api/article/${articleId}/edit?action=${action}`, {
      ...params,
    });
  },
  deleteArticleById: (
    articleId: number
  ): Promise<AxiosResponse<SimpleResponse[]>> => {
    const endpoint = `/api/article/${articleId}`;
    return client.delete(endpoint);
  },
};
export default Article;
