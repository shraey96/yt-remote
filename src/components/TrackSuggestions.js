import React from "react"
import EllipsisScroll from "./EllipsisScroll"

class TrackSuggestions extends React.Component {
  constructor() {
    super()
    this.state = {
      isFetchingTracks: false
    }
  }

  componentDidMount() {
    this.playerDOM = document.querySelector(".autoplay-container")
    this.playerDOM.addEventListener("scroll", this.calcuteScroll)
  }

  componentWillUnmount() {
    this.playerDOM.removeEventListener("scroll", this.calcuteScroll)
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.videoInfo.autoPlayTracks.length !==
      this.props.videoInfo.autoPlayTracks.length
    ) {
      this.setState({
        isFetchingTracks: false
      })
    }
  }

  calcuteScroll = () => {
    if (this.props.videoInfo.autoPlayTracks.length > 90) return
    const hasScrolledToBottom =
      this.playerDOM.scrollHeight - this.playerDOM.scrollTop ===
      this.playerDOM.clientHeight
    if (hasScrolledToBottom && !this.state.isFetchingTracks) {
      this.setState(
        {
          isFetchingTracks: true
        },
        () => {
          this.props.sendMessage({
            type: "scrollBottom"
          })
          setTimeout(() => {
            this.setState({
              isFetchingTracks: false
            })
          }, 2000)
        }
      )
    }
  }

  render() {
    const { autoPlayTracks = [], videoId } = this.props.videoInfo
    const { isFetchingTracks } = this.state

    return (
      <>
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
        {autoPlayTracks.map(a => {
          return (
            <EllipsisScroll
              key={a.title}
              text={a.title.replace(/&amp;/g, "&").replace("&#39;", "")}
              classNames={`result-item ellipsis ${a.id === videoId &&
                "active"}`}
              onClick={() =>
                this.props.sendMessage({
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
}

export default TrackSuggestions
