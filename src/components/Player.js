import React, { useState, useEffect, useRef } from "react"
import { CSSTransition, TransitionGroup } from "react-transition-group"
import Timer from "./Timer"
import EllipsisScroll from "./EllipsisScroll"
import ImageVibrant from "./ImageVibrant"

const Player = props => {
  const volumeRef = useRef()

  const [openVolumeSlider, toggleVolumeSlider] = useState(false)

  useEffect(() => {
    document.addEventListener("mousedown", handleClick)
    return () => {
      document.removeEventListener("mousedown", handleClick)
    }
  }, [])

  const handleClick = e => {
    if (volumeRef && !volumeRef.current.contains(e.target))
      toggleVolumeSlider(false)
  }

  const {
    videoDuration = 0,
    videoCurrentTime = 0,
    isVideoPlaying,
    videoThumbNail,
    videoTitle,
    channelName = "",
    videoId,
    isVideoBuffering,
    isRepeat = false,
    videoVolume = 0
  } = props.videoInfo

  return (
    <>
      <ImageVibrant videoThumbNail={videoThumbNail} />
      <EllipsisScroll
        classNames="video-title"
        text={videoTitle.replace("&#39;", "'")}
      />
      <span className="video-channel-title ellipsis">{channelName}</span>
      <Timer
        videoCurrentTime={videoCurrentTime}
        videoDuration={videoDuration}
        isVideoPlaying={isVideoPlaying}
        isRepeat={isRepeat}
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
      <div className={`player-ui-toggle ${openVolumeSlider && "hide"}`}>
        <span
          className="player-ui-toggle-icons player-icon list"
          onClick={() => {
            props.sendMessage({ type: "fetchAutoPlayTracks" })
            props.toggleUI("auto-tracks")
          }}
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
          className="player-ui-toggle-icons volume-icon volume"
          onClick={() => toggleVolumeSlider(true)}
        >
          {videoVolume === 0 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                fill="#fff"
              />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          )}
          {videoVolume > 0 && videoVolume < 0.5 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
                fill="#fff"
              />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          )}
          {videoVolume >= 0.5 && (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                fill="#fff"
              />
              <path d="M0 0h24v24H0z" fill="none" />
            </svg>
          )}
        </span>
        <span
          className={`player-ui-toggle-icons player-icon repeat ${isRepeat &&
            "active"}`}
          onClick={() =>
            props.sendMessage({ type: "setRepeat", repeat: !isRepeat })
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
          </svg>
        </span>
      </div>
      <TransitionGroup>
        {openVolumeSlider && (
          <CSSTransition timeout={350} classNames="fadeUp-animation">
            <div className="volume-container" ref={volumeRef}>
              <input
                className="volume-slider"
                type="range"
                min="0"
                max="1"
                value={videoVolume}
                step="0.1"
                onChange={e => {
                  e.stopPropagation()
                  const volume = parseFloat(e.target.value, 10)

                  props.sendMessage({
                    type: "toggleVolume",
                    volume: volume
                  })
                }}
              />
            </div>
          </CSSTransition>
        )}
      </TransitionGroup>
    </>
  )
}

export default Player
