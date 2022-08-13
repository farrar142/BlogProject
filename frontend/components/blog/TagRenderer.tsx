import { Chip, Stack } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { Tag, Tags } from "../../types/blog/blogTags";

type TagRendererProps = {
  tags: Tags;
  setSearchTag?: any;
};
export function MainTagRenderer(props: TagRendererProps) {
  const tags = props.tags;
  const router = useRouter();
  const curPath = router.asPath.split("?")[0];
  return (
    <Stack sx={styles.mainTagCon} direction="row" spacing={1}>
      <Link href={curPath}>
        <Chip
          //   onClick={() => setSearchTag("")}
          sx={{ cursor: "pointer" }}
          label={"전체보기"}
        />
      </Link>
      {tags.map((tag) => {
        if (tag) {
          return (
            <Link key={tag.name} href={`${curPath}?tag=${tag.name}`}>
              <Chip
                // onClick={() => setSearchTag(tag.name)}
                sx={{ cursor: "pointer" }}
                key={tag.name}
                label={`#${tag.name} (${tag.count})`}
              />
            </Link>
          );
        } else {
          return null;
        }
      })}
    </Stack>
  );
}
type ArticleTagProps = {
  hashtags: Tag[];
  blog_id: number;
};
export function TagRenderer({ hashtags, blog_id }: ArticleTagProps) {
  const router = useRouter();
  const curPath = router.asPath.split("?")[0];
  //   const setSearchTag = props.setSearchTag;
  if (hashtags?.length >= 1) {
    return (
      <Stack sx={styles.tagCon} direction="row" spacing={1}>
        {hashtags.map((tag, idx) => {
          if (tag) {
            return (
              <Link key={idx} href={`/blog/${blog_id}?tag=${tag.name}`}>
                <Chip
                  //   onClick={() => setSearchTag(tag)}
                  sx={{ cursor: "pointer" }}
                  label={"#" + tag.name}
                />
              </Link>
            );
          } else {
            return null;
          }
        })}
      </Stack>
    );
  } else {
    return <Stack></Stack>;
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
    paddingTop: "20px",
    paddingLeft: "20px",
    paddingRight: "20px",
    height: "150px",
  },
  articleTitle: {
    fontSize: "1.5rem",
    height: "40px",
    textAlign: "center",
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
