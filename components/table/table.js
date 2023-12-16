// table.js
let req_data
window.addEventListener('message', function(event) {
    const data = event.data
    if(data.action === 'setKeywordTableData'){
        req_data = data.data
        console.log('setKeywordTableData', req_data)

            // console.log('DOMContentLoaded')
            keyWordsTable(req_data)

    }
})


const makeKeywordTable = (resultsArr) => {
    const table = document.getElementById('related-words-table');
    // table.id = 'related-words-table';

    const tableHeader = document.createElement('tr');
    const headers = ['Keyword', 'Volume', 'Competition'];
    
    for (let i = 0; i < headers.length; i++) {
        const header = document.createElement('th');
        header.innerText = headers[i];
        tableHeader.appendChild(header);
    }
    
    table.appendChild(tableHeader);

    const row_num = Math.min(20, resultsArr.length);
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

            console.log('Related words:', results);
        } else {
            console.log('Missing info in api response in keywordsTable', api_response);
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
};
