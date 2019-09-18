/*global chrome*/

import React from 'react';

function secondsToHms(d) {
    d = Number(d);
    var h = Math.floor(d / 3600);
    var m = Math.floor(d % 3600 / 60);
    var s = Math.floor(d % 3600 % 60);
    var hDisplay = h > 0 ? h : 0;
    var mDisplay = m > 0 ? m : 0;
    var sDisplay = s > 0 ? s : 0;
    return `${hDisplay}:${mDisplay}:${sDisplay}`
}

class Timer extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            currentTime: props.currentTime || 0
        }
        this.timeSeekInterval = null
    }

    componentDidMount() {
        if (this.props.isVideoPlaying)
            this.startSeekTimer()
    }

    componentDidUpdate(prevProps) {
        if (prevProps.isVideoPlaying !== this.props.isVideoPlaying) {
            if (this.props.isVideoPlaying) {
                this.startSeekTimer()
            } else {
                this.stopSeekTimer()
            }
        }
        if (prevProps.videoId !== this.props.videoId) {
            this.setState({
                currentTime: 0
            })
        }
    }

    componentWillUnmount() {
        this.stopSeekTimer()
    }

    startSeekTimer = () => {
        this.timeSeekInterval = setInterval(() => {
            this.setState({
                currentTime: this.state.currentTime + 1
            })
        }, 1000);
    }

    stopSeekTimer = () => {
        clearInterval(this.timeSeekInterval)
    }

    seekSong = val => {
        this.setState({
            currentTime: parseFloat(val, 10)
        }, () => {
            this.props.sendMessage({
                type: 'seekVideo',
                duration: this.state.currentTime
            })
        })
    }

    render() {
        const { currentTime } = this.state
        const { playDuration } = this.props

        return (
            <div className="timer-container">
                <span>{secondsToHms(currentTime)}</span>
                <input
                    type="range"
                    min="0"
                    max={playDuration}
                    value={currentTime}
                    step="0.1"
                    onChange={e => this.seekSong(e.target.value)}
                />
                <span>{secondsToHms(playDuration)}</span>
            </div>
        )
    }
}

export default Timer;
