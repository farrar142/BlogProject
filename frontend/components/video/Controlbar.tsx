import React, { useState, memo } from "react";
import classNames from "classnames";

import toTimeString from "./totimeString";
import ProgressBar from "./ProgressBar";

import styles from "./controlbar.module.scss";
import PauseIcon from "@mui/icons-material/Pause";
import PlayIcon from "@mui/icons-material/PlayArrow";
import MuteIcon from "@mui/icons-material/VolumeMute";
import VolumeIcon from "@mui/icons-material/VolumeUp";
import { IconButton } from "@mui/material";

interface IProps {
  onProgressChange: (percent: number) => void;
  onPlayIconClick: () => void;
  startTime: number;
  totalTime: number;
  currentTime: number;
  showControl: boolean;
  nowPlaying: boolean;
  videoElement: HTMLVideoElement | null;
}

const Controlbar: React.FC<IProps> = ({
  onProgressChange,
  onPlayIconClick,
  totalTime,
  currentTime,
  startTime,
  showControl,
  nowPlaying,
  videoElement,
}) => {
  const [volumeClicked, setVolumeClicked] = useState(false);

  const playControlClassProps = classNames(styles.playWrapper, {
    [styles.fadeIn]: showControl,
  });
  const controlBarClassProps = classNames(styles.controlBar, {
    [styles.fadeIn]: showControl,
  });
  const startTimeClassProps = classNames(styles.text, styles.startTime);
  const endTimeClassProps = classNames(styles.text, styles.endTime);

  // volume 클릭 관련 함수
  const handleVolume = () => {
    if (volumeClicked) {
      if (videoElement) {
        videoElement.muted = true;
      }
      setVolumeClicked(false);
    } else {
      if (videoElement) {
        videoElement.muted = false;
      }
      setVolumeClicked(true);
    }
  };

  // 마우스를 올렸을때 실행되는 함수
  const onMouseUp = () => {
    if (videoElement) {
      // controller를 옮긴 시점에 currentTime이 최신화 되지 않아, 이를 위해 수정
      videoElement.currentTime = currentTime;
      nowPlaying ? videoElement.play() : videoElement.pause();
    }
  };

  // 마우스를 내렸을때 실행되는 함수
  const onMouseDown = () => {
    if (videoElement) {
      videoElement.pause();
    }
  };

  return (
    <>
      <div className={controlBarClassProps}>
        <span className={startTimeClassProps}>{toTimeString(startTime)}</span>
        <ProgressBar
          max={totalTime}
          value={currentTime}
          className={styles.progressBar}
          onChange={onProgressChange}
          onMouseDown={onMouseDown}
          onMouseUp={onMouseUp}
        />
        <span className={endTimeClassProps}>{toTimeString(totalTime)}</span>
        <IconButton onClick={handleVolume}>
          {volumeClicked ? <VolumeIcon /> : <MuteIcon />}
        </IconButton>
      </div>
      <div className={playControlClassProps}>
        <div className={styles.playBg}>
          <IconButton onClick={onPlayIconClick}>
            {nowPlaying ? <PauseIcon /> : <PlayIcon />}
          </IconButton>
          {/* <img
            className={styles.playIcon}
            src=
          /> */}
        </div>
      </div>
    </>
  );
};

export default memo(Controlbar);
