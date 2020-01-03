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
      <div className="search-view-container">
        <span
          className="ui-icon back search-items"
          onClick={() => props.toggleUI("player")}
        >
          <svg
            width="5"
            height="9"
            viewBox="0 0 5 9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M1.94123e-07 4.37743C1.94123e-07 4.58611 0.0806454 4.76082 0.237192 4.92097L3.88046 8.55588C4.0038 8.68691 4.1556 8.75 4.33586 8.75C4.70588 8.75 5 8.44911 5 8.07543C5 7.89102 4.92884 7.71631 4.79602 7.58042L1.57021 4.37743L4.79602 1.16958C4.9241 1.03369 5 0.863838 5 0.67457C5 0.300887 4.70588 0 4.33586 0C4.1556 0 4.0038 0.0679423 3.87571 0.194121L0.237192 3.83389C0.0759015 3.99889 1.94123e-07 4.16875 1.94123e-07 4.37743Z"
              fill="white"
            />
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
      </div>
      <div className="results-container">
        {searchResults.map(s => {
          return (
            <EllipsisScroll
              key={s.id.videoId}
              classNames="result-item"
              text={s.snippet.title
                .replace(/&amp;/g, "&")
                .replace("&#39;", "'")}
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
