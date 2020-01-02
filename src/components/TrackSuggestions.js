/*global chrome*/

import React from "react"
import EllipsisScroll from "./EllipsisScroll"

class TrackSuggestions extends React.Component {
  constructor() {
    super()
    this.state = {
      isFetchingTracks: false,
      apiAutoPlayTracks: []
    }
  }

  componentDidMount() {
    const { videoId } = this.props.videoInfo
    chrome.storage.local.get([`autotracks-${videoId}`], result => {
      const storageAutoTracks = result[`autotracks-${videoId}`]

      if (!storageAutoTracks) {
        const apiKeys = [
          "AIzaSyC88bxeDCgQGOq-Jo2wS1qdzcUHndGRbNw",
          "AIzaSyDq5puPK5yCgfMrdD5JnZMnzIcSWi3kif4"
        ]
        const key = apiKeys[Math.floor(Math.random() * 2) + 1 - 1]
        const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&relatedToVideoId=${videoId}&type=video&key=${key}&maxResults=25&order=relevance`
        fetch(url)
          .then(res => res.json())
          .then(data => {
            const storageItems = data.items.map(i => ({
              title: i.snippet.title,
              link: `https://www.youtube.com/watch?v=${i.id.videoId}`,
              id: i.id.videoId,
              type: "apiTrack"
            }))
            chrome.storage.local.set(
              { [`autotracks-${videoId}`]: storageItems },
              () => {
                this.setState({
                  apiAutoPlayTracks: storageItems
                })
              }
            )
            chrome.storage.local.get(function(result) {
              const storageAllAutoplay = Object.keys(result) || []
              storageAllAutoplay.map(a => {
                if (!a.includes(videoId) && a !== "selectedTabId") {
                  chrome.storage.local.remove(a)
                }
                return a
              })
            })
          })
          .catch(err => console.log(111, err))
      } else {
        this.setState({
          apiAutoPlayTracks: storageAutoTracks
        })
      }
    })
  }

  render() {
    const { autoPlayTracks = [], videoId } = this.props.videoInfo
    const { isFetchingTracks, apiAutoPlayTracks } = this.state

    const tracksToMap = [...autoPlayTracks, ...apiAutoPlayTracks]

    return (
      <>
        <div className="suggestions-header-container">
          <span
            className="ui-icon back"
            onClick={() => this.props.toggleUI("player")}
          >
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
        </div>
        <div className="suggestions-results">
          {tracksToMap.map(a => {
            const isDOMTrack = a.type === "domTrack"
            return (
              <EllipsisScroll
                key={a.title}
                text={a.title.replace(/&amp;/g, "&").replace("&#39;", "'")}
                classNames={`result-item ellipsis ${a.id === videoId &&
                  "active"}`}
                onClick={() =>
                  this.props.sendMessage({
                    type: isDOMTrack ? "playVideoId" : "playNewVideo",
                    [isDOMTrack ? "vLink" : "videoId"]: isDOMTrack
                      ? a.link
                      : a.id
                  })
                }
              />
            )
          })}
        </div>

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
}

export default TrackSuggestions
