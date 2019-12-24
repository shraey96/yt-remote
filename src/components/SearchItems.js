import React, { useState } from "react"

import EllipsisScroll from "./EllipsisScroll"

const SearchItems = props => {
  const [search, setSearchVal] = useState("")
  const apiKeys = [
    "AIzaSyC88bxeDCgQGOq-Jo2wS1qdzcUHndGRbNw",
    "AIzaSyDq5puPK5yCgfMrdD5JnZMnzIcSWi3kif4"
  ]
  // 'AIzaSyAsH4766YGg_JEJZTIXWORBVzkn0BidVgE'
  const [searchResults, setSearchResults] = useState([])
  const [searchTimeout, setSearchTimeout] = useState(null)

  function handleChange(val) {
    setSearchVal(val)
    if (val.length > 2) {
      clearTimeout(searchTimeout)
      setSearchTimeout(
        setTimeout(() => {
          const key = apiKeys[Math.floor(Math.random() * 2) + 1 - 1]
          const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=${key}&type=video&q=${search}&order=relevance&maxResults=25`
          fetch(url)
            .then(res => res.json())
            .then(data => {
              if (data.items.length > 0) {
                setSearchResults(data.items)
              }
            })
            .catch(err => clearTimeout(searchTimeout))
        }, 1200)
      )
    }
  }

  return (
    <>
      <span
        className="ui-icon back search-items"
        onClick={() => props.toggleUI("player")}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
        >
          <path d="M0 0h24v24H0z" fill="none" />
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </span>
      <div className="search-container">
        <input
          type="text"
          value={search}
          className="search-box"
          placeholder="Search ..."
          autoFocus
          onChange={e => handleChange(e.target.value)}
        />
      </div>
      <div className="results-container">
        {searchResults.map(s => {
          return (
            <EllipsisScroll
              key={s.id.videoId}
              classNames="result-item"
              text={s.snippet.title.replace(/&amp;/g, "&")}
              onClick={() =>
                props.sendMessage({
                  type: "playNewVideo",
                  videoId: s.id.videoId
                })
              }
            />
          )
        })}
      </div>
    </>
  )
}

export default SearchItems
