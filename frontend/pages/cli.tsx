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
  Autocomplete,
  Slider,
  Theme,
} from "@mui/material";
import {
  ChangeEvent,
  createRef,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { NextPage } from "next";
import { useSysMsg } from "../components/MySnackBar";
import { useConfig } from "../src/storage";
import { darkTheme, lightTheme } from "../styles/theme/lightThemeOptions";
import { CatViewer } from "../components/cli/CatViewer";
import { Directories } from "../components/cli/Directories";
import { useDarkMode } from "../src/atoms";
function cmdFactory(command: string, value: string): CMD {
  return { label: command, id: value };
}
export type CMD = {
  label: string;
  id: string;
};
export type LsType = "file" | "dir";
export type InputEv = ChangeEvent<HTMLInputElement>;
export type LsFile = [LsType, string];
type CliConfig = {
  hostname: string;
  username: string;
  password: string;
  directory: string;
  cmd: string;
  port: number;
};
const cliGet = async (config: CliConfig) => {
  const url = "/cliserver/get";
  return new Promise((resolve, reject) => {
    axios
      .request({
        url,
        method: "post",
        headers: {},
        data: config,
        onDownloadProgress: (e) => {
          console.log(e.loaded / e.total);
        },
      })
      .then((res) => {
        resolve(res.data[0]);
      })
      .catch(() => {
        reject([]);
      });
  });
};
const CliComp: NextPage = () => {
  const {
    getter,
    setPath,
    setHostname,
    setUser,
    setPort,
    setPassword,
    setCmd,
  } = useConfig();
  const { path, hostname, user, port, password, cmd } = getter;
  const [inputValue, setInputValue] = useState("");
  const [token, setToken] = useState();
  const [files, setFiles] = useState<LsFile[]>([]);
  const [sourceFile, setSourceFile] = useState("");
  const [cliResult, setContext] = useState("");
  const [edit, setEdit] = useState("");
  const [action, setAction] = useState(false);
  const [searchKW, setKW] = useState("");
  const [msg, _setMsg] = useSysMsg();
  const [viewerWidth, setViewerWidth] = useState(200);
  const [pathHistories, setPathHistories] = useState<string[]>([]);
  const [isLoading, setLoading] = useState(true);
  const [cmdList, setCmdList] = useState<CMD[]>([]);
  const [cursorLoading, setCursorLoading] = useState<boolean>(false);
  const formRef = useRef<HTMLFormElement | null>(null);
  const viewerRef = useRef();
  const [isDark, setDark] = useDarkMode();
  const styles = mystyles(isDark ? darkTheme : lightTheme);
  const setMsg = (e: string) => {
    _setMsg({ type: "success", message: e });
  };
  function hostnameHandler(e: InputEv) {
    setHostname(e.target.value);
  }
  function userHandler(e: InputEv) {
    setUser(e.target.value);
  }
  function passwordHandler(e: InputEv) {
    setPassword(e.target.value);
  }
  function inputPathHandler(e: InputEv) {
    setPath(e.target.value);
  }
  function pathHandler(target_path: string) {
    setSourceFile("");
    setPath(target_path);
  }
  function cmdHandler(e: InputEv) {
    setCmd(e.target.value);
  }
  function portHandler(e: InputEv) {
    setPort(e.target.value);
  }
  function searchHandler(e: InputEv) {
    e.preventDefault();
    setKW(e.target.value);
  }
  function cmdListHandler(command: string) {
    if (command && !cmdList.find((item: CMD) => item.label == command)) {
      setCmdList([cmdFactory(command, cmdList.length.toString()), ...cmdList]);
    }
  }
  function handleSubmit(e: ChangeEvent) {
    try {
      e.preventDefault();
    } catch {}
    try {
      if (cmd.split(" ")[0] == "cd") {
        setMsg("경로 이동은 ui에서만 해주세요.");
        return;
      }
    } catch {}
    // if (!token) {
    //   setMsg("로그인이 필요합니다.");
    //   return;
    // }
    if (!hostname || !user) {
      setMsg("접속 정보를 입력해주세요");
      return;
    }

    setCursorLoading(true);

    cliGet({
      hostname,
      username: user,
      password: password, // ? password : "eowjsrhkddurtlehdrneowjsfh304qjsrlf28",
      directory: path,
      cmd,
      port: parseInt(port),
    })
      .then((res: any) => {
        setFiles(res["files"]);
        //filtering
        const regexUser = `\\[${user}\\@.*\\]\\#`;
        const regexPath = `\\[${user}\\@.*\\]\\# cd ${path}`;
        const regexCmd = `\\[${user}\\@.*\\]\\# ${cmd}`;
        const regexWrapCmd = `${cmd}(.*)`;
        const regexPureCmd = cmd;
        const regexSpace = `(\\s\\r\\n)*[\\s\\r\\n]*`; //시작쪽의 공백제거
        const regexLast = "(\\r\\n\\s)*";
        const regexPurePath = `cd ${path}`;
        const reUser = new RegExp(regexUser, "gm");
        const rePath = new RegExp(regexPath, "gm");
        const reCmd = new RegExp(regexCmd, "gm");
        const rePure = new RegExp(regexPurePath, "gm");
        const rePureCommand = new RegExp(regexPureCmd, "gm");
        const reSpace = new RegExp(regexSpace, "m");
        const reWrap = new RegExp(regexWrapCmd, "m");
        const reLast = new RegExp(regexLast, "gm");
        const regexResult = res["result"]
          .replace(rePath, "")
          .replace(reCmd, "")
          .replace(reUser, "")
          .replace(rePure, "")
          .replace(rePureCommand, "")
          .replace(reSpace, "")
          .replace(/\r\n\>\s/gm, "\n")
          .trim()
          .replace(reWrap, "");
        // .replace(/(\r\n\s)+$/gm, "");
        // .replace(/\s$/gm, "");
        const resultContext = regexResult;
        setContext(resultContext.trim());
        if (!cmd.includes("echo -e")) {
          setEdit("");
        }
        setCmd("");
        setInputValue("");
      })
      .catch((res: any) => {
        setCmd("");
        setMsg("접속 정보를 다시 확인해주세요");
      })
      .finally(() => {
        setCursorLoading(false);
      });
  }
  const pathResolver = (path: string, target: string) => {
    const t1 = path == "/" ? "" : path;
    const t2 = target;
    return t1 + "/" + t2;
  };
  const changeDir = (path: string, target: string) => {
    /// /home/test
    let t1 = "/";
    let t2 = [] as string[];
    if (target == ".") {
      return;
    } else if (target == "..") {
      t2 = path.split("/");
      t2.pop();
      t1 = t2.join("/");
      if (!t1) {
        t1 = "/";
      }
    } else {
      t1 = pathResolver(path, target);
    }
    setKW("");
    setPathHistories([...pathHistories, path]);
    pathHandler(t1);
    setAction(!action);
  };
  const catDir = (path: string, target: string) => {
    const t_file = pathResolver(path, target);
    setCmd("cat " + t_file);
    setEdit(""); //수정중인글 초기화
    setSourceFile(t_file);
    setAction(!action);
  };
  const rmRF = (path: string, target: string, type: LsType) => {
    const tcmd = type == "file" ? "rm -f" : "rm -rf";
    const command = `${tcmd} ${pathResolver(path, target)}`;
    if (window.confirm("정말로 삭제하시겠어요?")) {
      setCmd(command);
      setAction(!action);
      setMsg(`삭제됨 명령어 : ${command}`);
    } else {
      setMsg(`삭제 취소됨 명령어 : ${command}`);
    }
  };
  const cP = (target: string, source: string) => {
    const tcmd = `cp -rp ${target} ${source}`;
    setCmd(tcmd);
    setAction(!action);
    setMsg(`복사됨 명령어 : ${tcmd}`);
  };
  const mV = (target: string, source: string) => {
    const tcmd = `mv ${target} ${source}`;
    setCmd(tcmd);
    setAction(!action);
    setMsg(`변경됨 명령어 : ${tcmd}`);
  };
  const backToHistories = () => {
    if (pathHistories.length > 0) {
      pathHandler(pathHistories[pathHistories.length - 1]);
      setPathHistories(pathHistories.slice(0, -1));
      setAction(!action);
    }
  };
  const moveAction = (targetPath: string) => {
    setPathHistories([...pathHistories, path]);
    pathHandler(targetPath);
    setAction(!action);
  };
  const pasteName = (pathName: string, fileName: string) => {
    const t1 = pathResolver(pathName, fileName);
    navigator.clipboard.writeText(t1);
    setMsg(`복사되었습니다 ${t1}`);
  };
  const modifyFile = (target: string, content: string) => {
    const reContent = `echo -e "${content.replace(
      /\r\n/gm,
      "\n"
    )}" > ${target}`.trim();
    setCmd(reContent);
    setAction(!action);
  };
  const Breads = (props: any) => {
    const paths = props.paths as string;
    let sum = "";
    const ftarget = paths.split("/");
    let target;
    //뒤로가기버튼
    const BackButton = () => {
      return (
        <Tooltip title="이전 폴더로 돌아갑니다.">
          <div
            key="backToHitories"
            style={{ cursor: "pointer" }}
            onClick={backToHistories}
          >
            뒤로가기
          </div>
        </Tooltip>
      );
    };
    if (ftarget[0] == "" && ftarget[1] == "") {
      target = (
        <Tooltip title="최상위 폴더로 이동합니다.">
          <div
            key="/"
            style={{ cursor: "pointer" }}
            onClick={() => {
              moveAction("/");
            }}
          >
            /
          </div>
        </Tooltip>
      );
    } else {
      target = ftarget.map((item) => {
        if (item) {
          const pathProp = sum + "/" + item;
          sum = sum + "/" + item;
          return (
            <div
              key={item}
              style={{ cursor: "pointer" }}
              onClick={() => {
                moveAction(pathProp);
              }}
            >
              {item}
            </div>
          );
        } else {
          return (
            <div
              key="/"
              style={{ cursor: "pointer" }}
              onClick={() => {
                moveAction("/");
              }}
            >
              /
            </div>
          );
        }
      });
    }
    return (
      <Breadcrumbs sx={styles.breadCon} separator="›" aria-label="breadcrumb">
        <BackButton /> {target}
      </Breadcrumbs>
    );
  };
  const [infoSettingOpen, setSettingOpen] = useState(true);
  const handleSettingOpen = () => {
    setSettingOpen(!infoSettingOpen);
  };
  const [infoPathOpen, setPathOpen] = useState(true);
  const handlePathOpen = () => {
    setPathOpen(!infoPathOpen);
  };
  const searchKWHandler = (e: string) => {
    setChidrenSearchKw(e);
  };
  const [childrenSearchKw, setChidrenSearchKw] = useState("");
  useEffect(() => {
    if (!isLoading) {
      handleSubmit(null as any);
    }
    if (isLoading) {
      setLoading(false);
    }
  }, [action]);
  if (isLoading) {
    return <Container></Container>;
  }
  return (
    <Container>
      <Container sx={styles.resultCon}>
        <Paper
          component="div"
          sx={styles.respButton}
          onClick={handleSettingOpen}
        >
          Setting
        </Paper>
      </Container>
      <Container
        ref={formRef}
        component="form"
        sx={styles.controller}
        noValidate
        autoComplete="off"
      >
        <Box sx={styles.infoCon(infoSettingOpen)}>
          <TextField
            size="small"
            required
            sx={styles.inputBar}
            id="outlined-required1"
            label="hostname"
            name="hostname"
            onChange={hostnameHandler}
            value={hostname}
            placeholder="IP Address"
          />
          <TextField
            size="small"
            required
            sx={styles.inputBar}
            id="outlined-required2"
            label="username"
            name="username"
            onChange={userHandler}
            value={user}
            placeholder="Hostname NAME"
          />
          <TextField
            size="small"
            required
            sx={styles.inputBar}
            id="outlined-password-input"
            label="PASSWORD"
            type="password"
            name="password"
            value={password}
            onChange={passwordHandler}
            autoComplete="current-password"
          />
          <Container sx={styles.submitCon}>
            <TextField
              size="small"
              sx={styles.inputBar}
              id="outlined-read-only-input"
              label="PATH"
              value={path}
              onChange={inputPathHandler}
              // InputProps={{
              //   readOnly: true,
              // }}
            />
            <TextField
              size="small"
              sx={styles.inputBar}
              id="outlined-number"
              name="port"
              label="Port"
              type="number"
              value={port}
              onChange={portHandler}
            />
            <Autocomplete
              disablePortal
              options={cmdList}
              renderInput={(params) => <TextField {...params} label="cmd" />}
              size="small"
              sx={styles.inputBar}
              id="outlined-search"
              // name="command"
              // label="Command"
              // type="text"
              value={{ id: "", label: inputValue }}
              isOptionEqualToValue={(option, value) => true}
              // onChange={(e, nV) => {
              //   console.log(nV);
              //   setInputValue(nV?.label || "");
              // }}
              inputValue={cmd}
              onInputChange={(e, nV) => {
                setInputValue(nV);
                setCmd(nV);
              }}
            />
            <Tooltip title="서버에 연결합니다.">
              <Button
                type="submit"
                onClick={(e) => {
                  e.preventDefault();
                  cmdListHandler(cmd);
                  handleSubmit(e as any);
                }}
                variant="contained"
              >
                Connect
              </Button>
            </Tooltip>
          </Container>
        </Box>
      </Container>
      <Box sx={styles.resultCon}>
        <Paper component="div" sx={styles.respButton} onClick={handlePathOpen}>
          Path
        </Paper>
        <Box sx={{ width: "100%", paddingRight: "10px", paddingLeft: "10px" }}>
          <Breads paths={path}></Breads>
          <Directories
            files={files}
            path={path}
            rmRF={rmRF}
            pasteName={pasteName}
            changeDir={changeDir}
            searchKW={childrenSearchKw}
            infoPathOpen={infoPathOpen}
            catDir={catDir}
          >
            <Box sx={styles.searchCon}>
              <Tooltip title="현재 디렉토리의 파일에서 검색합니다.">
                <TextField
                  sx={styles.searchBar}
                  id="outlined-search2"
                  label="Search"
                  name="search"
                  onChange={(e) => {
                    setKW(e.target.value);
                    searchKWHandler(e.target.value);
                  }}
                  value={searchKW}
                  autoComplete="off"
                  size="small"
                />
              </Tooltip>
              <Tooltip title="검색어를 초기화합니다.">
                <Button
                  sx={{ width: "65px" }}
                  variant="contained"
                  onClick={() => {
                    setKW("");
                    setChidrenSearchKw("");
                  }}
                >
                  Reset
                </Button>
              </Tooltip>
            </Box>
          </Directories>
        </Box>
        <CatViewer
          // sx={styles.viwerCon}
          sourceFile={sourceFile}
          setSourceFile={setSourceFile}
          modifyFile={modifyFile}
          viewerWidth={viewerWidth}
          edit={edit}
          setEdit={setEdit}
          context={cliResult}
          infoPathOpen={infoPathOpen}
          cP={cP}
          mV={mV}
        ></CatViewer>
      </Box>
    </Container>
  );
};
const mystyles = (theme: Theme) => {
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
      marginBottom: "10px",
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
        // display: "block",
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
      height: "90px",
      width: "22%",
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
    subMenu: (check: boolean) => {
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

export default CliComp;
