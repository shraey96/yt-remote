import React, { useState } from "react";

const SearchItems = props => {
  const [search, setSearchVal] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  let searchTimeout = null;

  function searchVideo() {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyAsH4766YGg_JEJZTIXWORBVzkn0BidVgE&type=video&q=${search}&order=relevance&maxResults=25`;
    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.items.length > 0) {
          // setSearchResults([...searchResults, ...data.items])
          setSearchResults(data.items);
        }
        console.log(data);
      });
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
          onChange={e => {
            setSearchVal(e.target.value);
            if (e.target.value.length > 2) {
              if (searchTimeout !== null) clearTimeout(searchTimeout);
              searchTimeout = setTimeout(() => {
                searchVideo();
              }, 1000);
            }
          }}
        />
      </div>
      <div className="results-container">
        {searchResults.map(s => {
          return (
            <p
              key={s.id.videoId}
              className="result-item ellipsis"
              onClick={() =>
                props.sendMessage({
                  type: "playNewVideo",
                  videoId: s.id.videoId
                })
              }
            >
              {s.snippet.title}
            </p>
          );
        })}
      </div>
    </>
  );
};

export default SearchItems;
