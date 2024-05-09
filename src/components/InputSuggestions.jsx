import React, { useState } from "react";

const Suggestions = ({ suggestions, onSelectSuggestion }) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);

  const handleSuggestionClick = (suggestion) => {
    onSelectSuggestion(suggestion);
    setFilteredSuggestions([]);
  };

  return (
    <ul>
      {filteredSuggestions.map((suggestion, index) => (
        <li key={index} onClick={() => handleSuggestionClick(suggestion)}>
          {suggestion}
        </li>
      ))}
    </ul>
  );
};

export default Suggestions;
