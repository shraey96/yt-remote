console.log('content script running')
const youtubePlayerDOM = document.querySelector('video')
const videoThumb = `https://img.youtube.com/vi/wFvMD5rzuvY/0.jpg`
let previousVideoSrc = ''



const getVideoId = () => {
    let params = new URLSearchParams(window.location.search)
    return params.get('v')
}

chrome.runtime.onMessage.addListener(
    (request, sender, sendResponse) => {
        console.log(sender.tab ?
            "from a content script:" + sender.tab.url :
            "from the extension");
        console.log(1111, request, sender, request.type)

        switch (request.type) {
            case 'getVideoInfo':
                sendMessage(getDefaultVideoStats())
                break;
            case 'playVideo':
                sendMessage(playVideo())
                break;
            case 'pauseVideo':
                sendMessage(pauseVideo())
                break;
            case 'seekVideo':
                sendMessage(seekVideo(request.duration))
                break;
            case 'skipTrack':
                skipTrack(request.skip)
                break;
            case 'playVideoId':
                playVideoId(request.vLink)
                break;

            default:
                break;
        }
    })

if (youtubePlayerDOM && youtubePlayerDOM !== null) {
    previousVideoSrc = youtubePlayerDOM.src
    youtubePlayerDOM.addEventListener('loadedmetadata', e => {
        if (e.target.src !== previousVideoSrc) {
            previousVideoSrc = e.target.src
            sendMessage({
                ...getDefaultVideoStats(),
                type: 'content-videoSRCChange',
            })
            setTimeout(() => {
                sendMessage({
                    ...getDefaultVideoStats(),
                    type: 'content-videoSRCChange',
                })
            }, 300);
        }
    })
    youtubePlayerDOM.addEventListener('play', e => {
        sendMessage({
            ...getDefaultVideoStats(),
            type: 'content-videoPlay',
        })
    })
    youtubePlayerDOM.addEventListener('waiting', e => {
        sendMessage({
            videoBuffering: true,
            type: 'content-videoWaiting',
        })
    })
    youtubePlayerDOM.addEventListener('pause', e => {
        sendMessage({
            ...getDefaultVideoStats(),
            type: 'content-videoPause',
        })
    })
}

const sendMessage = message => {
    chrome.runtime.sendMessage(message,
        response => {
            console.log(response);
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
        type: 'content-videoInfoResponse',
        hasNext: document.querySelector(`.ytp-prev-button`) ? true : false,
        hasPrev: document.querySelector(`.ytp-next-button`) ? true : false,
        isVideoBuffering: false
    }
    return videoInfo
}

const getVideoTitle = () => {
    // return document.querySelector('yt-formatted-string.title').innerText
    return document.querySelector('.title').innerText
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
    return duration
}

const getVolume = () => {
    if (youtubePlayerDOM.muted)
        return 0
    else
        return youtubePlayerDOM.volume
}

const skipTrack = val => {
    const skipBtnDOM = document.querySelector(`.ytp-${val === 0 ? 'prev' : 'next'}-button`)
    if (skipBtnDOM)
        skipBtnDOM.click()
}

const playVideoId = id => {
    const videoIdAnchor = document.querySelector(`a[href='${id}']`)
    if (videoIdAnchor)
        videoIdAnchor.click()
}

const getAutoplayTracks = () => {
    let autoPlayDom = document.querySelectorAll('span.ytd-compact-video-renderer')
    return Array.from(autoPlayDom).map(d => {
        const href = d.closest('a.ytd-compact-video-renderer').getAttribute('href')
        return {
            title: d.innerText,
            link: href,
            id: href.split('?')[1].replace('v=', '')
        }
    })
}