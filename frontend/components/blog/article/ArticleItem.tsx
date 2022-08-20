import React from 'react';
import { Box, Paper, Typography, useTheme, Tooltip } from '@mui/material';
import { ArticleType } from '../../../types/blog/blogTags';
import { useRouter } from 'next/router';
import { TagRenderer } from '../TagRenderer';
import Link from 'next/link';

const ArticleItem: React.FC<{ article: ArticleType }> = ({ article }) => {
  const router = useRouter();
  const theme = useTheme();
  return (
    <Paper sx={styles.articleCon}>
      <Link href={`/blog/${article.blog_id}/articles/${article.id}/view`}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
            cursor: 'pointer',
            marginBottom: 1,
          }}
        >
          <Typography
            sx={{
              '&:hover': {
                color: theme.palette.primary.main,
              },
            }}
            noWrap
          >
            {article.title}
          </Typography>
          <Tooltip title='조회수'>
            <Typography
              sx={{ marginLeft: 1, letterSpacing: 1 }}
              color='primary'
            >
              [{article.hits}]
            </Typography>
          </Tooltip>
          <Tooltip title='댓글'>
            <Typography
              sx={{ marginLeft: 1, letterSpacing: 1 }}
              color='secondary'
            >
              [{article.comment_count}]
            </Typography>
          </Tooltip>
        </Box>
      </Link>
      <TagRenderer blog_id={article.blog_id} hashtags={article.hashtags} />
    </Paper>
  );
};

export default ArticleItem;

const styles = {
  mainTagCon: {
    overflow: 'scroll',
    width: '100%',
    padding: 'auto',
    margin: 'auto',
    justifyContent: 'start',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey',
    },
  },
  tagCon: {
    overflow: 'scroll',
    width: '100%',
    padding: 'auto',
    margin: 'auto',
    justifyContent: 'center',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
    '&::-webkit-scrollbar-track': {
      boxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
      webkitBoxShadow: 'inset 0 0 6px rgba(0,0,0,0.00)',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: 'rgba(0,0,0,.1)',
      outline: '1px solid slategrey',
    },
  },
  articleBox: {
    marginBottom: '40px',
  },
  articleCon: {
    marginTop: '10px',
    paddingTop: '10px',
    paddingBottom: '10px',
    paddingLeft: '20px',
    paddingRight: '20px',
  },
  articleTitle: {
    fontSize: '1.5rem',
    height: '40px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  articleBody: {
    height: '20px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  link: {
    marginTop: '5px',
    textAlign: 'center',
    cursor: 'pointer',
  },
};
