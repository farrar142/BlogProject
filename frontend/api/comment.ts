import {
  ArticleComment,
  ArticlesType,
  ArticleType,
} from "../types/blog/blogTags";
import { AxiosResponse } from "axios";
import client from "./client";
import { Args, Paginated, PostArticleType, SimpleResponse } from "./types";

export type CommentUpserArgs = {
  username?: string;
  password?: string;
  user_id?: number;
  article_id: number;
  context: string;
};

export type AuthorizedCommentDelArgs = {
  comment_id: number;
  type: "authorized";
};
export type UnAuthorizedCommentDelArgs = {
  comment_id: number;
  type: "unauthorized";
  password: string;
};

const Comment = {
  getCommentByArticleId: (
    articleId: Args
  ): Promise<AxiosResponse<Paginated<ArticleComment>>> => {
    const endpoint = `/api/comment/`;
    return client.get(endpoint, { params: { article_id: articleId } });
  },
  postComment: (
    params: CommentUpserArgs
  ): Promise<AxiosResponse<ArticleComment[]>> => {
    const endpoint = `/api/comment/`;
    return client.post(endpoint, params);
  },
  delComment: (
    params: AuthorizedCommentDelArgs | UnAuthorizedCommentDelArgs
  ): Promise<AxiosResponse<SimpleResponse[]>> => {
    const endpoint = `/api/comment/${params.comment_id}`;
    return client.delete(endpoint, { data: params });
  },
};
export default Comment;
