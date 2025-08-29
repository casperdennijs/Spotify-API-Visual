const titleEl = document.querySelector("h1.title");
const titleInput = document.querySelector("form#title input");

titleInput.addEventListener("input", (event) => {
    titleEl.textContent = event.target.value;
})

var r = document.querySelector(':root');
var rs = getComputedStyle(r);
const customcolorInput = document.querySelector("input#customcolor");
const customimageInput = document.querySelector("input#customimage");

customcolorInput.addEventListener("input", (event) => {
    r.style.setProperty('--custom-color', `${event.target.value}`);
    console.log("Custom color loaded");
})

customimageInput.addEventListener("input", (event) => {
    r.style.setProperty('--custom-image', `url(${event.target.value})`);
    console.log("Custom image loaded");
})
