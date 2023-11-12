console.log("background.js loaded")

let extensionState = {
  global_enable: true,
  chart_enable: true,
  word_list_enable: true,
  stats_enable: true
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
  if (tab.url && tab.url.includes("google.com/search") && enableExtension) {
    console.log("We in here")
    const queryParameters = tab.url.split("?")[1]
    const urlParameters = new URLSearchParams(queryParameters)
    const searchWord = urlParameters.get("q")

    console.log("Search word: ",searchWord)

    chrome.tabs.sendMessage(tabId, {
      type: "SEARCH_WORD",
      searchWord: searchWord,
      extensionState: extensionState
    })
  }
})

/*
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received: ", message)
  switch (message.type) {
    case "REQ_STATE":
      console.log("Sending state: ", extensionState)
      chrome.runtime.sendMessage({
        type: "RES_STATE",
        extensionState: extensionState,
      })
      break
    default:
      break
  }

    
  // if(message.type == "EXTENSION_TOGGLE"){
  //   extensionState = message.extensionState;
  //   console.log("Extension is now: ", extensionState)
  // }

})

*/
/*
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received: ", message)
  if(message.type == "EXTENSION_TOGGLE"){
    enableExtension = message.enableExtension;
    console.log("Extension is now: ", enableExtension)
  }

})
*/