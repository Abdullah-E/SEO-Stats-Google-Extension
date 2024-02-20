console.log("background.js loaded")
const domain_name = "kalimat-web-deployed.vercel.app"
const kalimat_web_url = `https://${domain_name}/`


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

const authState = {
  logged_in: false

}
chrome.storage.sync.set({'auth_state': authState}).then(() => {
  console.log("Saved auth state: ", authState)
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

const userCookieChanged = (cookie) => {
  if(!cookie){
    return
  }
  console.log("User cookie changed: ", cookie)
  
  const cookie_data = decodeURIComponent(cookie.value)
  if(cookie_data){
    const user = JSON.parse(cookie_data)
    console.log("User: ", user)
    authState.logged_in = true
    chrome.storage.sync.set({'auth_state': authState}).then(() => {
      console.log("Saved auth state: ", authState)
    })
  }else{
    authState.logged_in = false
    chrome.storage.sync.set({'auth_state': authState}).then(() => {
      console.log("Saved auth state: ", authState)
    })
  }
}

chrome.cookies.onChanged.addListener((changeInfo) => {
  // console.log("Cookie changed: ", changeInfo)
  if(changeInfo.cookie.domain == domain_name){
    console.log("Cookie changed in kalimat web")
    userCookieChanged(changeInfo.cookie)
  }
})

//this function runs when a new tab is opened:
chrome.tabs.onUpdated.addListener((tabId, tab) => {
  let enableExtension = extensionState.global_enable
  //---------------LOGIN HANDLINGL:::::
  if(tab.url && tab.url.includes(kalimat_web_url)){
    console.log("We in new tab web")
    chrome.cookies.get({url: kalimat_web_url, name:'user'}, (cookie) => {
      console.log("Cookie: ", cookie)
      userCookieChanged(cookie)
      // const cookie_data = decodeURIComponent(cookie.value)
      // console.log("Cookies data: ", cookie_data)

      // if(cookie_data){
      //   const user = JSON.parse(cookie_data)
      //   console.log("User: ", user)
      //   authState.logged_in = true
      //   chrome.storage.sync.set({'auth_state': authState}).then(() => {
      //     console.log("Saved auth state: ", authState)
      //   })
      // }else{
      //   authState.logged_in = false
      //   chrome.storage.sync.set({'auth_state': authState}).then(() => {
      //     console.log("Saved auth state: ", authState)
      //   })
      // }
    })
  }
  if(!enableExtension || !tab.url){
    return
  }
  if (tab.url.includes("google.com/search")) {
    console.log("We in here")
    // const queryParameters = tab.url.split("?")[1]
    // const urlParameters = new URLSearchParams(queryParameters)
    const searchWord = getSearchWord(tab.url, "q")

    console.log("Search word: ",searchWord)

    chrome.tabs.sendMessage(tabId, {
      type: "GOOGLE_SEARCH",
      searchWord: searchWord,
      extensionState: extensionState,
      authState: authState
    })
  }
  if(tab.url.includes("https://www.amazon.com/s") || tab.url.includes("https://www.amazon.sa")){
    const searchWord = getSearchWord(tab.url, "k")
    console.log("Search word: ",searchWord)
    chrome.tabs.sendMessage(tabId, {
      type: "AMAZON_SEARCH",
      searchWord: searchWord,
      extensionState: extensionState,
      authState: authState
    })
  }

})

const getSearchWord = (url, key) => {
  const queryParameters = url.split("?")[1]
  const urlParameters = new URLSearchParams(queryParameters)
  const searchWord = urlParameters.get(key)
  return searchWord
}
