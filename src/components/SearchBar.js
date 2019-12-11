import React from "react";

export default function SearchBar() {
  return (
    <div class="srch_bar">
      <div class="stylish-input-group">
        <input type="text" class="search-bar" placeholder="Search" />
        <span class="input-group-addon">
          <button type="button">
            <i class="fa fa-search" aria-hidden="true"></i>
          </button>
        </span>
      </div>
    </div>
  );
}
