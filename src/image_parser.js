let image = null;
let canvas = document.createElement("canvas");
let ctx = canvas.getContext("2d");
let canvasSelect = document.createElement("canvas");
let ctxSelect = canvasSelect.getContext("2d");
ctxSelect.fillStyle = "white";
let selectStart = [0, 0];
let selectEnd = [0, 0];
let selection = false;
let scale = 1;
const SC = document.getElementById("schedule-container");
let onResult = () => {};
export function parse(file, onresult) {
    onResult = onresult;
    var reader = new FileReader();

    reader.onload = function(e) {
        var _image = new Image();
        _image.onload = function () {
            image = _image;
            canvas.width = image.width;
            canvas.height = image.height;
            canvas.style.aspectRatio = canvas.width / canvas.height + "";
            SC.insertAdjacentHTML("beforeend", `<div style="display: block">
<div style="display: inline-block">
  <input type="range" id="bright" name="bright" value="100" min="0" max="200" step="1" />
</div><div style="display: inline-block">
  <input type="checkbox" id="check" name="check"/>
</div><div style="display: inline-block">
  <input type="range" id="contrast" name="contrast" value="100" min="0" max="200" step="1" />
</div></div>`)
            document.getElementById("bright").onchange = changeFilters;
            document.getElementById("check").onchange = changeFilters;
            document.getElementById("contrast").onchange = changeFilters;
            SC.appendChild(canvasSelect);
            SC.appendChild(canvas);
            scale = canvas.width / canvas.getBoundingClientRect().width;
            draw();
        };
        _image.src = e.target.result;
    }
    reader.readAsDataURL(file);
}
function changeFilters(){
    let b = "brightness("+document.getElementById("bright").value + "%)";
    let c = "contrast("+document.getElementById("contrast").value + "%)";
    ctx.filter = document.getElementById("check").value ? b + " " + c : c + " " + b;
    ctxSelect.filter = ctx.filter;
    draw();
}
canvasSelect.style.maxHeight = "200px";
canvasSelect.style.width = "95%";
canvasSelect.style.height = "auto";
canvasSelect.style.aspectRatio = (16/9)+"";

canvas.style.width = "95%";
canvas.style.margin = "0 2.5%";
canvas.style.height = "auto";
canvas.onmousedown = (event) => {
    event.preventDefault();
    selectStart[0] = event.offsetX * scale;
    selectStart[1] = event.offsetY * scale;
    selectEnd[0] = event.offsetX * scale;
    selectEnd[1] = event.offsetY * scale;
    selection = true;
    draw();
}
canvas.onmousemove = (event) => {
    event.preventDefault();
    if (!selection) return;
    selectEnd[0] = event.offsetX * scale;
    selectEnd[1] = event.offsetY * scale;
    draw();
}
canvas.onmouseup = (event) => {
    event.preventDefault();
    selectEnd[0] = event.offsetX * scale;
    selectEnd[1] = event.offsetY * scale;
    selection = false;
    draw();
    imageProcess();
}
function draw() {
    ctx.drawImage(image, 0, 0);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    let x = selectStart[0];
    let y = selectStart[1];
    let w = selectEnd[0]-selectStart[0];
    let h = selectEnd[1]-selectStart[1];
    if (w < 0){
        x += w;
        w *= -1;
    }
    if (h < 0){
        y += h;
        h *= -1;
    }
    w = Math.max(w, 5);
    h = Math.max(h, 5);
    let scale = Math.min(320 / w, 180 / h);
    ctxSelect.fillRect(0, 0, 320, 180);
    ctxSelect.putImageData(ctx.getImageData(x, y, w, h), 0, 0, 0, 0, w, h);
    ctxSelect.scale(scale, scale);
    ctxSelect.drawImage(canvasSelect, 0, 0);
    ctxSelect.setTransform(1, 0, 0, 1, 0, 0);
    ctx.strokeRect(x, y, w, h);
}
async function imageProcess(){
    const blob = await new Promise(resolve => canvasSelect.toBlob(resolve, 'image/jpeg', 1));
    const result = await Tesseract.recognize(blob, "rus");
    const text = result?.data?.text;
    console.log(text);
}