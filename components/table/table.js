// table.js
let req_data
import LanguageManager from "../../scripts/LanguageManager.js";
const languageManager = new LanguageManager();
const setPageLanguage = (languageCode) => {
    const prev_lang = languageManager.currentLanguage;
    // console.log("prev_lang: ", prev_lang)
    languageManager.setLanguage(languageCode);
    const langElements = document.querySelectorAll('.lang-text');
    langElements.forEach(element => {
        const text = element.textContent.trim().toLocaleLowerCase();
        console.log("text: ", text);
        const translated = languageManager.getLocalizedString(text, prev_lang);
        console.log("translated: ", translated)
        if (translated) {
            element.textContent = translated;
        }
    });

    languageManager.changeCSSFile('table', languageCode)

    const HTML = document.getElementsByTagName('html')[0]
    const css = languageManager.getLocalizedCSS();
    
    if (HTML) {
        if (css['lang'])
            HTML.lang = css['lang'];
        if (css['dir'])
            HTML.dir = css['dir'];
    }
    
    
}



const makeKeywordTable = (resultsArr) => {
    const table = document.getElementById('related-words-table')
    // table.id = 'related-words-table';


    const row_num = Math.min(20, resultsArr.length)
    for (let i = 0; i < row_num; i++) {
        const row = document.createElement('tr');
        const elemKeys = ['keyword', 'search_volume', 'competition'];

        for (let j = 0; j < elemKeys.length; j++) {
            const elem = document.createElement('td');
            elem.innerText = resultsArr[i][elemKeys[j]];
            row.appendChild(elem);
        }

        table.appendChild(row);
    }

    return table;
};

const keyWordsTable = async (api_response) => {
    try {
        if (api_response?.tasks?.[0]?.result) {
            const results = api_response.tasks[0].result;
            const keywordsTable = makeKeywordTable(results);

            const tableContainer = document.getElementById('table-container');
            tableContainer.appendChild(keywordsTable);

            // console.log('Related words:', results);
        } else {
            console.log('Missing info in api response in keywordsTable', api_response);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};


window.addEventListener('message', function(event) {
    const data = event.data
    if(data.action === 'setKeywordTableData'){
        req_data = data.data
        console.log('setKeywordTableData', req_data)

            // console.log('DOMContentLoaded')
        keyWordsTable(req_data)
        chrome.storage.sync.get(['all_states'], function(result) {
            // console.log("result: ", result)
            const state = result.all_states
            const lang = state.arabic_enable ? 'ar' : 'en'
            setPageLanguage(lang)
        })

    }
})


chrome.storage.sync.onChanged.addListener(function(changes, namespace) {
    for (var key in changes) {
        var storageChange = changes[key];

        if(key == 'all_states'){
            const state = storageChange.newValue
            const lang = state.arabic_enable ? 'ar' : 'en'
            setPageLanguage(lang)
        }
    }

})