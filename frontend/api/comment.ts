import { ArticlesType, ArticleType } from "../types/blog/blogTags";
import { AxiosResponse } from "axios";
import client from "./client";
import { Args, Paginated, PostArticleType } from "./types";

const Comment = {
  getCommentByArticleId: (
    articleId: Args
  ): Promise<AxiosResponse<Paginated<ArticleType>>> => {
    const endpoint = `/api/comment/`;
    return client.get(endpoint, { params: { article_id: articleId } });
  },
};
export default Comment;
