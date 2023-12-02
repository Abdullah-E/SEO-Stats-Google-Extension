console.log("background.js loaded")

let extensionState = {
  global_enable: true,
  chart_enable: true,
  word_list_enable: true,
  stats_enable: true,
  arabic_enable: true

}
chrome.storage.sync.set({'all_states': extensionState}).then(() => {
  console.log("Saved state: ", extensionState)
})

chrome.storage.onChanged.addListener((changes, namespace) => {
  console.log("Storage changed: ", changes)
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if(key == "all_states"){
      console.log("All states changed")
      extensionState = Object.assign(extensionState, newValue)
    }
    console.log(
      `Storage key "${key}" in namespace "${namespace}" changed.`,
      `Old value was "${oldValue}", new value is "${newValue}".`) 
  }
})

chrome.tabs.onUpdated.addListener((tabId, tab) => {
  let enableExtension = extensionState.global_enable
  console.log("Tab updated: ", enableExtension)
  if(!enableExtension){
    return
  }
  if (tab.url && tab.url.includes("google.com/search")) {
    console.log("We in here")
    // const queryParameters = tab.url.split("?")[1]
    // const urlParameters = new URLSearchParams(queryParameters)
    const searchWord = getSearchWord(tab.url, "q")

    console.log("Search word: ",searchWord)

    chrome.tabs.sendMessage(tabId, {
      type: "GOOGLE_SEARCH",
      searchWord: searchWord,
      extensionState: extensionState
    })
  }
  if(tab.url && tab.url.includes("https://www.amazon.com/s")){
    const searchWord = getSearchWord(tab.url, "k")
    console.log("Search word: ",searchWord)
    chrome.tabs.sendMessage(tabId, {
      type: "AMAZON_SEARCH",
      searchWord: searchWord,
      extensionState: extensionState
    })
  }

})

const getSearchWord = (url, key) => {
  const queryParameters = url.split("?")[1]
  const urlParameters = new URLSearchParams(queryParameters)
  const searchWord = urlParameters.get(key)
  return searchWord
}
