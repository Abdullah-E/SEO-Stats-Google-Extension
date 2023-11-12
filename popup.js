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
        console.log("Extension is now: ", state[key])
    })


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
    stats_enable: true
}

document.addEventListener('DOMContentLoaded', () => {
    const ids_keys = [['chart-toggle', 'chart_enable'], ['word-list-toggle', 'word_list_enable']]

    chrome.storage.sync.get(['all_states'], (result) =>{
        console.log("Retrieved extension state: ", result)
        const curr_state = result.all_states ? result.all_states : temp_state
        for (let [id, key] of ids_keys) {
            handleToggleSwitch(curr_state, id, key)
        }
    })

    
})
