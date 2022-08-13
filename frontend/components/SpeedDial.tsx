import * as React from "react";
import Box from "@mui/material/Box";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";
import FileCopyIcon from "@mui/icons-material/FileCopyOutlined";
import SaveIcon from "@mui/icons-material/Save";
import PrintIcon from "@mui/icons-material/Print";
import ShareIcon from "@mui/icons-material/Share";
import EditIcon from "@mui/icons-material/Edit";
import CreateIcon from "@mui/icons-material/Create";
import DeleteIcon from "@mui/icons-material/Delete";
import { UserInfo } from "../types/accounts";
import { useRouter } from "next/router";
import axios from "axios";
import { API_BASE } from "../src/global";
import { getCookie } from "../src/functions/cookies";
import { useSysMsg } from "./MySnackBar";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { useDarkMode } from "../src/atoms";
type MyProps = {
  auth: UserInfo;
};
export default function BasicSpeedDial({ auth }: MyProps) {
  const router = useRouter();
  const [isDark, setDark] = useDarkMode();
  const [sysMsg, setMsg] = useSysMsg();
  const blog_id = router.query.id as string;
  const article_id = router.query.articleId as string;
  const actions = [
    {
      icon: isDark ? <LightModeIcon /> : <DarkModeIcon />,
      name: isDark ? "라이트" : "다크",
      auth: 0,
      func: () => {
        setDark(!isDark);
      },
    },
    {
      icon: <ShareIcon />,
      name: "Share",
      auth: 0,
      func: () => {
        navigator.clipboard.writeText(window.location.href);
        setMsg({ type: "success", message: "복사가되었어요" });
      },
    },
    {
      icon: <DeleteIcon />,
      name: "Delete",
      auth: 1,
      func: () => {
        if (window.confirm("정말로 삭제하시겠어요?")) {
          axios.post(API_BASE + `/api/article/${article_id}/delete`, {
            token: getCookie("token"),
          });
          router.back();
        }
      },
    },
    {
      icon: <EditIcon />,
      name: "Edit",
      auth: 1,
      func: () => {
        router.push(`/blog/${auth.blog_id}/articles/${article_id}/edit`);
      },
    },
    {
      icon: <CreateIcon />,
      name: "Write",
      auth: 1,
      func: () => {
        router.push(`/blog/${auth.blog_id}/articles/write`);
      },
    },
  ];
  return (
    <SpeedDial
      ariaLabel="SpeedDial basic example"
      sx={{ position: "fixed", bottom: 16, right: 16 }}
      icon={<SpeedDialIcon />}
    >
      {actions.map((action) => {
        if (action.auth == 1 && auth.user_id == 0) {
          return;
        }
        if (action.name == "Write" && auth.blog_id === 0) {
          return;
        }
        if (action.name == "Edit" || action.name == "Delete") {
          if (parseInt(blog_id) !== auth.blog_id) {
            return;
          }

          if (!article_id) {
            return;
          }
        }
        return (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={action.func}
          />
        );
      })}
    </SpeedDial>
  );
}
