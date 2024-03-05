// apiUtils.js

const API_URL = 'http://localhost:8000';
export const sendProfileToServer = (profileObj) => {
    const endpoint = API_URL + '/login'; // Replace this with your actual server API endpoint

    return fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileObj),
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to send profile to server');
        }
        return response.json();
    })
    .catch(error => {
        console.error('Error sending profile to server:', error);
        throw error;
    });
};
