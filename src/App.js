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
      chrome.storage.local.set({ setTabId: this.tabId })
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
      if (request.type === "autoplay-tracks") {
        console.log(222, request)
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
          <div className="loader-container">
            <div className="loader-elements">
              <div className="loader3">
                <span></span>
                <span></span>
              </div>
              <p>Connecting to YouTube</p>
            </div>
          </div>
        ) : (
          <>
            <div className="player-container">
              <div className="player-top-bar">
                <div className="logo">
                  <span className="logo-container">
                    <svg
                      width="45"
                      height="44"
                      viewBox="0 0 45 44"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                        d="M15.3098 24.2437C15.3098 24.0082 15.2369 23.7783 15.1012 23.5858L0.726918 3.19763C0.501966 2.87856 0 3.03772 0 3.42812V41.7134C0 43.4096 1.78381 44.5138 3.302 43.7574L15.0882 37.8852C15.224 37.8175 15.3098 37.6788 15.3098 37.5271V24.2437ZM20.2305 34.6769C20.2305 34.974 20.5429 35.1674 20.8088 35.0349L43.4545 23.7521C45.1388 22.9129 45.1422 20.511 43.4603 19.667L27.9562 11.8876C27.7701 11.7942 27.5434 11.8593 27.4351 12.0373L20.3968 23.6083C20.288 23.7871 20.2305 23.9924 20.2305 24.2017V34.6769ZM23.29 9.80623C23.3486 9.70257 23.3221 9.56237 23.2157 9.50896L5.70174 0.721051C5.32912 0.53408 4.95477 0.970569 5.19635 1.31035L16.9082 17.7832C17.3926 18.4645 18.4208 18.4114 18.8325 17.6839L23.29 9.80623Z"
                        fill="url(#paint0_linear)"
                      />
                      <defs>
                        <linearGradient
                          id="paint0_linear"
                          x1="-4.1546"
                          y1="-2.57405"
                          x2="45.0825"
                          y2="38.0576"
                          gradientUnits="userSpaceOnUse"
                        >
                          <stop stop-color="#EF4056" />
                          <stop offset="1" stop-color="#F80302" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </span>
                  <p>Remote</p>
                </div>
              </div>
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
                      toggleUI={section => {
                        this.sendMessage({ type: "fetchAutoPlayTracks" })
                        this.setState({ activeSection: section })
                      }}
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
