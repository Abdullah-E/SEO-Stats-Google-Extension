
const onClickOnButton = () => {

    const toggleButton = document.getElementById('toggleButton');
    let isOn = false;

    toggleButton.addEventListener('click', function () {
        if (isOn) {
            toggleButton.textContent = 'Extension is On';
            // Add your code to turn off your browser extension functionality here.
        } else {
            toggleButton.textContent = 'Extension is Off';
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
