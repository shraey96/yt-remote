import React from "react";
import Timer from "./Timer";

const Player = props => {
  const {
    videoDuration = 0,
    videoCurrentTime = 0,
    isVideoPlaying,
    videoThumbNail,
    videoTitle,
    videoId,
    autoPlayTracks = [],
    isVideoBuffering
  } = props.videoInfo;
  return (
    <>
      <img className="video-thumbnail" src={videoThumbNail} alt="" />
      <p className="video-title ellipsis">{videoTitle}</p>
      <Timer
        currentTime={videoCurrentTime}
        playDuration={videoDuration}
        isVideoPlaying={isVideoPlaying}
        videoId={videoId}
        isVideoBuffering={isVideoBuffering}
        sendMessage={payload => props.sendMessage(payload)}
      />
      <div className="video-controls">
        <span
          className="player-icon prev"
          onClick={() => props.sendMessage({ type: "skipTrack", skip: 0 })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </span>
        <span
          className="player-icon play-pause"
          onClick={() =>
            props.sendMessage({
              type: isVideoPlaying ? "pauseVideo" : "playVideo"
            })
          }
        >
          {isVideoPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path d="M8 5v14l11-7z" />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          )}
        </span>
        <span
          className="player-icon next"
          onClick={() => props.sendMessage({ type: "skipTrack", skip: 1 })}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </span>
      </div>
      <div className="player-ui-toggle">
        <span
          className="player-icon list"
          onClick={() => props.toggleUI("auto-tracks")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </span>
        <span
          className="player-icon search"
          onClick={() => props.toggleUI("search")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
            <path d="M0 0h24v24H0z" fill="none" />
          </svg>
        </span>
      </div>
    </>
  );
};

export default Player;
