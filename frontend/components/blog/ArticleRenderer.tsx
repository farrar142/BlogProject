import { Box, Paper, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { ArticlesType } from "../../types/blog/blogTags";
import { TagRenderer } from "./TagRenderer";
type ArticleRendererProps = {
  articles: ArticlesType;
  page: number;
};
export function ArticlesRenderer({ articles, page }: ArticleRendererProps) {
  // const setSearchTag = props.setSearchTag;
  const router = useRouter();
  if (articles) {
    const _articles = page
      ? articles.slice((page - 1) * 10, page * 10)
      : articles;
    return (
      <Box sx={styles.articleBox}>
        {_articles.map((article, idx) => {
          return (
            <Paper
              key={idx}
              sx={styles.articleCon}
              onClick={() => {
                router.push(
                  `/blog/${article.blog_id}/articles/${article.id}/view`
                );
              }}
            >
              <Typography noWrap sx={styles.articleTitle}>
                {article.title}
              </Typography>
              <TagRenderer
                blog_id={article.blog_id}
                hashtags={article.hashtags}
              />
            </Paper>
          );
        })}
      </Box>
    );
  } else {
    return <Box sx={styles.articleBox}></Box>;
  }
}

const styles = {
  mainTagCon: {
    overflow: "scroll",
    width: "100%",
    padding: "auto",
    margin: "auto",
    justifyContent: "start",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
      webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.1)",
      outline: "1px solid slategrey",
    },
  },
  tagCon: {
    overflow: "scroll",
    width: "100%",
    padding: "auto",
    margin: "auto",
    justifyContent: "center",
    "&::-webkit-scrollbar": {
      display: "none",
    },
    "&::-webkit-scrollbar-track": {
      boxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
      webkitBoxShadow: "inset 0 0 6px rgba(0,0,0,0.00)",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: "rgba(0,0,0,.1)",
      outline: "1px solid slategrey",
    },
  },
  articleBox: {
    marginBottom: "40px",
  },
  articleCon: {
    marginTop: "10px",
    paddingTop: "10px",
    paddingBottom: "10px",
    paddingLeft: "20px",
    paddingRight: "20px",
  },
  articleTitle: {
    fontSize: "1.5rem",
    height: "40px",
    textAlign: "center",
    cursor: "pointer",
    zIndex: 50,
  },
  articleBody: {
    height: "20px",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  link: {
    marginTop: "5px",
    textAlign: "center",
    cursor: "pointer",
  },
};
