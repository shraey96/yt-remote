import React, { useState, useRef } from "react"

function Toggle(props) {
  const itemContainerRef = useRef()
  const itemRef = useRef()

  const [itemScrollStyle, setItemScrollStyle] = useState({})

  const handleMouseOver = () => {
    let textWidth = itemRef.current.offsetWidth
    if (textWidth > 179) {
      let length = textWidth - 180
      let time = length / 120
      console.log(
        4545,
        `textWidth: ${textWidth}, length: ${length}, time: ${time}, containerWidth: ${itemContainerRef.current.offsetWidth}`
      )
      setItemScrollStyle({ time: Math.abs(time), left: -Math.abs(length) })
    }
  }

  const handleMouseOut = () => {
    setItemScrollStyle({})
  }

  const { text, classNames, onClick } = props
  const hasTransition = Object.keys(itemScrollStyle).length > 0

  return (
    <div class="toggle-checkbox">
      <input type="checkbox" id="switch" />
      <label for="switch">Toggle</label>
    </div>
  )
}

export default Toggle
