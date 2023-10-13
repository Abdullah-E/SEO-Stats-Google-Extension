(() => {
    console.log("contentScript.js loaded");
    let searchQuery, TextBox;
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Listnere")
        const { type, searchWord } = request;

        if (type === "NEW") {
            searchQuery = searchWord;
            console.log(searchWord);
            document.addEventListener('DOMContentLoaded', function () {
                getTextBox();
            })
        }
    });

    const getTextBox = () => {

        TextBox = document.getElementById("#result-stats");
        
        if(TextBox){
            console.log("Found TextBox");
            
        }else{
            console.log("TextBox not found");
        }
        // console.log("result-stats",TextBox.innerText);
    };

})();
//https://huggingface.co/af1tang/personaGPT?text=Hey+my+name+is+Julien%21+How+are+you%3F