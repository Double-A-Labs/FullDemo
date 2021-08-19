export const errorMsgElement = document.getElementById("errorMsg");

export const handleErrors = (location, error) => {
    let message = `${location} error: ${error.toString()}`;
    console.error(message);
    errorMsgElement.innerHTML = message;
}