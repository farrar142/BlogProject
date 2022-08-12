import { ArticlesType, ArticleType } from "../types/blog/blogTags";
import { AxiosResponse } from "axios";
import client from "./client";
import { Args, Paginated, PostArticleType } from "./types";

const Article = {
  getArticleByBlog: (
    blogId: Args,
    params: {
      page?: number;
      tag?: string;
    }
  ): Promise<AxiosResponse<Paginated<ArticleType>>> => {
    return client.get(`/api/articles/${blogId}`, {
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
};
export default Article;
