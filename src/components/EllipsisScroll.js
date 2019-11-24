import React, { useState, useRef, useEffect } from "react"

function EllipsisScroll(props) {
  const itemContainerRef = useRef()
  const itemRef = useRef()

  let mouseEnterTimeout = null

  const [itemScrollStyle, setItemScrollStyle] = useState({})
  const speed = 160

  const handleMouseOver = () => {
    let textWidth = itemRef.current.offsetWidth
    let length = textWidth - 180
    let time = length / speed
    setItemScrollStyle({ time: Math.abs(time), left: -Math.abs(length) })
  }

  const handleMouseOut = () => {
    clearTimeout(mouseEnterTimeout)
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
        // style={{
        //   left: `${itemScrollStyle.left || 0}px`,
        //   transition: `left ${hasTransition ? 1.2 : 0.2}s linear ${
        //     hasTransition ? "600ms" : "200ms"
        //   }`
        // }}
        style={{
          left: `${itemScrollStyle.left || 0}px`,
          transition: `left ${hasTransition ? 1.2 : 0.2}s linear ${
            hasTransition ? "600ms" : "200ms"
          }`
        }}
      >
        {text}
      </span>
    </div>
  )
}

export default EllipsisScroll
