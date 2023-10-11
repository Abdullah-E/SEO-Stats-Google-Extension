// adding a new bookmark row to the popup
const addNewBookmark = () => {};

const viewBookmarks = () => {};

const onPlay = e => {};

const onDelete = e => {};

const setBookmarkAttributes =  () => {};

const onClickOnButton = () => {

    const toggleButton = document.getElementById('toggleButton');
    let isOn = false;

    toggleButton.addEventListener('click', function () {
        if (isOn) {
            toggleButton.textContent = 'Toggle On';
            // Add your code to turn off your browser extension functionality here.
        } else {
            toggleButton.textContent = 'Toggle Off';
            // Add your code to turn on your browser extension functionality here.
        }

        isOn = !isOn;
    });

};

document.addEventListener("DOMContentLoaded", () => {});

document.addEventListener('DOMContentLoaded', function () {
    onClickOnButton();
}
    
);
