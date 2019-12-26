let youtubePlayerDOM = document.querySelector("video")
let previousVideoSrc = ""

console.log(`#### Running Content Script From Public ####`)

window.addEventListener("load", () => {
  youtubePlayerDOM = document.querySelector("video") || youtubePlayerDOM
  sendMessage(getDefaultVideoStats())
})

window.addEventListener("yt-navigate-finish", () => {
  youtubePlayerDOM = document.querySelector("video") || youtubePlayerDOM
  setTimeout(() => {
    sendMessage(getDefaultVideoStats())
  }, 400)
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  )
  console.log(1111, request, sender, request.type)

  switch (request.type) {
    case "getVideoInfoInit":
      sendResponse({
        ...getDefaultVideoStats(),
        tabId: request.tabId
      })
      break
    case "getVideoInfo":
      sendMessage(getDefaultVideoStats())
      break
    case "playVideo":
      sendMessage(playVideo())
      break
    case "pauseVideo":
      sendMessage(pauseVideo())
      break
    case "seekVideo":
      sendMessage(seekVideo(request.duration))
      break
    case "skipTrack":
      skipTrack(request.skip)
      break
    case "playVideoId":
      playVideoId(request.vLink)
      break
    case "playNewVideo":
      playNewVideo(request.videoId)
      break
    case "setRepeat":
      setVideoRepeat(request.repeat)
      sendMessage(getDefaultVideoStats())
      break
    case "toggleVolume":
      setVolume(request.volume)
      sendMessage(getDefaultVideoStats())
      break
    case "scrollBottom":
      scrollToBottom()
      break
    case "fetchAutoPlayTracks":
      setTimeout(() => {
        scrollBottom()
      }, 500)
      sendMessage({
        type: "autoplay-tracks",
        autoPlayTracks: getAutoplayTracks()
      })
      break

    default:
      break
  }
})

if (youtubePlayerDOM && youtubePlayerDOM !== null) {
  previousVideoSrc = youtubePlayerDOM.src
  youtubePlayerDOM.addEventListener("loadedmetadata", e => {
    if (e.target.src !== previousVideoSrc) {
      previousVideoSrc = e.target.src
      sendMessage({
        ...getDefaultVideoStats(),
        type: "content-videoSRCChange"
      })
      setTimeout(() => {
        sendMessage({
          ...getDefaultVideoStats(),
          type: "content-videoSRCChange"
        })
      }, 300)
      setTimeout(() => {
        sendMessage({
          ...getDefaultVideoStats(),
          type: "content-videoSRCChange"
        })
      }, 600)
    }
  })
  youtubePlayerDOM.addEventListener("play", e => {
    sendMessage({
      ...getDefaultVideoStats(),
      videoBuffering: false,
      type: "content-videoPlay"
    })
  })
  youtubePlayerDOM.addEventListener("pause", e => {
    sendMessage({
      ...getDefaultVideoStats(),
      type: "content-videoPause"
    })
  })
  // youtubePlayerDOM.addEventListener("volumechange", e => {
  //   chrome.storage.local.set({ videoVolume: e.target.volume })
  // })
  youtubePlayerDOM.addEventListener("ended", () => {
    setTimeout(() => {
      skipTrack(1)
    }, 400)
  })
  youtubePlayerDOM.addEventListener("waiting", e => {
    sendMessage({
      videoBuffering: true,
      type: "content-videoWaiting"
    })
    youtubePlayerDOM.addEventListener("playing", e => {
      sendMessage({
        videoBuffering: false,
        type: "content-videoWaitingEnd"
      })
    })
  })
}

const sendMessage = message => {
  chrome.runtime.sendMessage(message, response => {
    console.log(response)
  })
}

const getDefaultVideoStats = () => {
  const videoId = getVideoId()
  const videoInfo = {
    videoId,
    videoThumbNail: `https://i3.ytimg.com/vi/${videoId}/maxresdefault.jpg `,
    isVideoPlaying: isVideoPlaying(),
    videoCurrentTime: getVideoCurrentTime(),
    videoDuration: getVideoDuration(),
    videoVolume: getVolume(),
    videoSrc: getVideoSrc(),
    videoTitle: getVideoTitle(),
    autoPlayTracks: getAutoplayTracks(),
    type: "content-videoInfoResponse",
    hasPrev: document.querySelector(`.ytp-prev-button`) ? true : false,
    hasNext: document.querySelector(`.ytp-next-button`) ? true : false,
    isVideoBuffering: false,
    channelName: document.querySelector(".style-scope ytd-channel-name a")
      .innerText,
    isRepeat: checkVideoRepeat()
  }
  setTimeout(() => {
    skipAdd()
  }, 5000)
  return videoInfo
}

const setVideoRepeat = repeat => {
  const repeatConfig = repeat || false
  youtubePlayerDOM.loop = repeatConfig
  sessionStorage.setItem("yt-remote-repeat", repeatConfig)
}

