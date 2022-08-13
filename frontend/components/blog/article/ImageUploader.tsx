import { Box, Button, LinearProgress, Tabs, Typography } from "@mui/material";
import axios, { AxiosResponse } from "axios";
import Image from "next/image";
import {
  ChangeEvent,
  forwardRef,
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { S3BUCKET } from "../../../src/global";
import { UserInfo } from "../../../types/accounts";
import { useSysMsg } from "../../MySnackBar";
export interface imageUploaderProps {
  userId: number;
  setImages?: (images: Array<MyImageType>) => void;
  maxNumber?: number;
  maxSize?: number;
  images?: Array<MyImageType>;
  admin?: boolean;
  children?: ReactNode;
  discardImages: Array<MyImageType>;
  setDiscardImages: (images: Array<MyImageType>) => void;
}
const MyImageUploader = (props: imageUploaderProps) => {
  // const { images, setImages, admin, maxNumber, maxSize, children } = props;
  const { discardImages, setDiscardImages } = props;
  const dragRef = useRef<HTMLLabelElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [msg, setMsg] = useSysMsg();
  const [images, _setImages] = useState<MyImageType[]>(props.images || []);
  const setImages = (e: MyImageType[]) => {
    if (props.setImages) {
      props.setImages(e);
      _setImages(e);
    } else {
      _setImages(e);
    }
  };
  const [videos, setVideos] = useState<string[]>([]);
  const maxNumber = 10;
  const [dpImage, setDpImage] = useState<number>(0);
  const [value, setValue] = useState(0);
  const [progress, setProgress] = useState<number>(0);
  const max = maxNumber;
  const uploadHandler = useCallback(
    async (e: ChangeEvent<HTMLInputElement> | any) => {
      let el: File[] = [];
      if (e.type === "drop") {
        // 드래그 앤 드롭 했을때
        el = e.dataTransfer.files;
      } else {
        // "파일 첨부" 버튼을 눌러서 이미지를 선택했을때
        el = e.currentTarget.files;
      }
      // const el = e.currentTarget.files;
      const fileList = await FilesToMyType(el, props.userId, setProgress);
      setImages([...images, ...fileList].filter((res, idx) => idx < maxNumber));
      if (images.length < dpImage + 1) {
        setDpImage(0);
      }
    },
    [images]
  );
  const handleDragIn = useCallback((e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragOut = useCallback((e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer!.files) {
      setIsDragging(true);
    }
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent): void => {
      e.preventDefault();
      e.stopPropagation();

      uploadHandler(e);
      setIsDragging(false);
    },
    [uploadHandler]
  );

  const initDragEvents = useCallback((): void => {
    // 앞서 말했던 4개의 이벤트에 Listener를 등록합니다. (마운트 될때)

    if (dragRef.current !== null) {
      dragRef.current.addEventListener("dragenter", handleDragIn);
      dragRef.current.addEventListener("dragleave", handleDragOut);
      dragRef.current.addEventListener("dragover", handleDragOver);
      dragRef.current.addEventListener("drop", handleDrop);
    }
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  const resetDragEvents = useCallback((): void => {
    // 앞서 말했던 4개의 이벤트에 Listener를 삭제합니다. (언마운트 될때)

    if (dragRef.current !== null) {
      dragRef.current.removeEventListener("dragenter", handleDragIn);
      dragRef.current.removeEventListener("dragleave", handleDragOut);
      dragRef.current.removeEventListener("dragover", handleDragOver);
      dragRef.current.removeEventListener("drop", handleDrop);
    }
  }, [handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  useEffect(() => {
    initDragEvents();

    return () => resetDragEvents();
  }, [initDragEvents, resetDragEvents]);
  useEffect(() => {
    if (progress == 1) {
      setMsg({ type: "success", message: "업로드가 완료되었습니다." });
      const timeout = setTimeout(() => {
        setProgress(0);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [progress]);
  const onImageRemoveAll = () => {
    setImages([]);
  };
  const onImageUpdate = async (
    index: number,
    setProgress: (e: number) => void
  ) => {
    const fileEl: HTMLInputElement = window.document.createElement("input");
    fileEl.type = "file";
    fileEl.click();
    fileEl.onchange = async (e: Event | any) => {
      const _fileRef = e.target;
      if (_fileRef.files) {
        const fileList = await FilesToMyType(
          _fileRef.files,
          props.userId,
          setProgress
        );
        // removeFile(images[index]);
        setDiscardImages([...discardImages, images[index]]);
        setImages(
          images.map((res, idx) => {
            if (idx == index) {
              return fileList[0];
            } else {
              return res;
            }
          })
        );
      }
    };
  };
  const onImageRemove = (index: number) => {
    setDiscardImages([...discardImages, images[index]]);
    const _images = images.filter((res, idx) => idx != index);
    setImages(_images);
    if (value == index) {
      setValue(value > 0 ? value - 1 : 0);
    }
    if (_images.length == 0) {
      setDpImage(0);
    } else if (dpImage == index) {
      setDpImage(0);
    }
  };
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    //tab changes
    setDpImage(newValue);
    setValue(newValue);
  };
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          flexDirection: "row",
        }}
      >
        <Box sx={{ width: "100%" }}>
          <LinearProgress variant="determinate" value={progress * 100} />
        </Box>
        <Box sx={{ minWidth: 35, marginLeft: 1 }}>
          <Typography variant="body2" color="text.secondary">{`${Math.round(
            progress * 100
          )}%`}</Typography>
        </Box>
      </Box>
      <Tabs
        value={value}
        // onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ width: "100%" }}
      >
        {images.map((image, index) => {
          return (
            <Box key={index} sx={{ p: 1 }} {...a11yProps(index)}>
              <ImageView
                key={index}
                image={image}
                index={index}
                admin={true}
                handleChange={handleChange}
                onImageUpdate={(e) => onImageUpdate(e, setProgress)}
                onImageRemove={(_index) => {
                  onImageRemove(_index);
                }}
              />
            </Box>
          );
        })}
      </Tabs>
      {images.length < max ? (
        <Button component="label">
          <input
            hidden
            onChange={(e) => uploadHandler(e)}
            id="fileUpload"
            multiple
            type="file"
            accept="image/gif,image/jpeg,image/png,video/mp4"
            // style={{ display: "none" }} // label을 이용하여 구현하기에 없애줌
          />
          <label
            className={isDragging ? "DragDrop-File-Dragging" : "DragDrop-File"}
            // 드래그 중일때와 아닐때의 클래스 이름을 다르게 주어 스타일 차이

            htmlFor="fileUpload"
            ref={dragRef}
            style={{ width: "100%", height: "100%", cursor: "pointer" }}
          >
            <div>upload</div>
          </label>
        </Button>
      ) : (
        <Button>업로드할수없어요</Button>
      )}
      <Button onClick={onImageRemoveAll}>모두 삭제</Button>
    </Box>
  );
};
export default MyImageUploader;

function a11yProps(index: number) {
  return {
    id: `simple-tab-${index}`,
    "aria-controls": `simple-tabpanel-${index}`,
  };
}
interface ImageViewProps {
  image: MyImageType;
  index: number;
  admin: boolean;
  onImageUpdate: (index: number) => void;
  onImageRemove: (index: number) => void;
  handleChange: (e: React.SyntheticEvent, newValue: number) => void;
}
const ImageView = (props: ImageViewProps) => {
  const { image, index, admin, onImageUpdate, onImageRemove, handleChange } =
    props;
  const [msg, setMsg] = useSysMsg();
  const shortenedUrl = image.dataURL.replace(S3BUCKET, "");
  return (
    <Box sx={{ width: "100px" }}>
      {image.type == "image" ? (
        <Image
          src={image.dataURL ? image.dataURL : ""}
          alt=""
          width={100}
          height={100}
          onClick={() => {
            navigator.clipboard.writeText(`![이미지](${shortenedUrl})`);
            setMsg({ type: "success", message: "이미지가 복사되었습니다" });
          }}
          onMouseOver={(e) => handleChange(e, index)}
          style={{ cursor: "pointer" }}
        />
      ) : image.type == "video" ? (
        <video
          controls
          src={image.dataURL}
          width={100}
          height={100}
          onClick={(e) => {
            e.preventDefault();
            navigator.clipboard.writeText(
              `<video controls autoplay src="${shortenedUrl}"/>`
            );
            setMsg({ type: "success", message: "이미지가 복사되었습니다" });
          }}
          onMouseOver={(e) => handleChange(e, index)}
          style={{ cursor: "pointer" }}
        />
      ) : (
        <Box
          width={100}
          height={100}
          onClick={() => {
            navigator.clipboard.writeText(`[다운로드](${shortenedUrl})`);
            setMsg({ type: "success", message: "파일이 복사되었습니다" });
          }}
          onMouseOver={(e) => handleChange(e, index)}
          sx={{
            cursor: "pointer",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {image.dataURL.split("/").reverse()[0]}
        </Box>
      )}
      {admin ? (
        <Box>
          <Button
            sx={{ minWidth: "50px" }}
            onClick={() => onImageUpdate(index)}
            size="small"
          >
            수정
          </Button>
          <Button
            sx={{ minWidth: "50px" }}
            onClick={() => onImageRemove(index)}
            size="small"
          >
            삭제
          </Button>
        </Box>
      ) : null}
    </Box>
  );
};
const Bar = forwardRef((props: any, ref: any) => (
  <span {...props} ref={ref}>
    {props.children}
  </span>
));
Bar.displayName = "Bar";
export type ImageFromRequest = {
  url: string;
  id: number;
};
export interface Size {
  width: number;
  height: number;
}
export interface MyImageType {
  id: number;
  dataURL: string;
  size: Size;
  type: "image" | "video" | any;
  object_id?: number;
}

export async function getSizeWithUrl(
  url: string
): Promise<Omit<MyImageType, "id">> {
  const _image: HTMLImageElement = document.createElement("img");
  return new Promise((resolve, reject) => {
    let size = {
      width: 1,
      height: 1,
    };
    if (url) {
      _image.src = url;
      _image.onload = () => {
        size = {
          width: _image.width != 0 ? _image.width : 1,
          height: _image.height != 0 ? _image.height : 1,
        };
        resolve({ dataURL: url, size, type: "image" });
      };
    } else {
      resolve({ dataURL: url, size, type: "image" });
    }
  });
}

export const uploadImageByFiles = async (
  files: Array<File | undefined> | FileList,
  userId: number,
  setProgress: (e: number) => void
): Promise<ImageFromRequest[]> => {
  let media_urls: ImageFromRequest[] = [];
  const formData = new FormData();
  formData.append("origin", "blog");
  formData.append("user", userId.toString());
  for (let i = 0; i < files.length; i++) {
    const _file = files[i];
    if (_file != undefined) {
      formData.append(`files`, _file);
    }
  }
  const url = "/mediaserver/upload/files";
  const method = "post";
  await axios
    .request<any, AxiosResponse<{ files: { url: string; id: number }[] }>>({
      url,
      method: method,
      headers: {},
      data: formData,
      onUploadProgress: (e) => setProgress(e.loaded / e.total),
    })
    .then((res) => {
      media_urls = res.data.files.map((files) => ({
        ...files,
        url: sanitizeUrl(files.url),
      }));
    });
  return media_urls;
};

export const ValidFiles = async (
  image: MyImageType
): Promise<AxiosResponse<{ result: boolean }>> => {
  return await axios.post<{ result: boolean }>(
    `/mediaserver/valid/file/${image.id}`
  );
};

export const removeFile = async (image: MyImageType) => {
  return await axios.delete(`/mediaserver/file/${image.id}`);
};

export const FilesToMyType = async (
  el: File[],
  userId: number,
  setProgress: (e: number) => void
) => {
  let fileList: MyImageType[] = [];
  if (el && el.length >= 1) {
    const files = await uploadImageByFiles(el, userId, setProgress);
    for (let item = 0; item < el.length; item++) {
      const fileType = el[item].type.split("/")[0];
      if (fileType == "image") {
        const fileType = await getSizeWithUrl(files[item].url);
        fileList.push({
          ...fileType,
          id: files[item].id,
          dataURL: files[item].url,
        });
      } else if (fileType == "video") {
        fileList.push({
          id: files[item].id,
          dataURL: files[item].url,
          size: { width: 10, height: 10 },
          type: "video",
        });
      } else {
        fileList.push({
          id: files[item].id,
          dataURL: files[item].url,
          size: { width: 10, height: 10 },
          type: fileType,
        });
      }
    }
  }
  return fileList;
};

const sanitizeUrl = (url: string) => {
  if (url.startsWith("/")) {
    return url;
  } else {
    return "/" + url;
  }
};
