import React, { useState, useRef } from "react"

function EllipsisScroll(props) {
  const itemContainerRef = useRef()
  const itemRef = useRef()

  const [itemScrollStyle, setItemScrollStyle] = useState({})

  const handleMouseOver = () => {
    let textWidth = itemRef.current.offsetWidth
    let length = textWidth - 180
    console.log(9999, length)
    let time = length / 160
    console.log(
      555,
      length,
      textWidth,
      time,
      itemContainerRef.current.offsetWidth
    )
    setItemScrollStyle({ time: Math.abs(time), left: -Math.abs(length) })
  }

  const handleMouseOut = () => {
    setItemScrollStyle({})
  }

  const { text, classNames, onClick } = props
  const hasTransition = Object.keys(itemScrollStyle).length > 0
  console.log(444, itemScrollStyle)
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
