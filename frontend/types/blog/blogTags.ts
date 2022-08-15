import { MyImageType } from "./../../components/blog/article/ImageUploader";
export type ArticleComment = {
  id: number;
  deleted_at: string | null;
  status: number;
  reg_date: string;
  update_date: string;
  username: string | null;
  password: string | null;
  parent_id: number | null;
  user_id: number | null;
  article_id: number;
  context: string;
  username_with_id: string | null;
  profile_url: string | null;
};

export type ArticleType = {
  id: number;
  reg_date: string;
  update_date: string;
  user_id: number;
  blog_id: number;
  title: string;
  hashtags: Tag[];
  comment_count: number;
};
export type ArticleViewType = {
  id: number;
  reg_date: string;
  update_date: string;
  blog_id: number;
  title: string;
  context: string;
  hashtags: Tag[];
  images: MyImageType[];
};
export type ArticlesType = Array<ArticleType>;
export type BlogInfoType = {
  id: number;
  name: string;
  user_id: number;
  reg_date: string;
  update_date: string;
  status: number;
};
export type Tag = {
  name: string;
  count: number;
};
export type Tags = Array<Tag>;
