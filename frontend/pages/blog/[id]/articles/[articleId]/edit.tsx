import { Button, Container, FormControl, TextField } from '@mui/material';
import { Box } from '@mui/system';
import axios from 'axios';
import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import React, { useRef, useState, useEffect } from 'react';
import API from '../../../../../api';
import MyImageUploader, {
  MyImageType,
  removeFile,
  ValidFiles,
} from '../../../../../components/blog/article/ImageUploader';
import { useSysMsg } from '../../../../../components/MySnackBar';
import { useDarkMode } from '../../../../../src/atoms';
import { getCookie } from '../../../../../src/functions/cookies';
import { API_BASE } from '../../../../../src/global';
import { UserInfo } from '../../../../../types/accounts';
import {
  ArticleViewType,
  BlogInfoType,
  Tags,
} from '../../../../../types/blog/blogTags';
import Error from '../../../../_error';

const ToastEditor = dynamic(
  () => import('../../../../../components/blog/article/ArticleEditor'),
  {
    ssr: false,
  }
);
const ToastEditorDark = dynamic(
  () => import('../../../../../components/blog/article/ArticleEditorDark'),
  {
    ssr: false,
  }
);
type WriteArticleProps = {
  blog: BlogInfoType;
  article: ArticleViewType;
  tags: Tags;
  errorCode: number | boolean;
};
const WriteArticle = ({
  errorCode,
  blog,
  tags,
  article,
}: WriteArticleProps) => {
  const [context, setContext] = useState<string>(article.context);
  const [loaded, setLoaded] = useState<boolean>(false);
  const [msg, setMsg] = useSysMsg();
  const router = useRouter();
  const userId = router.query.id as string;
  const editorRef = useRef(null);
  const contextRef = useRef('');
  const [isDark, setDark] = useDarkMode();
  const [images, setImages] = useState<MyImageType[]>(
    article.images.map((image) => ({
      ...image,
      id: image.object_id || image.id,
    }))
  );
  const [discardImages, setDiscardImages] = useState<MyImageType[]>([]);
  console.log(article);
  useEffect(() => {
    const token = getCookie('token');
    if (!token) {
      router.push('/accounts/signin');
      return;
    }
    const af = async () => {
      const res = await axios.post(API_BASE + '/userinfo', { token });
      const data = res.data[0] as any;
      ``;
      if (data.blog_id !== blog.id) {
        router.back();
        return;
      } else {
        setLoaded(true);
      }
    };
    af();
  }, [blog.id, router]);
  const onSubmit = async (e: React.SyntheticEvent<HTMLElement>) => {
    e.preventDefault();
    return new Promise<boolean>(async (resolve, reject) => {
      const form = document.getElementById('EditForm') as HTMLFormElement;
      if (form) {
        const formData = new FormData(form);
        const title = formData.get('title');
        const tags = formData.get('tags') || '';
        const _text = contextRef.current;
        const token = getCookie('token');
        let validImages: boolean[] = [];
        discardImages.map((image) => removeFile(image));
        for (let key in images) {
          const image = images[key];
          const res = await ValidFiles(image);
          validImages.push(res.data.result);
        }
        if (validImages.filter((res) => res === false).length >= 1) {
          return alert('이미지 인증 오류');
        }
        if (!title) {
          return;
        }
        const res = await API.Article.postArticleById(article.id, 'edit', {
          title,
          tags,
          context: getContext(),
          token,
          images,
        });

        const success = res.data[0];
        if (success.id) {
          setMsg({ type: 'success', message: '저장되었습니다!' });
          resolve(true);
        } else {
          setMsg({
            type: 'error',
            message: '문제가 발생했어요, 잠시후에 다시 시도해주세요',
          });
          reject(false);
        }
      } else {
        reject(false);
      }
    });
  };
  const getContext = () => {
    const toast = editorRef.current as any;
    if (toast) {
      return toast.getInstance().getMarkdown();
    } else {
      return '';
    }
  };

  // const onChangeContext = (e: any) => {
  //   const toast = editorRef.current as any;
  //   contextRef.current = toast.getInstance().getMarkdown();
  //   setContext(toast.getInstance().getMarkdown());
  // };
  if (!loaded) {
    return <div>로딩중이에요!</div>;
  }
  if (errorCode == 404) {
    return <Error statusCode={errorCode}></Error>;
  }
  const EditorProps = {
    context: context,
    editorRef: editorRef,
    onChange: () => {},
  };
  return (
    <Container maxWidth={false} sx={styles.articleCon}>
      <FormControl
        component='form'
        onSubmit={onSubmit}
        sx={styles.innerCon}
        id={'EditForm'}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: '100%',
          }}
        >
          <TextField
            sx={styles.textArea}
            defaultValue={article.title}
            color='secondary'
            name='title'
            fullWidth
            label='제목을 입력해주세요'
            id='fullWidth'
            required
          />
          <TextField
            sx={styles.textArea}
            defaultValue={
              article.hashtags
                ? article.hashtags.map((tag) => `#${tag.name}`).join(' ')
                : ''
            }
            color='secondary'
            fullWidth
            name='tags'
            label='태그를 입력해주세요'
            id='fullWidth'
          />
        </Box>
        {isDark ? (
          <ToastEditorDark {...EditorProps} />
        ) : (
          <ToastEditor {...EditorProps} />
        )}
        <Box sx={{ display: 'flex', justifyContent: 'space-evenly', gap: 1 }}>
          <Button
            sx={{ width: '100%' }}
            variant='contained'
            color='primary'
            type='submit'
          >
            저장
          </Button>
          <Button
            sx={{ width: '100%' }}
            variant='contained'
            color='primary'
            onClick={(e) => {
              onSubmit(e).then((res) => {
                if (res) {
                  router.push(
                    `/blog/${router.query.id}/articles/${router.query.articleId}/view`
                  );
                }
              });
            }}
          >
            저장 후 게시글보기
          </Button>
        </Box>
      </FormControl>
      <MyImageUploader
        discardImages={discardImages}
        setDiscardImages={setDiscardImages}
        images={images}
        setImages={setImages}
        userId={parseInt(userId, 10)}
      />
    </Container>
  );
};
export default WriteArticle;
export const getServerSideProps: GetServerSideProps = async ({ query }) => {
  const blogInfo = await API.Blog.getBlogInfoById(query.id);
  const blogTags = await API.Blog.getBlogTagsById(query.id);
  const articles = await API.Article.getArticleById(query.articleId as string);
  const errorCode = articles.data.results.length == 0 ? 404 : false;
  if (errorCode) {
    return {
      props: { errorCode, blog: {}, tags: [], article: {} },
    };
  }
  return {
    props: {
      errorCode,
      blog: blogInfo.data[0],
      tags: blogTags.data,
      article: articles.data.results[0],
    },
  };
};

const styles = {
  articleCon: {
    display: 'flex',
    flexDirection: 'column',
    // justifyContent: "center",
    // alignItems: "center",
    width: '100%',
  },
  emptyCon: {
    width: '15%',
    marginLeft: '10px',
    marginRight: '10px',
    display: {
      xs: 'none',
      md: 'block',
    },
  },
  asideCon: {
    width: '15%',
    marginLeft: '10px',
    marginRight: '10px',
    display: {
      xs: 'none',
      md: 'block',
    },
  },
  innerCon: {
    width: {
      xs: '100%',
      md: '100%',
    },
  },
  editorCon: {
    marginTop: '50px',
  },
  textArea: {
    marginTop: '5px',
    marginBottom: '5px',
  },
  asidebar: {
    position: 'sticky',
    top: '70px',
    width: '100%',
    color: 'secondary',
  },
};
