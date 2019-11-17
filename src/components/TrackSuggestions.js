import React, { useEffect, useState } from "react"
import EllipsisScroll from "./EllipsisScroll"

const TrackSuggestions = props => {
  const { autoPlayTracks = [], videoId } = props.videoInfo
  const [isFetchingTracks, toggleFetchTracks] = useState(false)
  const [fetchTracksAvailable, toggleFetchTracksAvailable] = useState(
    !(autoPlayTracks.length > 100)
  )

  useEffect(() => {
    const playerDOM = document.querySelector(".autoplay-container")
    playerDOM.addEventListener("scroll", calcuteScroll)

    function calcuteScroll() {
      if (
        (playerDOM.scrollTop / playerDOM.offsetHeight) * 100 > 75 &&
        !isFetchingTracks &&
        fetchTracksAvailable
      ) {
        toggleFetchTracks(true)
        props.sendMessage({
          type: "scrollBottom"
        })
        setTimeout(() => {
          toggleFetchTracks(false)
        }, 800)
      }
    }
  }, [])

  return (
    <>
      <span className="ui-icon back" onClick={() => props.toggleUI("player")}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </span>
      {autoPlayTracks.map(a => {
        return (
          // <p
          //   className={`result-item ellipsis ${a.id === videoId && "active"}`}
          //   onClick={() =>
          //     props.sendMessage({
          //       type: "playVideoId",
          //       vLink: a.link
          //     })
          //   }
          // >
          //   {a.title.replace(/&amp;/g, "&")}
          // </p>
          <EllipsisScroll
            key={a.title}
            text={a.title.replace(/&amp;/g, "&")}
            classNames={`result-item ellipsis ${a.id === videoId && "active"}`}
            onClick={() =>
              props.sendMessage({
                type: "playVideoId",
                vLink: a.link
              })
            }
          />
        )
      })}
      {isFetchingTracks && (
        <div className="loading-dots">
          <div className="loading-dots--dot"></div>
          <div className="loading-dots--dot"></div>
          <div className="loading-dots--dot"></div>
        </div>
      )}
    </>
  )
}

export default TrackSuggestions
