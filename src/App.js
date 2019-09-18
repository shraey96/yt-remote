/*global chrome*/

import React from 'react'
import Timer from './components/Timer'
import './App.scss'

class App extends React.Component {

  constructor() {
    super()
    this.tabId = null
    this.state = {
      videoInfo: null,
      activeSection: 'player'
    }
  }

  componentDidMount() {
    chrome.tabs.query({}, tabs => {
      const youtubeTab = tabs.find(t => t.url.includes('youtube'))
      this.tabId = youtubeTab.id
      this.bindMessageListener()
    })
  }

  bindMessageListener = () => {
    this.sendMessage({ type: 'getVideoInfo' })
    chrome.runtime.onMessage.addListener(
      (request, sender, sendResponse) => {
        console.log(sender.tab ?
          "from a content script:" + sender.tab.url :
          "from the extension");
        console.log(1111, request, sender)
        if (request.type === "content-videoInfoResponse" || request.type === "content-videoSRCChange") {
          this.setState({
            videoInfo: request
          })
        }

        if (request.type === "content-videoPlay") {
          this.setState({
            videoInfo: {
              ...this.state.videoInfo,
              isVideoPlaying: true
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
      })
  }

  sendMessage = message => {
    chrome.tabs.sendMessage(this.tabId, message,
      response => {
        console.log(response)
      })
  }


  render() {
    const { videoInfo, activeSection } = this.state
    if (videoInfo === null) return ''

    const { videoDuration = 0, videoCurrentTime = 0, isVideoPlaying,
      videoThumbNail, videoTitle, videoId, autoPlayTracks = [] } = videoInfo
    console.log(videoInfo)
    return (
      <div className="App">
        {activeSection === 'player' &&
          <>
            <img
              className="video-thumbnail"
              src={videoThumbNail}
              alt=""
            />
            <p className="video-title">
              {videoTitle}
            </p>
            <Timer
              currentTime={videoCurrentTime}
              playDuration={videoDuration}
              isVideoPlaying={isVideoPlaying}
              videoId={videoId}
              sendMessage={payload => this.sendMessage(payload)}
            />
            <div className="video-controls">
              <button
                onClick={() => this.sendMessage({ type: 'skipTrack', skip: 0 })}
              >
                Prev
          </button>
              <button
                onClick={() => this.sendMessage({ type: isVideoPlaying ? 'pauseVideo' : 'playVideo' })}
              >
                {
                  isVideoPlaying ? 'Pause'
                    : 'Play'
                }
              </button>
              <button
                onClick={() => this.sendMessage({ type: 'skipTrack', skip: 1 })}
              >
                Next
          </button>
            </div>
            <button onClick={() => this.setState({ activeSection: 'auto-tracks' })}>Auto Tracks</button>
          </>
        }
        {
          activeSection === 'auto-tracks' &&
          <div className="autoplay-container">
            <button onClick={() => this.setState({ activeSection: 'player' })}>Back</button>
            {
              autoPlayTracks.map(a => {
                return (
                  <p
                    className="autoplay-item"
                    onClick={() => this.sendMessage({
                      type: 'playVideoId',
                      vLink: a.link
                    })}
                  >{a.title}</p>
                )
              })
            }
          </div>
        }
      </div>
    )
  }
}

export default App;
