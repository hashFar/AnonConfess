
function SearchBar({ search, setSearch, onSearch }) {
    return (
        <div className="search-container">
            <input
                type="text"
                id="searchInput"
                placeholder="Search confessions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
            />

            <button id="searchButton" onClick={onSearch}>
                Search
            </button>
        </div>
    );
}

export default SearchBar;
