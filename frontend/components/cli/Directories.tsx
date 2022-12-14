import React, {
  createRef,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Paper,
  alpha,
  Card,
  Typography,
  Tooltip,
  Breadcrumbs,
  Slider,
} from "@mui/material";

import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import DriveFileMoveIcon from "@mui/icons-material/DriveFileMove";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import { useDarkMode } from "../../src/atoms";
import {
  darkTheme,
  lightTheme,
  lightTheme as theme,
} from "../../styles/theme/lightThemeOptions";
import { LsFile, LsType } from "../../pages/cli";
type DirectoriesType = {
  children: ReactNode;
  rmRF: (path: string, target: string, type: LsType) => void;
  pasteName: (pathName: string, fileName: string) => void;
  changeDir: (path: string, target: string) => void;
  searchKW: string;
  infoPathOpen: boolean;
  catDir: (path: string, target: string) => void;
  files: LsFile[];
  path: string;
};
export const Directories: React.FC<DirectoriesType> = ({
  children,
  rmRF,
  pasteName,
  changeDir,
  catDir,
  infoPathOpen,
  searchKW,
  ...props
}) => {
  const [isDark, setDark] = useDarkMode();
  const theme = isDark ? darkTheme : lightTheme;
  const [curFiles, setCurFiles] = useState(props.files);
  useEffect(() => {
    try {
      setCurFiles(
        props.files.filter((item) => {
          if (item[1].includes(searchKW)) {
            return item;
          } else {
            return;
          }
        })
      );
    } catch {
      setCurFiles([]);
    }
  }, [props.files, searchKW]);
  const path = props.path;
  const m_styles = styles();
  if (!curFiles) {
    return <Container></Container>;
  }
  return (
    <Box sx={m_styles.dirCon(infoPathOpen)}>
      {children}
      {curFiles.map((item, idx) => {
        if (item[1] == ".") {
          return;
        }
        return (
          <DisplayDirIcon
            key={item[0] + item[1] + idx}
            item={item}
            idx={idx}
            rmRF={rmRF}
            pasteName={pasteName}
            catDir={catDir}
            changeDir={changeDir}
            path={path}
          />
        );
      })}

      {curFiles.map((item, idx) => {
        if (item[0] !== "file") {
          return;
        }
        return (
          <DisplayFileIcon
            key={idx + item[0] + item[1]}
            item={item}
            idx={idx}
            rmRF={rmRF}
            pasteName={pasteName}
            catDir={catDir}
            changeDir={changeDir}
            path={path}
          />
        );
      })}
    </Box>
  );
};

type DisplayDirIconProps = {
  idx: number;
  path: string;
  item: LsFile;
  rmRF: (path: string, target: string, type: LsType) => void;
  pasteName: (pathName: string, fileName: string) => void;
  changeDir: (path: string, target: string) => void;
  catDir: (path: string, target: string) => void;
};

const DisplayDirIcon: React.FC<DisplayDirIconProps> = (props) => {
  const { path, item, idx, rmRF, pasteName, catDir, changeDir } = props;
  const name = item[1] == ".." ? "????????????" : item[1];
  const [subMenuOpen, setSubOpen] = useState(false);
  const m_styles = styles();
  const remove = () => {
    if (item[1] != "..") {
      return (
        <Tooltip title="??????">
          <DeleteIcon
            sx={m_styles.iconCursor}
            onClick={() => rmRF(path, item[1], item[0])}
          />
        </Tooltip>
      );
    } else {
      return;
    }
  };
  return (
    <Card
      sx={m_styles.fileStyle}
      // onClick={() => changeDir(path, item[1])}
      onMouseOver={() => {
        setSubOpen(true);
      }}
      onMouseLeave={() => {
        setSubOpen(false);
      }}
    >
      <div style={m_styles.mainMenu(subMenuOpen)}>
        <FolderOpenIcon />
        <Typography sx={m_styles.textStyle}>{name}</Typography>
      </div>
      <Tooltip title={name}>
        <div style={m_styles.subMenu(subMenuOpen)}>
          {remove()}
          <Tooltip title="????????????">
            <ContentPasteIcon
              sx={m_styles.iconCursor}
              onClick={() => pasteName(path, item[1])}
            />
          </Tooltip>
          <Tooltip title="??????">
            <DriveFileMoveIcon
              sx={m_styles.iconCursor}
              onClick={() => changeDir(path, item[1])}
            />
          </Tooltip>
          <Typography>{name}</Typography>
        </div>
      </Tooltip>
    </Card>
  );
};

