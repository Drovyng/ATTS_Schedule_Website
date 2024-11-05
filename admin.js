import {
    content,
    database,
    addDay,
    ScheduleContainer,
    redraw,
    Loading,
    Content,
    setSelectRole,
    reload2With,
    getDays
} from "/main.js";

const ListTools = ["Просмотр", "Редактор"];

let selectedGroup = content.selectedRoleType ? 0 : content.selectedRole;
let selectedTool = 0;
let days = [];

function selectGroup(_, id){
    let toRemove = document.getElementById("scroll-groups").getElementsByClassName("hs-selected");
    if (toRemove.length > 0) toRemove[0].classList.remove("hs-selected");
    document.getElementById("group-"+id).classList.add("hs-selected");
    selectedGroup = id;
    Loading.style.opacity = "100%";
    selectTool(selectedTool);
}
setSelectRole(selectGroup)
function selectTool(id){
    let toRemove = document.getElementById("scroll-tools").getElementsByClassName("hs-selected");
    if (toRemove.length > 0) toRemove[0].classList.remove("hs-selected");
    document.getElementById("tool-"+id).classList.add("hs-selected");
    selectedTool = id;

    switch (selectedTool) {
        case 0:
            reload2With(false, selectedGroup, false);
            return;
        case 1:
            reload2With(false, selectedGroup, true, false, () =>{
                days = getDays(false, selectedGroup, true)
                toolEditor();
                Loading.style.opacity = "0";
            });
            return;
    }
}
function buttonInfo(event){
    let ids = event.target.id.split("/");
    return {d: parseInt(ids[0]), p: parseInt(ids[1]), n: ids[2]};
}
function editText(event){
    let info = buttonInfo(event);
    if (info.n === "0"){
        days[info.d][info.p].pair = event.target.value;
        return;
    }
    days[info.d][info.p].cabinet = event.target.value;
}
function editSelect(event){
    let info = buttonInfo(event);
    if (info.n === "1"){
        days[info.d][info.p].teacher = parseInt(event.target.value);
        return;
    }
    if (info.n === "1-0"){
        days[info.d][info.p].teacher[0] = parseInt(event.target.value);
        return;
    }
    if (info.n === "1-1"){
        days[info.d][info.p].teacher[1] = parseInt(event.target.value);
    }
}
function btnPlus(event){
    let info = buttonInfo(event);
    days[info.d].splice(info.p+1, 0, {pair: "", teacher: -1, cabinet: ""});
    toolEditor();
}
function btnMinus(event){
    let info = buttonInfo(event);
    days[info.d].splice(info.p, 1);
    toolEditor();
}
function sendData(){
    Loading.style.opacity = "100%";

    let data = {};

    for (let i = 0; i < 6; i++) {
        let day = {c: days[i].length};
        for (let p = 0; p < days[i].length; p++) {
            let pair = days[i][p] !== null ? {
                p: days[i][p].pair,
                n: days[i][p].teacher,
                c: days[i][p].cabinet
            } : "null";
            day["p" + p] = pair;
        }
        data["d" + i] = day;
    }
    database.setData("week_cur/" + content.ListGroups[selectedGroup], data, () => {
        Loading.style.opacity = "0";
        document.getElementById("send-data").style.animation = "success 5s linear";
    }, () => {
        Loading.style.opacity = "0";
        document.getElementById("send-data").style.animation = "failed 5s linear";
    })
}
function btnTop(event){
    let info = buttonInfo(event);
    days[info.d][info.p] = info.n === "off" ? null : {pair: "", teacher: -1, cabinet: ""};
    toolEditor();
}
function btnBottom(event){
    let info = buttonInfo(event);
    days[info.d][info.p].teacher = (info.n === "single" ? days[info.d][info.p].teacher[0] : [days[info.d][info.p].teacher, -1]);
    toolEditor();
}
function toolEditor(){
    redraw(false, selectedGroup, true, days);
    let plus = document.getElementsByClassName("plus");
    for (let i = 0; i < plus.length; i++) {
        plus[i].onclick = btnPlus;
    }
    let minus = document.getElementsByClassName("minus");
    for (let i = 0; i < minus.length; i++) {
        minus[i].onclick = btnMinus;
    }
    let top = document.getElementsByClassName("word-top");
    for (let i = 0; i < top.length; i++) {
        top[i].onclick = btnTop;
    }
    let bottom = document.getElementsByClassName("word-bottom");
    for (let i = 0; i < bottom.length; i++) {
        bottom[i].onclick = btnBottom;
    }
    let text = document.getElementsByClassName("edit-text");
    for (let i = 0; i < text.length; i++) {
        text[i].oninput = editText;
    }
    let select = document.getElementsByClassName("edit-select");
    for (let i = 0; i < select.length; i++) {
        select[i].onchange = editSelect;
    }
    document.getElementById("send-data").onclick = sendData;
}

document.title = "[АДМИН] " + document.title;

const Scroller = document.getElementById("scroll-teachers");
Scroller.id = "scroll-tools";
Scroller.innerHTML = "";

for (let i = 0; i < ListTools.length; i++) {
    Scroller.innerHTML += "<button class='hsb-tool' id='tool-"+i+"'>"+ListTools[i]+"</button>";
}
{
    let wat2 = document.getElementsByClassName("hsb-tool");
    for (let i = 0; i < wat2.length; i++) {
        let l2 = i;
        wat2[l2].addEventListener("click", () => {
            selectTool(l2);
        });
    }
}
Scroller.parentElement.insertAdjacentHTML("afterend", "<p style='text-align: center'>При переходе между инструментами/группами данные не сохраняются!!!</p>")



selectGroup(null, selectedGroup);