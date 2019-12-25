/*global chrome*/

import React from "react"

import { CSSTransition, TransitionGroup } from "react-transition-group"

// components //
import Player from "./components/Player"
import TrackSuggestions from "./components/TrackSuggestions"
import SearchItems from "./components/SearchItems"
import TabListItem from "./components/TabListItem"

import "./App.scss"

class App extends React.Component {
  constructor() {
    super()
    this.tabId = null
    this.state = {
      videoInfo: null,
      activeSection: "player",
      activeYoutubeTabKeys: [],
      selectedTabId: null
    }
  }

  componentDidMount() {
    this.findYoutubeTabs()
  }

  findYoutubeTabs = () => {
    const YOUTUBE_URL_REGEX = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
    chrome.tabs.query({}, tabs => {
      const youtubeTabsList = tabs.filter(t => YOUTUBE_URL_REGEX.test(t.url))

      const youtubeTabKeys = {}
      youtubeTabsList.map(k => {
        youtubeTabKeys[k.id] = { ...k }
        return k
      })
      this.setState(
        {
          activeYoutubeTabKeys: youtubeTabKeys
        },
        () => {
          youtubeTabsList.map(t => {
            this.sendMessage({ type: "getVideoInfoInit", tabId: t.id }, t.id)
          })
          chrome.storage.local.get(["selectedTabId"], result => {
            const storageSelectedTab = result.selectedTabId

            if (!storageSelectedTab) return
            if (
              youtubeTabsList.some(
                t => t.id === parseInt(storageSelectedTab, 10)
              )
            ) {
              this.setState(
                {
                  selectedTabId: storageSelectedTab
                },
                () => {
                  this.bindMessageListener()
                }
              )
            }
          })
        }
      )
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
        this.setState({
          videoInfo: {
            ...this.state.videoInfo,
            autoPlayTracks: request.autoPlayTracks
          }
        })
      }
      return true
    })
  }

  sendMessage = (message, tabId = this.state.selectedTabId) => {
    chrome.tabs.sendMessage(tabId, message, response => {
      if (
        response &&
        response.tabId &&
        this.state.activeYoutubeTabKeys[response.tabId]
      ) {
        this.setState({
          activeYoutubeTabKeys: {
            ...this.state.activeYoutubeTabKeys,
            [response.tabId]: {
              ...this.state.activeYoutubeTabKeys[response.tabId],
              ...response
            }
          }
        })
      }
    })
  }

  render() {
    const {
      videoInfo,
      activeSection,
      activeYoutubeTabKeys,
      selectedTabId
    } = this.state

    const activeYoutubeTabs = Object.values(activeYoutubeTabKeys)
    console.log(this.state)
    return (
      <div className="App">
        {activeYoutubeTabs.length > 0 &&
        (!selectedTabId || selectedTabId === null) ? (
          <div className="youtube-tabs-list-container">
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
            <div className="list-tabs">
              {activeYoutubeTabs.map((t, i) => {
                return (
                  <TabListItem
                    key={t.id}
                    index={i}
                    videoThumbNail={t.videoThumbNail}
                    videoTitle={t.videoTitle}
                    onClick={() => {
                      chrome.storage.local.set({ selectedTabId: t.id }, () => {
                        if (activeYoutubeTabKeys[t.id].videoDuration === null) {
                          chrome.tabs.update(t.id, { active: true })
                        }
                        this.setState(
                          {
                            selectedTabId: t.id,
                            videoInfo: activeYoutubeTabKeys[t.id]
                          },
                          () => this.bindMessageListener()
                        )
                      })
                    }}
                  />
                )
              })}
            </div>
          </div>
        ) : (
          <>
            {videoInfo === null || activeYoutubeTabs.length === 0 ? (
              <div className="loader-container">
                <div className="loader-elements">
                  <div className="loader3">
                    <span></span>
                    <span></span>
                  </div>
                  <p>Connecting to YouTube</p>
                  <p
                    className="new-tab-link"
                    onClick={() =>
                      chrome.tabs.create({ url: "https://youtube.com" })
                    }
                  >
                    Open YouTube
                  </p>
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
                    <div className="controls">
                      <span className="player-icon settings">S</span>
                      <span
                        className="player-icon tabs"
                        onClick={() =>
                          this.setState({ selectedTabId: null }, () =>
                            chrome.storage.local.set({ selectedTabId: null })
                          )
                        }
                      >
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fill-rule="evenodd"
                            clip-rule="evenodd"
                            d="M8.91356 0.737288H2.27288C2.31356 0.259322 2.60339 0 3.11186 0H8.07458C8.58305 0 8.87288 0.259322 8.91356 0.737288ZM9.91525 2.27288H1.20508C1.27119 1.76949 1.54068 1.47458 2.11525 1.47458H9.00508C9.57966 1.47458 9.84407 1.76949 9.91525 2.27288ZM9.37119 12H1.7339C0.605085 12 0 11.4 0 10.2814V4.84576C0 3.72203 0.605085 3.12203 1.7339 3.12203H9.37119C10.5 3.12203 11.1051 3.72712 11.1051 4.84576V10.2814C11.1051 11.4 10.5 12 9.37119 12ZM4 5.5V9.5L8 7.50707L4 5.5Z"
                            fill="white"
                          />
                        </svg>
                      </span>
                      <span
                        className="player-icon search"
                        onClick={() =>
                          this.setState({ activeSection: "search" })
                        }
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
                  </div>
                  <div className="player-component">
                    <Player
                      videoInfo={videoInfo}
                      toggleUI={section =>
                        this.setState({ activeSection: section })
                      }
                      sendMessage={msg => this.sendMessage(msg)}
                    />
                  </div>
                </div>
                <TransitionGroup>
                  {activeSection === "auto-tracks" && (
                    <CSSTransition timeout={350} classNames="fadeUp-animation">
                      <div className="autoplay-container">
                        <TrackSuggestions
                          videoInfo={videoInfo}
                          toggleUI={section => {
                            this.setState({ activeSection: section })
                          }}
                          sendMessage={msg => this.sendMessage(msg)}
                        />
                      </div>
                    </CSSTransition>
                  )}
                  {activeSection === "search" && (
                    <CSSTransition
                      timeout={350}
                      classNames="fadeRight-animation"
                    >
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
          </>
        )}
      </div>
    )
  }
}

export default App
