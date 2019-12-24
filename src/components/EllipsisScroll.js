import React, { useState, useRef } from "react"

function EllipsisScroll(props) {
  const itemContainerRef = useRef()
  const itemRef = useRef()

  const [itemScrollStyle, setItemScrollStyle] = useState({})

  const handleMouseOver = () => {
    let textWidth = itemRef.current.offsetWidth
    if (textWidth > 179) {
      let length = textWidth - 180
      let time = length / 160
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
    <div
      className={`scroll-item ${classNames && classNames}`}
      ref={itemContainerRef}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      onClick={() => onClick && onClick()}
      style={{
        textOverflow: hasTransition > 0 ? "initial" : "ellipsis"
      }}
    >
      <span
        className="scroll-item-span"
        ref={itemRef}
        style={{
          left: `${itemScrollStyle.left || 0}px`,
          transition: `left ${
            hasTransition ? itemScrollStyle.time : 0.2
          }s linear`
        }}
      >
        {text}
      </span>
    </div>
  )
}

export default EllipsisScroll
