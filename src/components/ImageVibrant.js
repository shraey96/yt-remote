import React, { useState, useEffect } from "react"
import * as Vibrant from "node-vibrant"

function ImageVibrant({ videoThumbNail }) {
  const [pallete, setPallete] = useState(null)

  useEffect(() => {
    Vibrant.from(`https://cryptic-ravine-67258.herokuapp.com/` + videoThumbNail)
      .getPalette()
      .then(pallete => setPallete(pallete))
      .catch(err => setPallete(null))
  }, [videoThumbNail])

  let bgPallete =
    pallete || pallete !== null
      ? `linear-gradient(90deg, rgba(${pallete.DarkMuted.rgb.join()},0.4) 0%, rgba(${
          pallete.DarkVibrant.rgb
        },0.7) 100%)`
      : "transparent"

  return (
    <>
      <img className="video-thumbnail" src={videoThumbNail} alt="" />
      <div
        className="image-vibrant image-vibrant--color"
        style={{
          background: bgPallete
        }}
      />
      <div className="image-vibrant image-vibrant--filter" />
    </>
  )
}

export default ImageVibrant
