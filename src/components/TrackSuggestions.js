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
          "AIzaSyDq5puPK5yCgfMrdD5JnZMnzIcSWi3kif4",
          "AIzaSyAsH4766YGg_JEJZTIXWORBVzkn0BidVgE"
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
              width="5"
              height="9"
              viewBox="0 0 5 9"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.94123e-07 4.37743C1.94123e-07 4.58611 0.0806454 4.76082 0.237192 4.92097L3.88046 8.55588C4.0038 8.68691 4.1556 8.75 4.33586 8.75C4.70588 8.75 5 8.44911 5 8.07543C5 7.89102 4.92884 7.71631 4.79602 7.58042L1.57021 4.37743L4.79602 1.16958C4.9241 1.03369 5 0.863838 5 0.67457C5 0.300887 4.70588 0 4.33586 0C4.1556 0 4.0038 0.0679423 3.87571 0.194121L0.237192 3.83389C0.0759015 3.99889 1.94123e-07 4.16875 1.94123e-07 4.37743Z"
                fill="white"
              />
            </svg>
          </span>
          <p>Tracks for you</p>
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
