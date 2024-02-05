console.log("Popup.js loaded")
import LanguageManager from './scripts/LanguageManager.js'
const languageManager = new LanguageManager()
const setLanguage = (languageCode) => {
    const prev_lang = languageManager.currentLanguage
    languageManager.setLanguage(languageCode)

    const langElements = document.querySelectorAll('.lang-text')
    langElements.forEach(element => {
        const text = element.textContent.trim()
        const translated = languageManager.getLocalizedString(text, prev_lang)
        if(translated){
            element.textContent = translated
        }

    })
    
    languageManager.changeCSSFile('popup', languageCode)

    const HTML = document.getElementsByTagName('html')[0]
    
    const css = languageManager.getLocalizedCSS()
    if(HTML){
        if(css['lang']) HTML.lang = css['lang']
        if(css['dir'])HTML.dir = css['dir']
    }
    
    /*
    const langCSSElements = document.querySelectorAll('.lang-text')
    
    langCSSElements.forEach(element => {

        languageManager.applyLocalizedCSS(element)
        console.log("element: ", element)
    })
        */

}

const onClickButton = (state) => {

    let isOn = state.global_enable
    const toggleSwitch = document.getElementById('global-toggle')
    console.log("rn: ", isOn)
    toggleSwitch.checked = isOn
    toggleSwitch.addEventListener('click', function () {
        isOn = !isOn
        state.global_enable = isOn
        chrome.storage.sync.set({ 'all_states': state })
        // toggleButton.textContent = isOn ? 'Extension is On' : 'Extension is Off'
        toggleSwitch.checked = isOn
        console.log("Extension is now: ", isOn)
    })

}

const handleToggleSwitch = (state, id, key) =>{
    const toggleSwitch = document.getElementById(id)
    if(!toggleSwitch){
        console.log("Toggle switch not found", id, key)
        return
    }
    toggleSwitch.checked = state[key]

    toggleSwitch.addEventListener('click', function () {
        state[key] = !state[key]
        chrome.storage.sync.set({ 'all_states': state })
        toggleSwitch.checked = state[key]
        console.log("State of",key,": ", state[key])
        if(id == 'arabic-toggle'){
            handleLanguageToggleText(state)
        }
    })


}

const handleLanguageToggleText = (state) => {
    // const toggleSwitch = document.getElementById('arabic-toggle')
    // console.log("toggleSwitch: ", toggleSwitch)
    if(state.arabic_enable){
        // console.log("arabic")
        setLanguage('ar')
        // toggleSwitch.textContent = languageManager.getLocalizedString('Arabic')
    }
    else{  
        // console.log("english")
        setLanguage('en')
        
        // toggleSwitch.textContent = languageManager.getLocalizedString('English')
    }
    
}
/*
const getState = () => {
    chrome.runtime.sendMessage({
        type: "REQ_STATE"
    })

    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        console.log("Message received: ", message)
        switch (message.type) {
            case "RES_STATE":
                console.log("Receieved state ", message.extensionState)
                return message.extensionState
            default:
                break
        }
    })

}
*/
// document.addEventListener("DOMContentLoaded", () => {});

const temp_state = {
    global_enable: true,
    chart_enable: true,
    word_list_enable: true,
    stats_enable: true,
    arabic_enable: true
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup.js loaded")
    // setLanguage('ar')
    //tooggle switch css ids and respective keys in state
    const ids_keys = [['global-toggle', 'global_enable'],['chart-toggle', 'chart_enable'], ['word-list-toggle', 'word_list_enable'], ['arabic-toggle', 'arabic_enable']]

    chrome.storage.sync.get(['all_states'], (result) =>{
        console.log("Retrieved extension state: ", result)
        const curr_state = result.all_states ? result.all_states : temp_state

        for (let [id, key] of ids_keys) {
            handleToggleSwitch(curr_state, id, key)
        }
        handleLanguageToggleText(curr_state)
    })

    
})
