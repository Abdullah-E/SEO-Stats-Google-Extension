(() => {
    console.log("contentScript.js loaded");
    let searchQuery, TextBox;
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Listnere")
        const { type, searchWord , wordVolume} = request;

        if (type === "NEW") {
            searchQuery = searchWord;
            searchVolume = wordVolume;
            console.log(searchWord, wordVolume);
            getTextBox(wordVolume);

        }
    });

    const getTextBox = (volume) => {
        console.log("getTextBox", volume)
        document.addEventListener("DOMContentLoaded", function () {
            console.log("DOMContentLoaded")
            TextBox = document.getElementById("result-stats")
            if(TextBox){
                console.log("Found TextBox", TextBox.innerText);
                TextBox.innerText = "Volume: "  + volume + " " + TextBox.innerText;
                
            }else{
                console.log("TextBox not found");
            }
        })
    };

})();
//https://huggingface.co/af1tang/personaGPT?text=Hey+my+name+is+Julien%21+How+are+you%3F