import React from "react"

function secondsToHms(d) {
  d = Number(d)
  var h = Math.floor(d / 3600)
  var m = Math.floor((d % 3600) / 60)
  var s = Math.floor((d % 3600) % 60)
  var hDisplay = h > 0 ? h : 0
  var mDisplay = m > 0 ? (m < 10 ? `0${m}` : m) : 0
  var sDisplay = s > 0 ? (s < 10 ? `0${s}` : s) : 0
  if (hDisplay === 0) return `${mDisplay}:${sDisplay}`
  return `${hDisplay}:${mDisplay}:${sDisplay}`
}

class Timer extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      videoCurrentTime: props.videoCurrentTime || 0
    }
    this.timeSeekInterval = null
    this.startVideoRepeat = false
  }

  componentDidMount() {
    if (this.props.isVideoPlaying) this.startSeekTimer()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.isVideoPlaying !== this.props.isVideoPlaying) {
      if (this.props.isVideoPlaying && this.props.videoDuration !== null) {
        this.startSeekTimer()
      } else {
        this.stopSeekTimer()
      }
    }
    if (prevProps.videoId !== this.props.videoId) {
      this.setState({
        videoCurrentTime: this.props.videoCurrentTime || 0
      })
    }
    if (
      secondsToHms(this.state.videoCurrentTime) ===
        secondsToHms(this.props.videoDuration) &&
      this.props.isRepeat &&
      prevProps.videoId === this.props.videoId
    ) {
      this.stopSeekTimer()

      // if (
      //   prevProps.isVideoBuffering !== this.props.isVideoBuffering &&
      //   !this.props.isVideoBuffering
      // ) {
      //   this.setState(
      //     {
      //       videoCurrentTime: this.props.videoCurrentTime || 0
      //     },
      //     () => this.startSeekTimer()
      //   )
      // }
    }
    if (prevProps.isVideoBuffering !== this.props.isVideoBuffering) {
      if (this.props.isVideoBuffering) {
        this.stopSeekTimer()
      } else {
        this.startSeekTimer()
      }
    }
    if (prevProps.videoId === this.props.videoId) {
      // if (this.props.isRepeat) {
      //   if (this.timeSeekInterval === null) {
      //     console.log("repeat starting...")
      //     console.log("videoRepeating.....")
      //     console.log(5555, this.props)
      //     this.startSeekTimer(this.props.videoCurrentTime || 0)
      //   }
      // }
    }
  }

  componentWillUnmount() {
    this.stopSeekTimer()
  }

  startSeekTimer = videoCurrentTime => {
    this.timeSeekInterval = setInterval(() => {
      this.setState({
        videoCurrentTime: (videoCurrentTime || this.state.videoCurrentTime) + 1
      })
    }, 1000)
  }

  stopSeekTimer = () => {
    clearInterval(this.timeSeekInterval)
    this.timeSeekInterval = null
  }

  seekSong = val => {
    this.setState(
      {
        videoCurrentTime: parseFloat(val, 10)
      },
      () => {
        this.props.sendMessage({
          type: "seekVideo",
          duration: this.state.videoCurrentTime
        })
      }
    )
  }

  render() {
    const { videoCurrentTime } = this.state
    const { videoDuration } = this.props

    return (
      <div className="timer-container">
        <span className="timer-number">{secondsToHms(videoCurrentTime)}</span>
        <input
          className="timer-slider"
          type="range"
          min="0"
          max={videoDuration}
          value={videoCurrentTime}
          step="0.1"
          onChange={e => this.seekSong(e.target.value)}
        />
        <span className="timer-number">{secondsToHms(videoDuration)}</span>
      </div>
    )
  }
}

export default Timer
