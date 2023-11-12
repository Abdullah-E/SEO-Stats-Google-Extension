const onClickButton = (state) => {

    let isOn = state.global_enable
    const toggleButton = document.getElementById('toggleButton')
    console.log("rn: ", isOn)
    toggleButton.textContent = isOn ? 'Extension is On' : 'Extension is Off'
    toggleButton.addEventListener('click', function () {
        isOn = !isOn
        state.global_enable = isOn
        chrome.storage.sync.set({ 'all_states': state })
        toggleButton.textContent = isOn ? 'Extension is On' : 'Extension is Off'

        console.log("Extension is now: ", isOn)
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
    chrome.storage.sync.get(['all_states'], (result) =>{
        console.log("Retrieved extension state: ", result)
        const curr_state = result.all_states ? result.all_states : temp_state
        onClickButton(curr_state)
    })

    
})
