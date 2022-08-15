import {
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useState, useEffect, useRef } from "react";
import API from "../../../api";
import { usePaginatedQuery } from "../../../src/hooks/usePagination";
import { useSysMsg } from "../../MySnackBar";

const ArticleFinder: React.FC = () => {
  const router = useRouter();

  const blogId = router.query.id;
  const [page, setPage] = useState(1);
  const [title, setTitle] = useState("");
  const [isLoaded, setLoaded] = useState(false);
  const [minimize, setMinimize] = useState(true);
  const [msg, setMsg] = useSysMsg();
  const [coord, setCoord] = useState({ clientX: 500, clientY: 100 });
  const coordRef = useRef({ clientX: 500, clientY: 100 });
  const mouseCoordRef = useRef({ x: 0, y: 0 });
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const paginated = usePaginatedQuery(
    { blog_id: blogId, perPage: 10, page, title },
    API.Article.getArticleByBlog
  );

  const hasNext = page < paginated.maxPage;
  const hasPrev = page > 1;

  const titleHandler = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get("title");
    if (typeof title == "string") {
      setTitle(title);
    } else {
      setTitle("");
    }
    setMinimize(false);
  };

  const recordPosition = (e: MouseEvent) => {
    if (!boxRef.current) {
      return;
    }
    const y = e.clientY - coord.clientY;
    const x = e.clientX - coord.clientX;
    mouseCoordRef.current = { x, y };
  };

  const dragEvent = (e: DragEvent) => {
    if ((e.clientX > 0, e.clientY > 0)) {
      coordRef.current = e;
    }
  };

  useEffect(() => {
    if (!isLoaded) {
      return setLoaded(true);
    }
    if (page > paginated.maxPage) {
      setPage(paginated.maxPage);
      paginated.getPage(paginated.maxPage);
    }
  }, [page, paginated.maxPage]);

  useEffect(() => {
    if (!isLoaded) {
      return setLoaded(true);
    } else {
      paginated.getPage(page);
    }
  }, [isLoaded, title]);

  return (
    <Paper
      ref={boxRef}
      sx={{
        position: "fixed",
        top: `${coord.clientY}px`,
        left: `${coord.clientX}px`,
        padding: 1,
      }}
      draggable={true}
      onMouseDown={() => {
        window.document.addEventListener("mousedown", recordPosition);
      }}
      onMouseUp={() => {
        window.document.removeEventListener("mousedown", recordPosition);
      }}
      onDrag={(e) => {
        window.document.addEventListener("drag", dragEvent);
      }}
      onDragEnd={() => {
        window.document.removeEventListener("drag", dragEvent);
        if (boxRef.current) {
          const y = coordRef.current.clientY;
          const x = coordRef.current.clientX;
          console.log(x, mouseCoordRef.current.x);
          setCoord({
            clientX: x - mouseCoordRef.current.x,
            clientY:
              y - mouseCoordRef.current.y >= 100
                ? y - mouseCoordRef.current.y
                : 100,
          });
        }
      }}
    >
      <Stack>
        <Box component="form" onSubmit={titleHandler} sx={{ display: "flex" }}>
          <TextField
            ref={inputRef}
            id="search_title"
            name="title"
            size="small"
            label="게시글 검색"
          />
          <Button type="submit">검색</Button>
        </Box>
        <Box sx={{ display: "flex", justifyContent: "space-around" }}>
          <Button
            sx={{
              visibility: hasPrev ? "visible" : "hidden",
            }}
            onClick={() => {
              paginated.getPage(page - 1);
              setPage(page - 1);
            }}
          >
            이전
          </Button>
          <Button onClick={() => setMinimize(!minimize)}>
            {minimize ? "열기" : "접기"}
          </Button>
          <Button
            sx={{
              visibility: hasNext ? "visible" : "hidden",
            }}
            onClick={() => {
              paginated.getPage(page + 1);
              setPage(page + 1);
            }}
          >
            다음
          </Button>
        </Box>
        {!minimize &&
          paginated.queryset.map((qs, idx) => {
            return (
              <Typography
                sx={{ cursor: "pointer" }}
                key={qs.id}
                onClick={() => {
                  navigator.clipboard.writeText(
                    `<a href="/blog/${qs.blog_id}/articles/${qs.id}/view" target="_blank">${qs.title}</a>\n`
                  );
                  setMsg({
                    type: "success",
                    message: "주소가 복사되었습니다.",
                  });
                }}
              >
                {qs.title}
              </Typography>
            );
          })}
      </Stack>
    </Paper>
  );
};

export default ArticleFinder;
