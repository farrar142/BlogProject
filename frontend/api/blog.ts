import { ArticlesType, ArticleType } from '../types/blog/blogTags';
import { AxiosResponse } from 'axios';
import client from './client';
import { Args, Paginated } from './types';

const Blog = {
  getBlogInfoById: (blogId: Args) => {
    const endpoint = `/blog/${blogId}`;
    return client.get(endpoint, {});
  },
  getBlogTagsById: (blogId: Args) => {
    const endpoint = `/blogs/${blogId}/tags`;
    return client.get(endpoint, {});
  },
};

export default Blog;
