import React from "react"

function TabListItem(props) {
  const { videoTitle, videoThumbNail, index, onClick } = props

  return (
    <div
      className="tablist-item"
      // style={{ animationDelay: `${index * 0.4}s` }}
      onClick={() => onClick && onClick()}
    >
      <img src={videoThumbNail} alt="" />
      {/* <span>{videoTitle}</span> */}
    </div>
  )
}

export default TabListItem
