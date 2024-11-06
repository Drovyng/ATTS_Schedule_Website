import {
    content,
    addDay,
    ScheduleContainer,
    redraw,
    Loading,
    Content,
    setSelectRole,
    reload2With,
    getDays
} from "/ATTS_Schedule_Website/src/main.js";

const ListTools = ["Просмотр", "Редактор", "Управление Списками"];

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

    ScheduleContainer.style = null;

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
        case 2:
            let one = false;
            function waiting(){
                if (one){
                    toolTables();
                }
                one = true;
            }
            content.loadListGroups(waiting);
            content.loadListTeachers(waiting);
            return;
    }
}


function toolEditor(){
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
        content.database.setData("week_cur/" + content.ListGroups[selectedGroup], data, () => {
            Loading.style.opacity = "0";
            document.getElementById("send-data").style.animation = "success 5s linear";
        }, () => {
            Loading.style.opacity = "0";
            document.getElementById("send-data").style.animation = "failed 5s linear";
        })
    }
    function buttonInfo(event){
        let ids = event.target.id.split("/");
        return {d: parseInt(ids[0]), p: parseInt(ids[1]), n: ids[2]};
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

function toolTables(){
    function sendData(teachers){
        Loading.style.opacity = "100%";
        let b = teachers ? "b0" : "b1";
        content.database.setData(teachers ? "teachers" : "groups", teachers ? content.ListTeachers : content.ListGroups, () => {
            Loading.style.opacity = "0";
            document.getElementById(b).style.animation = "success 5s linear";
        }, () => {
            Loading.style.opacity = "0";
            document.getElementById(b).style.animation = "failed 5s linear";
        });
    }
    function btnMinus(event){
        let info = event.target.id.split("|");
        if (info[0] === "l0"){
            delete content.ListTeachers[info[1]];
        }
        else{
            delete content.ListGroups[info[1]];
        }
        toolTables();
    }
    function editSelect(event){
        let info = event.target.id.split("|");
        if (info[0] === "l0"){
            content.ListTeachers[info[1]] = event.target.value;
        }
        else{
            content.ListGroups[info[1]] = event.target.value;
        }
    }
    ScheduleContainer.style.display = "grid";
    ScheduleContainer.style.gridTemplateColumns = "1fr 1fr";
    let add1 = "";
    let k0 = "";
    for (let key in content.ListTeachers) {
        let id = "l0|"+key+"|";
        add1 += `<div id="${id+"0"}"><button class="minus" id="${id+"1"}"></button><textarea class="edit-select" id="${id+"2"}">${content.ListTeachers[key]}</textarea></div>`
        k0 = key;
    }
    add1 += `<button class="minus" id="a0">`
    let add2 = "";
    let k1 = "";
    for (let key in content.ListGroups) {
        let id = "l1|"+key+"|";
        add2 += `<div id="${id+"0"}"><button class="minus" id="${id+"1"}"></button><textarea class="edit-select" id="${id+"2"}">${content.ListTeachers[key]}</textarea></div>`
        k1 = key;
    }
    add2 += `<button class="minus" id="a1">`
    ScheduleContainer.innerHTML = `<button class='send-data' id="b0">Применить</button>
<button class='send-data' style="grid-column: 2" id="b1">Применить</button>
<div class="schedule-list" id="l0">
   ${add1}
</div>
<div class="schedule-list" id="l1">
   ${add2}
</div>
<button class='send-data' id="a0">Добавить</button>
<button class='send-data' style="grid-column: 2" id="a1">Добавить</button>`;
    document.getElementById("b0").onclick = () => sendData(true);
    document.getElementById("b1").onclick = () => sendData(false);
    document.getElementById("a0").onclick = () => {
        content.ListTeachers[`${parseInt(k0)+1}`] = "-новый преподаватель-";
        toolTables();
    };
    document.getElementById("a1").onclick = () => {
        content.ListTeachers[`${parseInt(k1)+1}`] = "-новая группа-";
        toolTables();
    };
    let minus = document.getElementsByClassName("minus");
    for (let i = 0; i < minus.length; i++) {
        minus[i].onclick = btnMinus;
    }
    let select = document.getElementsByClassName("edit-select");
    for (let i = 0; i < select.length; i++) {
        select[i].onchange = editSelect;
    }
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