const checkVideoRepeat = () => {
  const remoteRepeat = sessionStorage.getItem("yt-remote-repeat")
  const hasRepeat =
    remoteRepeat !== null
      ? JSON.parse(remoteRepeat)
      : youtubePlayerDOM.loop || false
  return hasRepeat
}

const getVideoId = () => {
  let params = new URLSearchParams(window.location.search)
  return params.get("v")
}

const getVideoTitle = () => {
  return document.querySelector(
    "h1.ytd-video-primary-info-renderer",
    "yt-formatted-string.ytd-video-primary-info-renderer"
  ).innerText
}

const getVideoSrc = () => {
  return youtubePlayerDOM.src
}

const isVideoPlaying = () => {
  return !youtubePlayerDOM.paused
}

const getVideoCurrentTime = () => {
  return youtubePlayerDOM.currentTime
}

const getVideoDuration = () => {
  return youtubePlayerDOM.duration
}

const pauseVideo = () => {
  youtubePlayerDOM.pause()
  return true
}

const playVideo = () => {
  youtubePlayerDOM.play()
  return true
}

const seekVideo = duration => {
  youtubePlayerDOM.currentTime = parseInt(duration, 10)
  return duration
}

const setVolume = volume => {
  youtubePlayerDOM.volume = volume
  if (volume > 0) youtubePlayerDOM.muted = false
  setSessionStorageVol(volume)
  return volume
}

const getVolume = () => {
  return getSessionStorageVolume()
}

const skipTrack = val => {
  const skipBtnDOM = document.querySelector(
    `.ytp-${val === 0 ? "prev" : "next"}-button`
  )
  if (skipBtnDOM) skipBtnDOM.click()
  removeRepeat()
}

const playVideoId = id => {
  const videoIdAnchor = document.querySelector(`a[href='${id}']`)
  if (videoIdAnchor) videoIdAnchor.click()
  removeRepeat()
  setTimeout(() => {
    skipAdd()
  }, 5000)
  setTimeout(() => {
    scrollToBottom()
  }, 1000)
}

const playNewVideo = id => {
  const videoUrl = `https://www.youtube.com/watch?v=${id}`
  removeRepeat()
  window.location = videoUrl
}

const getAutoplayTracks = () => {
  if (window.location.href.includes("list")) {
    let playlistTracksDOM = document.querySelectorAll(
      "ytd-playlist-panel-video-renderer a#wc-endpoint"
    )
    return Array.from(playlistTracksDOM).map(d => {
      const href = d.getAttribute("href")
      return {
        link: href,
        title: d.querySelector("#meta #video-title").innerText,
        id: href
      }
    })
  } else {
    let autoPlayDom = document.querySelectorAll(
      "span.ytd-compact-video-renderer"
    )
    return Array.from(autoPlayDom).map(d => {
      const href = d
        .closest("a.ytd-compact-video-renderer")
        .getAttribute("href")
      return {
        title: d.innerText,
        link: href,
        id: href.split("?")[1].replace("v=", "")
      }
    })
  }
}

const scrollToBottom = () => {
  const HTMLDOM = document.querySelector("html")
  HTMLDOM.scrollTo(0, HTMLDOM.scrollHeight)
  setTimeout(() => {
    sendMessage({
      type: "content-scrollDown",
      autoPlayTracks: getAutoplayTracks()
    })
  }, 1000)
}

const skipAdd = () => {
  const addSkipBtn = document.querySelector(".ytp-ad-skip-button")
  if (addSkipBtn || addSkipBtn !== null) addSkipBtn.click()
}

const setSessionStorageVol = vol => {
  let sessionStorageVol =
    sessionStorage.getItem("yt-player-volume") ||
    JSON.stringify({
      data: {},
      creation: ""
    })
  sessionStorageVol = JSON.parse(sessionStorageVol)
  sessionStorageVol.data = { volume: vol * 100, muted: vol === 0 }
  sessionStorageVol.data = JSON.stringify(sessionStorageVol.data)
  sessionStorageVol.creation = new Date().getTime()
  sessionStorage.setItem("yt-player-volume", JSON.stringify(sessionStorageVol))
}

const getSessionStorageVolume = () => {
  let domVolume = youtubePlayerDOM.muted ? 0 : youtubePlayerDOM.volume
  let sessionStorageVol =
    sessionStorage.getItem("yt-player-volume") !== null
      ? JSON.parse(JSON.parse(sessionStorage.getItem("yt-player-volume")).data)
          .volume / 100
      : domVolume

  return sessionStorageVol
}

const removeRepeat = () => {
  sessionStorage.removeItem("yt-remote-repeat")
  youtubePlayerDOM.loop = false
  sendMessage(getDefaultVideoStats())
}
