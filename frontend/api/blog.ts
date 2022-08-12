import {
  ArticlesType,
  ArticleType,
  BlogInfoType,
} from '../types/blog/blogTags';
import { AxiosResponse } from 'axios';
import client from './client';
import { Args, Paginated } from './types';

const Blog = {
  getBlogInfoById: (blogId: Args) => {
    const endpoint = `/api/blog/${blogId}`;
    return client.get(endpoint, {});
  },
  getBlogTagsById: (blogId: Args) => {
    const endpoint = `/api/blog/${blogId}/tags`;
    return client.get(endpoint, {});
  },
  postBlogName: (params: {
    blog_id: number;
    blog_name: string;
  }): Promise<AxiosResponse<BlogInfoType[]>> => {
    const endpoint = `/api/blog/edit`;
    return client.post<BlogInfoType[]>(endpoint, params);
  },
};

export default Blog;
