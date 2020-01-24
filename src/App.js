/*global chrome*/

import React from "react"

import { CSSTransition, TransitionGroup } from "react-transition-group"

// components //
import Player from "./components/Player"
import TrackSuggestions from "./components/TrackSuggestions"
import SearchItems from "./components/SearchItems"
import TabListItem from "./components/TabListItem"
import Settings from "./components/Settings"

import "./App.scss"

class App extends React.Component {
  constructor() {
    super()
    this.tabId = null
    this.state = {
      videoInfo: null,
      activeSection: "player",
      activeYoutubeTabKeys: [],
      selectVideoMode: false,
      selectedTabId: null
    }
  }

  componentDidMount() {
    this.findYoutubeTabs()
  }

  componentWillUnmount() {
    window.removeEventListener("keydown", this.handleKeyDown)
  }

  findYoutubeTabs = () => {
    const YOUTUBE_URL_REGEX = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/watch\?v=|\.be\/)([\w\-\_]*)(&(amp;)?‌​[\w\?‌​=]*)?/
    const YOUTUBE_ROOT_REGEX = /http(?:s?):\/\/(?:www\.)?youtu(?:be\.com\/?)$/

    chrome.tabs.query({}, tabs => {
      const youtubeTabsList = tabs.filter(t => YOUTUBE_URL_REGEX.test(t.url))

      if (youtubeTabsList.length === 0) {
        this.setState({
          selectVideoMode:
            tabs.filter(t => YOUTUBE_ROOT_REGEX.test(t.url)).length > 0
        })
        return
      }

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
          youtubeTabsList.map(t =>
            this.sendMessage({ type: "getVideoInfoInit", tabId: t.id }, t.id)
          )
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
                  window.addEventListener("keydown", this.handleKeyDown)
                  this.bindMessageListener()
                }
              )
            }
          })
        }
      )
    })
  }

  handleKeyDown = e => {
    const { videoInfo, activeSection } = this.state
    const { isVideoPlaying } = videoInfo
    if (activeSection !== "player") return
    if (videoInfo === null) return
    if (e.keyCode === 32) {
      this.sendMessage({
        type: isVideoPlaying ? "pauseVideo" : "playVideo"
      })
    }
    if (e.ctrlKey) {
      e.keyCode === 39 && this.sendMessage({ type: "skipTrack", skip: 1 })
      e.keyCode === 37 && this.sendMessage({ type: "skipTrack", skip: 0 })
    }
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
      selectedTabId,
      selectVideoMode
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
                            videoInfo: activeYoutubeTabKeys[t.id],
                            activeSection: "player"
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
                {!selectVideoMode ? (
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
                ) : (
                  <p>Play a video</p>
                )}
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
                      <span
                        className="player-icon settings"
                        onClick={() =>
                          this.setState({
                            activeSection:
                              activeSection === "settings"
                                ? "player"
                                : "settings"
                          })
                        }
                      >
                        <svg
                          width="14"
                          height="14"
                          viewBox="0 0 14 14"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7 13.1428C7.13915 13.1428 7.27226 13.1305 7.41746 13.1182L7.75022 13.7505C7.82887 13.9286 8.01037 14.0206 8.21608 13.9899C8.40363 13.9592 8.54278 13.8058 8.57303 13.6093L8.66984 12.8972C8.93604 12.8236 9.20225 12.7192 9.45635 12.6087L9.97666 13.0814C10.1158 13.2226 10.3155 13.2472 10.503 13.1428C10.6724 13.0446 10.739 12.8604 10.7027 12.6578L10.5575 11.958C10.7813 11.7984 10.9991 11.6142 11.2048 11.4178L11.8462 11.694C12.0337 11.7677 12.2213 11.7247 12.3604 11.5529C12.4875 11.4117 12.5056 11.2091 12.3967 11.0372L12.0216 10.4233C12.1789 10.1962 12.312 9.9445 12.433 9.68667L13.1409 9.7235C13.3405 9.73578 13.5099 9.61915 13.5765 9.42884C13.637 9.23854 13.5765 9.0421 13.4252 8.91933L12.8686 8.47734C12.9352 8.20723 12.9957 7.92485 13.0199 7.63633L13.6854 7.42147C13.879 7.35395 14 7.20048 14 6.9979C14 6.79532 13.879 6.63571 13.6854 6.56818L13.0199 6.35333C12.9957 6.06481 12.9352 5.78856 12.8686 5.51232L13.4192 5.07033C13.5765 4.95369 13.637 4.75725 13.5765 4.57309C13.5099 4.38279 13.3405 4.26615 13.1409 4.27843L12.433 4.30298C12.306 4.04516 12.1789 3.79961 12.0216 3.56633L12.3967 2.9586C12.4996 2.79285 12.4814 2.59027 12.3604 2.44294C12.2213 2.27719 12.0337 2.22808 11.8462 2.30789L11.1988 2.57185C10.9991 2.38155 10.7813 2.19739 10.5575 2.03778L10.7027 1.33796C10.739 1.12925 10.6664 0.945084 10.497 0.853003C10.3155 0.748644 10.1158 0.76706 9.97666 0.914391L9.45635 1.38094C9.20225 1.27044 8.93604 1.17836 8.66984 1.09855L8.57303 0.392596C8.54278 0.190017 8.40363 0.0426873 8.21003 0.00585479C8.01037 -0.024839 7.82887 0.0672424 7.75022 0.232989L7.41746 0.877558C7.27226 0.865281 7.13915 0.859142 7 0.859142C6.8548 0.859142 6.72169 0.865281 6.57649 0.877558L6.24978 0.239128C6.16508 0.0672424 5.98963 -0.024839 5.77787 0.00585479C5.59032 0.0426873 5.45117 0.190017 5.42092 0.392596L5.32411 1.09855C5.05791 1.17836 4.7917 1.27044 4.5376 1.38094L4.02334 0.914391C3.87813 0.773199 3.67848 0.748644 3.49698 0.853003C3.32757 0.945084 3.25497 1.12925 3.29127 1.33796L3.44252 2.03778C3.21867 2.19739 2.99481 2.38155 2.79516 2.57185L2.1478 2.30789C1.96024 2.22808 1.77269 2.27719 1.63354 2.44294C1.51253 2.59027 1.49438 2.79285 1.59723 2.95246L1.97234 3.56633C1.82109 3.79961 1.68799 4.04516 1.56093 4.30298L0.853068 4.27843C0.659464 4.26615 0.48401 4.38279 0.423509 4.57309C0.356958 4.75725 0.417459 4.95369 0.568712 5.07033L1.12532 5.51846C1.05877 5.78856 0.998271 6.06481 0.980121 6.35333L0.308557 6.56818C0.114952 6.63571 0 6.79532 0 6.9979C0 7.20048 0.114952 7.35395 0.308557 7.42147L0.980121 7.64247C0.998271 7.92485 1.05877 8.20723 1.12532 8.47734L0.574762 8.91933C0.417459 9.0421 0.356958 9.23854 0.423509 9.42271C0.48401 9.61915 0.659464 9.73578 0.859118 9.7235L1.56093 9.68667C1.68194 9.9445 1.82109 10.1962 1.97234 10.4233L1.59723 11.0372C1.49438 11.2091 1.51253 11.4117 1.63354 11.5529C1.77269 11.7247 1.96024 11.7677 2.1478 11.6879L2.78911 11.4178C2.99481 11.6142 3.21867 11.7984 3.44252 11.958L3.29127 12.664C3.25497 12.8604 3.32757 13.0446 3.49698 13.1489C3.67848 13.2472 3.87813 13.2226 4.01729 13.0875L4.5376 12.6087C4.7917 12.7192 5.05791 12.8236 5.32411 12.8972L5.42092 13.6093C5.45117 13.8058 5.59032 13.9592 5.78392 13.9961C5.98963 14.0206 6.16508 13.9286 6.24978 13.7567L6.57649 13.1182C6.72169 13.1305 6.8548 13.1428 7 13.1428ZM8.62749 6.43927C8.31893 5.63509 7.67761 5.19924 6.94555 5.19924C6.8548 5.19924 6.74589 5.20538 6.57649 5.24835L5.01556 2.53502C5.61452 2.25264 6.28608 2.09917 7 2.09917C9.4866 2.09917 11.4529 3.98377 11.7131 6.43927H8.62749ZM2.2567 6.9979C2.2567 5.40796 2.95851 4.00218 4.07779 3.11207L5.64477 5.83153C5.33016 6.206 5.18496 6.60502 5.18496 7.01631C5.18496 7.40919 5.31806 7.78366 5.64477 8.16426L4.03544 10.8469C2.94036 9.95678 2.2567 8.56942 2.2567 6.9979ZM6.22558 7.01018C6.22558 6.59888 6.57044 6.27966 6.95765 6.27966C7.35696 6.27966 7.68366 6.59888 7.68366 7.01018C7.68366 7.41533 7.35696 7.74683 6.95765 7.74683C6.57044 7.74683 6.22558 7.41533 6.22558 7.01018ZM7 11.8966C6.26188 11.8966 5.57217 11.737 4.96111 11.4424L6.56439 8.772C6.73379 8.81497 6.84875 8.82111 6.94555 8.82111C7.68366 8.82111 8.31893 8.37912 8.62749 7.55039H11.7131C11.4529 10.012 9.49265 11.8966 7 11.8966Z"
                            fill="white"
                          />
                        </svg>
                      </span>
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
                  {activeSection === "settings" && (
                    <CSSTransition
                      timeout={350}
                      classNames="heightDown-animation"
                    >
                      <Settings
                        videoInfo={videoInfo}
                        sendMessage={msg => this.sendMessage(msg)}
                      />
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
