import {
  useState,
  createRef,
  useEffect,
  useRef,
  KeyboardEventHandler,
  ChangeEvent,
  KeyboardEvent,
  BaseSyntheticEvent,
} from "react";
import {
  Container,
  Button,
  Slider,
  TextField,
  Box,
  Tooltip,
  TextareaAutosize,
  useTheme,
} from "@mui/material";
import { text } from "stream/consumers";
type CatViewerProps = {
  context: string;
  sourceFile: string;
  setSourceFile: (e: string) => void;
  modifyFile: (e: string, v: string) => void;
  viewerWidth: number;
  edit: string;
  setEdit: (e: string) => void;
  cP: (e: string, v: string) => void;
  mV: (e: string, v: string) => void;
  infoPathOpen: boolean;
};
export const CatViewer: React.FC<CatViewerProps> = ({
  context,
  sourceFile,
  modifyFile,
  viewerWidth,
  setSourceFile,
  edit,
  setEdit,
  infoPathOpen,
  cP,
  mV,
}) => {
  const theme = useTheme();
  let re = /\r\n/g;
  const [tabLength, setTabLength] = useState(4);
  const [targetFile, setTargetFile] = useState("");
  const textRef = useRef<HTMLTextAreaElement | null>(null);
  const sliderRef = useRef<HTMLSpanElement | null>(null);
  const [vW, setVW] = useState(100);
  useEffect(() => {
    if (textRef.current) {
      textRef.current.value = context;
    }
  }, [context]);
  useEffect(() => {
    if (textRef === null || textRef.current === null) {
      return;
    }
    textRef.current.style.height = "50vh";
    // textRef.current.style.height = textRef.current.scrollHeight + "px";
    textRef.current.style.width = "100%";
  }, [textRef]);
  const handleSetTab = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === "Tab" && textRef.current) {
      e.preventDefault();
      const target = textRef.current;
      let val = target.value;
      let start = target.selectionStart;
      let end = target.selectionEnd;
      target.value =
        val.substring(0, start) + " ".repeat(tabLength) + val.substring(end);
      target.selectionStart = target.selectionEnd = start + tabLength;
      // setEdit(e.target.value);
      return false; //  prevent focus
    }
    return false;
  };
  // if (context) {
  // context.replace(re, "<br>")
  const result = { __html: context };
  return (
    <Box
      sx={{
        width: `${vW}%`,
        paddingBottom: "200px",
        paddingLeft: "10px",
        paddingRight: "10px",
      }}
    >
      <Box sx={styles.catCon(infoPathOpen)}>
        <Box sx={styles.inputWithButton}>
          <Tooltip title="?????? ?????? ?????????.">
            <TextField
              name="SourceFile"
              label="SourceFile"
              sx={styles.inputCon}
              value={sourceFile}
              onChange={(e) => setSourceFile(e.target.value)}
              size="small"
            />
          </Tooltip>
          <Tooltip title="?????? ???????????? ?????? ????????? ???????????????">
            <Button
              sx={styles.actionButton}
              onClick={() => {
                cP(sourceFile, targetFile);
              }}
              variant="contained"
            >
              Paste
            </Button>
          </Tooltip>
        </Box>
        <Box sx={styles.inputWithButton}>
          <Tooltip title="?????? ???????????????.">
            <TextField
              name="TargetFile"
              label="TargetFile"
              sx={styles.inputCon}
              value={targetFile}
              onChange={(e) => {
                setTargetFile(e.target.value);
              }}
              size="small"
            />
          </Tooltip>
          <Tooltip title="?????? ???????????? ?????? ????????? ????????? ????????????.">
            <Button
              sx={styles.actionButton}
              onClick={() => {
                mV(sourceFile, targetFile);
              }}
              variant="contained"
            >
              Move
            </Button>
          </Tooltip>
        </Box>
        <Tooltip title="?????? ???????????? ?????? ????????? ???????????????.">
          <TextField
            label="TabLength"
            type="number"
            value={tabLength}
            onChange={(e) => {
              setTabLength(parseInt(e.target.value));
            }}
            size="small"
          />
        </Tooltip>
        <Tooltip title="????????? ?????? ????????? ???????????????.">
          <Box style={{ display: "flex", flexDirection: "row" }}>
            <Box style={{ width: "80px" }}>Size</Box>
            <Slider
              defaultValue={100}
              min={20}
              max={200}
              ref={sliderRef}
              aria-label="Default"
              valueLabelDisplay="auto"
              onMouseUp={() => {
                if (sliderRef.current) {
                  const target = sliderRef.current;
                  const value = target.querySelector("input")?.value;
                  if (value) {
                    setVW(parseInt(value));
                  }
                }
              }}
              // onChange={(event, value) => {
              //   if (typeof value == "number") {
              //     setVW(value);
              //   }
              // }}
            />
          </Box>
        </Tooltip>
      </Box>
      <TextareaAutosize
        style={{
          padding: 0,
          margin: 0,
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
        }}
        ref={textRef}
        name="textarea"
        id=""
        cols={30}
        minRows={30}
        defaultValue={edit ? edit : context}
        onChange={(e) => {
          if (e.currentTarget) {
            // setEdit(e.currentTarget.value);
            if (textRef.current) {
              textRef.current.value = e.currentTarget.value;
            }
          }
        }}
        onKeyDown={handleSetTab}
      ></TextareaAutosize>
      <Tooltip title="??????????????? ???????????????.">
        <Button
          sx={styles.modifyButton}
          onClick={() => {
            modifyFile(sourceFile, edit ? edit : context);
          }}
          variant="contained"
        >
          Modify
        </Button>
      </Tooltip>
      {/* <pre>
            <code dangerouslySetInnerHTML={result}></code>
          </pre> */}
    </Box>
  );
  // } else {
  //   return <Container></Container>;
  // }
};

const styles = {
  catCon: (check: boolean) => {
    return {
      display: { xs: check ? "none" : "flex", md: "flex" },
      flexDirection: "column",
      justifyContent: "center",
    };
  },
  inputWithButton: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: "10px",
  },
  actionButton: { width: "65px" },
  inputCon: {
    width: "100%",
  },
  modifyButton: {
    padding: "6px 0",
  },
};
