console.log("background.js loaded");

// Listen for tab updates
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  if (tab.url && tab.url.includes("google.com/search")) {
    const queryParameters = tab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);
    const searchWord = urlParameters.get("q");
    console.log("Yoooo");
    console.log(searchWord);

    // Send the searchWord to the content script
    chrome.tabs.sendMessage(tabId, {
      type: "SEARCH_WORD",
      searchWord: searchWord,
    });
  }
});
