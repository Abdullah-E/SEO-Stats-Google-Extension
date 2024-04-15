console.log("Popup.js loaded")
import LanguageManager from './scripts/LanguageManager.js'
const languageManager = new LanguageManager()
const kalimat_web_url = "https://kalimat-web-deployed.vercel.app/"

//buttons: [id, key]
const ids_keys = [['global-toggle', 'global_enable'],['chart-toggle', 'chart_enable'], ['word-list-toggle', 'word_list_enable'], ['arabic-toggle', 'arabic_enable']]

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
    console.log("Toggle switch: ", toggleSwitch)
    toggleSwitch.checked = state[key]

    toggleSwitch.addEventListener('click', function () {
        console.log("clicked", key)
        state[key] = !state[key]
        chrome.storage.sync.set({ 'all_states': state })
        toggleSwitch.checked = state[key]
        console.log("State of",key,": ", state[key])
        if(id == 'arabic-toggle'){
            handleLanguageToggleText(state)
        }
    })
    console.log("event listeners: ", toggleSwitch)
    

}

const handleLanguageToggleText = (state) => {
    // const toggleSwitch = document.getElementById('arabic-toggle')
    // console.log("toggleSwitch: ", toggleSwitch)
    if(state.arabic_enable){
        console.log("arabic")
        setLanguage('ar')
        // toggleSwitch.textContent = languageManager.getLocalizedString('Arabic')
    }
    else{  
        console.log("english")
        setLanguage('en')
        
        // toggleSwitch.textContent = languageManager.getLocalizedString('English')
    }
    
}

const showLoginButton = () => {
    // Create and append a login button
    const loginButton = document.createElement('button')
    loginButton.textContent = 'Login';
    loginButton.addEventListener('click', () => {
        // Handle login action here
        // For example, you might open a new tab for login
        chrome.tabs.create({ url: kalimat_web_url })
    });

    // Append the login button to the popup HTML
    document.body.appendChild(loginButton);
}

const showLogoutButton = () => {
    const logoutButton = document.createElement('button')
    logoutButton.textContent = 'Logout';
    logoutButton.addEventListener('click', () => {
        chrome.cookies.remove({ url: kalimat_web_url, name: 'user' }, (cookie) => {
            console.log("Removed user cookie: ", cookie)
        })
    })
    document.body.appendChild(logoutButton);
}

const showLoggedInUI = () => {
    fetch('popup.html')
    .then(response => response.text())
    .then(data => {
        document.body.innerHTML = data
        chrome.storage.sync.get(['all_states'], (result) =>{
            console.log("Retrieved extension state: ", result)
            const curr_state = result.all_states ? result.all_states : temp_state
    
            for (let [id, key] of ids_keys) {
                handleToggleSwitch(curr_state, id, key)
            }
            handleLanguageToggleText(curr_state)
        })
    })
}

const showLoggedOutUI = () => {
    fetch('frontend/popup/logged_out_popup.html')
    .then(response => response.text())
    .then(data => {
        document.body.innerHTML = data
    })
    .then( e => {
        const svgButton = document.getElementById('svg-button')
        svgButton.addEventListener('click', ()=>{
            chrome.tabs.create({ url: kalimat_web_url })
        })
    })
    
}


const temp_state = {
    global_enable: true,
    chart_enable: true,
    word_list_enable: true,
    stats_enable: true,
    arabic_enable: true
}

document.addEventListener('DOMContentLoaded', () => {
    console.log("Popup.js loaded")
    chrome.storage.sync.get(['auth_state'], (result) => {
        console.log("Retrieved auth state: ", result)
        const auth_state = result.auth_state ? result.auth_state : { logged_in: false }
        
        if( auth_state.logged_in ){
            console.log("User is logged in")
            // showLogoutButton()
            showLoggedInUI()
        }else{
            console.log("User is not logged in")
            showLoggedOutUI()
        }
    })

    //tooggle switch css ids and respective keys in state
    // const ids_keys = [['global-toggle', 'global_enable'],['chart-toggle', 'chart_enable'], ['word-list-toggle', 'word_list_enable'], ['arabic-toggle', 'arabic_enable']]

    chrome.storage.sync.get(['all_states'], (result) =>{
        console.log("Retrieved extension state: ", result)
        const curr_state = result.all_states ? result.all_states : temp_state

        for (let [id, key] of ids_keys) {
            handleToggleSwitch(curr_state, id, key)
        }
        handleLanguageToggleText(curr_state)
    })
})