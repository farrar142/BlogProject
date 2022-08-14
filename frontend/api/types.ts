import { MyImageType } from "./../components/blog/article/ImageUploader";
export type Paginated<T> = {
  type: "paginated";
  curPage: number;
  maxPage: number;
  perPage: number;
  hasNext: boolean;
  results: T[];
};

export type PostArticleType = {
  title: FormDataEntryValue;
  tags: FormDataEntryValue;
  context: FormDataEntryValue;
  token: FormDataEntryValue;
  images?: MyImageType[];
};

export type SimpleResponse = {
  result: any;
  message: string;
};

export type Args = number | string | string[] | undefined;
