import React from 'react';

export const SearchBar = () => {
  return (
    <div className="search-bar">
      <input type="text" placeholder="Find your restaurant" />
      <button>Search</button>
    </div>
  );
};