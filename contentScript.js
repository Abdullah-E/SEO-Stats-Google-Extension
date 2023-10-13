(() => {
    console.log("contentScript.js loaded");
    let searchQuery, TextBox;
    
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        console.log("Listnere")
        const { type, searchWord } = request;

        if (type === "NEW") {
            searchQuery = searchWord;
            console.log(searchWord);
            getTextBox();

        }
    });

    const getTextBox = () => {

        document.addEventListener("DOMContentLoaded", function () {
            TextBox = document.getElementById("result-stats")
            if(TextBox){
                console.log("Found TextBox", TextBox.innerText);
                TextBox.innerText = "volume \n" + TextBox.innerText;
                
            }else{
                console.log("TextBox not found");
            }
        })
    };

})();
//https://huggingface.co/af1tang/personaGPT?text=Hey+my+name+is+Julien%21+How+are+you%3F