type DisplayDirFileProps = {
  idx: number;
  path: string;
  item: LsFile;
  rmRF: (path: string, target: string, type: LsType) => void;
  pasteName: (pathName: string, fileName: string) => void;
  changeDir: (path: string, target: string) => void;
  catDir: (path: string, target: string) => void;
};

const DisplayFileIcon: React.FC<DisplayDirFileProps> = ({
  path,
  item,
  idx,
  rmRF,
  pasteName,
  catDir,
  changeDir,
  ...props
}) => {
  const [subMenuOpen, setSubOpen] = useState(false);
  const name = item[1];
  const m_styles = styles();
  return (
    <Card
      sx={m_styles.fileStyle}
      // onClick={() => changeDir(path, item[1])}
      onMouseOver={(e) => {
        setSubOpen(true);
      }}
      onMouseLeave={(e) => {
        setSubOpen(false);
      }}
    >
      <div style={m_styles.mainMenu(subMenuOpen)}>
        <FileCopyIcon />
        <Typography sx={m_styles.textStyle}>{name}</Typography>
      </div>
      <Tooltip title={name}>
        <div style={m_styles.subMenu(subMenuOpen)}>
          <Tooltip title="??????">
            <DeleteIcon
              sx={m_styles.iconCursor}
              onClick={() => rmRF(path, item[1], item[0])}
            />
          </Tooltip>
          <Tooltip title="????????????">
            <ContentPasteIcon
              sx={m_styles.iconCursor}
              onClick={() => pasteName(path, item[1])}
            />
          </Tooltip>
          <Tooltip title="??????">
            <ZoomInIcon
              sx={m_styles.iconCursor}
              onClick={() => catDir(path, item[1])}
            />
          </Tooltip>
          <Typography>{name}</Typography>
        </div>
      </Tooltip>
    </Card>
  );
};

const styles = () => {
  return {
    controller: {
      "& .MuiTextField-root": { m: 1, width: "25ch" },
      maxWidth: "1200px",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: "auto",
      margin: "0 10px",
    },
    infoCon: (check: boolean) => {
      return {
        "& .MuiTextField-root": { m: 1, width: "25ch" },
        maxWidth: "1200px",
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "center",
        alignItems: "center",
        paddingLeft: "auto",
        margin: "0 auto",
        display: { xs: check ? "none" : "flex", md: "flex" },
      };
    },
    submitCon: {
      "& .MuiTextField-root": { m: 1, width: "25ch" },
      maxWidth: "1200px",
      display: "flex",
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "center",
      alignItems: "center",
      paddingLeft: "auto",
      margin: "0 auto",
    },
    dirUpperCon: {
      width: "100%",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
    },
    searchCon: {
      display: "flex",
      flexDirection: "row",
    },
    searchBar: { width: "100%" },
    resetButton: {
      width: "65px",
    },
    inputBar: {
      width: "300px",
    },
    respButton: {
      display: {
        xs: "block",
        md: "none",
      },
      width: "20%",
      margin: "auto",
      textAlign: "center",
      marginTop: "10px",
      marginBottom: "10px",
    },
    breadCon: {
      margin: "auto",
      padding: "24px",
    },
    resultCon: {
      display: "flex",
      width: `100%`,
      padding: 0,
      flexDirection: {
        xs: "column",
        md: "row",
      },
    },
    viwerCon: {
      width: "50%",
    },
    dirCon: (check: boolean) => {
      return {
        flexDirection: "row",
        flexWrap: "wrap",
        justifyContent: "space-around",
        alignContent: "space-around",
        display: { xs: check ? "none" : "block", md: "block" },
      };
    },
    fileStyle: {
      display: "inline-block",
      textAlign: "center",
      height: "70px",
      width: "18%",
      padding: "5px",
      margin: "3px",
      "&:hover": {
        backgroundColor: alpha(theme.palette.secondary.main, 0.25),
      },
    },
    textStyle: {
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    iconCursor: {
      cursor: "pointer",
    },
    action: {},
    mainMenu: (check: boolean) => {
      return {
        display: check ? "none" : "block",
      };
    },
    subMenu: (check: boolean): React.CSSProperties => {
      return {
        height: "100%",
        // cursor: "pointer",
        visibility: check ? "visible" : "hidden",
        // display: check ? "block" : "none",
      };
    },
    infoPathCon: (check: boolean) => {
      return {
        display: { xs: check ? "none" : "flex", md: "flex" },
      };
    },
  };
};
