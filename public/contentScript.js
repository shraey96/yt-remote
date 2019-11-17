console.log("content script running")
let youtubePlayerDOM = document.querySelector("video")
let previousVideoSrc = ""

window.addEventListener("load", () => {
  youtubePlayerDOM = document.querySelector("video")
  sendMessage(getDefaultVideoStats())
})

window.addEventListener("yt-navigate-finish", () => {
  youtubePlayerDOM = document.querySelector("video")
})

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log(
    sender.tab
      ? "from a content script:" + sender.tab.url
      : "from the extension"
  )
  console.log(1111, request, sender, request.type)

  switch (request.type) {
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
      setVideoVolume(request.volume)
      sendMessage(getDefaultVideoStats())
      break
    case "scrollBottom":
      scrollToBottom()
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
    videoThumbNail: `https://img.youtube.com/vi/${videoId}/0.jpg`,
    isVideoPlaying: isVideoPlaying(),
    videoCurrentTime: getVideoCurrentTime(),
    videoDuration: getVideoDuration(),
    videoVolume: getVolume(),
    videoSrc: getVideoSrc(),
    videoTitle: getVideoTitle(),
    autoPlayTracks: getAutoplayTracks(),
    type: "content-videoInfoResponse",
    hasNext: document.querySelector(`.ytp-prev-button`) ? true : false,
    hasPrev: document.querySelector(`.ytp-next-button`) ? true : false,
    isVideoBuffering: false,
    isRepeat: youtubePlayerDOM.loop || false
  }
  return videoInfo
}

const setVideoRepeat = repeat => {
  youtubePlayerDOM.loop = repeat || false
}

const getVideoId = () => {
  let params = new URLSearchParams(window.location.search)
  return params.get("v")
}

const getVideoTitle = () => {
  const title = document.querySelector(".title").innerText
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

const setVideoVolume = volume => {
  youtubePlayerDOM.volume = volume
  if (volume > 0) youtubePlayerDOM.muted = false
  return volume
}

const getVolume = () => {
  if (youtubePlayerDOM.muted) return 0
  else return youtubePlayerDOM.volume
}

const setVolume = volume => {
  youtubePlayerDOM.volume = volume
}

const skipTrack = val => {
  const skipBtnDOM = document.querySelector(
    `.ytp-${val === 0 ? "prev" : "next"}-button`
  )
  if (skipBtnDOM) skipBtnDOM.click()
}

const playVideoId = id => {
  const videoIdAnchor = document.querySelector(`a[href='${id}']`)
  if (videoIdAnchor) videoIdAnchor.click()
}

const playNewVideo = id => {
  const videoUrl = `https://www.youtube.com/watch?v=${id}`
  window.location = videoUrl
}

const getAutoplayTracks = () => {
  let autoPlayDom = document.querySelectorAll("span.ytd-compact-video-renderer")
  return Array.from(autoPlayDom).map(d => {
    const href = d.closest("a.ytd-compact-video-renderer").getAttribute("href")
    return {
      title: d.innerText,
      link: href,
      id: href.split("?")[1].replace("v=", "")
    }
  })
}

const scrollToBottom = () => {
  const HTMLDOM = document.querySelector("html")
  HTMLDOM.scrollTo(0, HTMLDOM.scrollHeight)
  setTimeout(() => {
    sendMessage({
      type: "content-scrollDown",
      autoPlayTracks: getAutoplayTracks()
    })
  }, 800)
}
