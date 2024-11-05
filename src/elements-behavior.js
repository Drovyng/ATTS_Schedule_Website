const horScrolls = document.getElementsByClassName("hor-scroll")

function scroll(e) {
    if (!e.shiftKey){
        e.currentTarget.scrollBy(e.deltaY, 0); // Enable scrolling by not holding shift
        e.preventDefault();
    }
}

for (let i = 0; i < horScrolls.length; i++) {
    horScrolls[i].addEventListener("wheel", scroll);
}
