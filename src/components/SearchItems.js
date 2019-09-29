import React, { useState } from "react";

const SearchItems = () => {
  const [search, setSearchVal] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  let searchTimeout = null;

  function searchVideo() {
    if (searchTimeout) clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&key=AIzaSyAsH4766YGg_JEJZTIXWORBVzkn0BidVgE&type=video&q=${search}&order=relevance`;
      fetch(url)
        .then(res => res.json())
        .then(data => console.log(data));
    }, 300);
  }

  return (
    <>
      <span className="ui-icon back" onClick={() => props.toggleUI("player")}>
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
      <input
        type="text"
        value={search}
        autoFocus
        onChange={e => {
          setSearchVal(e.target.value);
          searchVideo();
        }}
      />
    </>
  );
};

export default SearchItems;
