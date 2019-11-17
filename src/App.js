/*global chrome*/

import React from "react"

import { CSSTransition, TransitionGroup } from "react-transition-group"

// components //
import Player from "./components/Player"
import TrackSuggestions from "./components/TrackSuggestions"
import SearchItems from "./components/SearchItems"

import "./App.scss"

class App extends React.Component {
  constructor() {
    super()
    this.tabId = null
    this.state = {
      videoInfo: null,
      activeSection: "player"
    }
  }

  componentDidMount() {
    chrome.tabs.query({}, tabs => {
      const youtubeTab = tabs.find(t => t.url.includes("youtube"))
      this.tabId = youtubeTab.id
      this.bindMessageListener()
    })
  }

  bindMessageListener = () => {
    this.sendMessage({ type: "getVideoInfo" })
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      console.log(
        sender.tab
          ? "from a content script:" + sender.tab.url
          : "from the extension"
      )
      console.log(1111, request, sender)
      if (
        request.type === "content-videoInfoResponse" ||
        request.type === "content-videoSRCChange"
      ) {
        this.setState({
          videoInfo: request
        })
      }

      if (request.type === "content-videoPlay") {
        this.setState({
          videoInfo: {
            ...this.state.videoInfo,
            isVideoPlaying: true,
            isVideoBuffering: false
          }
        })
      }
      if (request.type === "content-videoPause") {
        this.setState({
          videoInfo: {
            ...this.state.videoInfo,
            isVideoPlaying: false
          }
        })
      }
      if (request.type === "content-videoWaiting") {
        this.setState({
          videoInfo: {
            ...this.state.videoInfo,
            isVideoBuffering: true
          }
        })
      }
      if (request.type === "content-videoWaitingEnd") {
        this.setState({
          videoInfo: {
            ...this.state.videoInfo,
            isVideoBuffering: false
          }
        })
      }
      if (request.type === "content-scrollDown") {
        this.setState({
          videoInfo: {
            ...this.state.videoInfo,
            autoPlayTracks: request.autoPlayTracks
          }
        })
      }
    })
  }

  sendMessage = message => {
    chrome.tabs.sendMessage(this.tabId, message, response => {})
  }

  render() {
    const { videoInfo, activeSection } = this.state

    console.log("videoInfo:: ", videoInfo)
    return (
      <div className="App">
        {videoInfo === null ? (
          ""
        ) : (
          <>
            <div className="player-container">
              <Player
                videoInfo={videoInfo}
                toggleUI={section => this.setState({ activeSection: section })}
                sendMessage={msg => this.sendMessage(msg)}
              />
            </div>
            <TransitionGroup>
              {activeSection === "auto-tracks" && (
                <CSSTransition timeout={350} classNames="fadeUp-animation">
                  <div className="autoplay-container">
                    <TrackSuggestions
                      videoInfo={videoInfo}
                      toggleUI={section =>
                        this.setState({ activeSection: section })
                      }
                      sendMessage={msg => this.sendMessage(msg)}
                    />
                  </div>
                </CSSTransition>
              )}
              {activeSection === "search" && (
                <CSSTransition timeout={350} classNames="fadeRight-animation">
                  <div className="search-items-container">
                    <SearchItems
                      toggleUI={section =>
                        this.setState({ activeSection: section })
                      }
                      sendMessage={msg => this.sendMessage(msg)}
                    />
                  </div>
                </CSSTransition>
              )}
            </TransitionGroup>
          </>
        )}
      </div>
    )
  }
}

export default App
