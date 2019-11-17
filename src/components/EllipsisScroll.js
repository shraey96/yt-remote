import React, { useState, useRef, useEffect } from "react"

function EllipsisScroll(props) {
  const itemContainerRef = useRef()
  const itemRef = useRef()

  let textWidth = 0
  let mouseEnterTimeout = null

  const [itemScrollStyle, setItemScrollStyle] = useState({})
  const speed = 160

  useEffect(() => {
    textWidth = itemRef.current.offsetWidth
  }, [])

  const handleMouseOver = () => {
    console.log(textWidth)
    // if (textWidth > 170) {
    //   let length = textWidth - 180
    //   let time = length / speed
    //   setItemScrollStyle({ time: Math.abs(time), left: -Math.abs(length) })
    // }
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
        style={{
          left: `${itemScrollStyle.left || 0}px`,
          transition: `left ${hasTransition ? 2 : 0.2}s linear ${
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
