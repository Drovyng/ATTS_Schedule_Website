import {addDay, ScheduleContainer, content} from "/ATTS_Schedule_Website/src/renderer.js"

const Content = document.getElementById("content")
const Loading = document.getElementById("loading")
function resize(){
    Content.style.zoom = "1";
    if (window.innerWidth < window.innerHeight || window.innerWidth < 550){
        Content.style.zoom = window.innerWidth / 580 + "";
    }
} window.onresize = resize; resize();
function adminTryPanel(){
    Loading.style.opacity = "100%";
    Loading.style.touchAction = "unset";
    Loading.style.pointerEvents = "unset";
    document.getElementById("loading-admin").style.display = "unset";
}
document.getElementById("toolbar-dev").onclick = adminTryPanel;
function adminResult(success){
    document.getElementById("loading-admin").style.display = "none";
    Loading.style.touchAction = "none";
    Loading.style.pointerEvents = "none";
    if (!success){
        document.getElementById("loading-title").innerText = "Ошибка!";
        return;
    }
    let lol = 0;
    function start(l = 1) {
        lol += l;
        if (lol < 2) return;
        content.setIsCurWeek(()=>{
            var excelscript = document.createElement("script");
            console.log(content.WeekCur)
            excelscript.onload = () => {
                var admincss = document.createElement("link");
                admincss.href = "/ATTS_Schedule_Website/styles_admin.css";
                admincss.rel = "stylesheet";
                document.head.appendChild(admincss);
                var adminscript = document.createElement("script");
                adminscript.type = "module";
                adminscript.src = "/ATTS_Schedule_Website/src/admin.js";
                document.body.appendChild(adminscript);
            }
            excelscript.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
            document.body.appendChild(excelscript);
        });
    }
    function st(){ start(2)}
    content.database.getData("week_cur/date", (data1) => {
        let week = Math.floor((Date.now()-Date.parse('1/1/2024')) / content.weekDivide);
        if ((week + "") !== (data1 + "")){
            console.log(week + " !== " + data1)
            function replace(data){
                data["date"] = week;
                console.log(data)
                content.database.setData("week_cur", data, start, start);
                let empty = {};
                for (var emptyKey in content.ListGroups) {
                    empty[emptyKey] = {d0:{c:0},d1:{c:0},d2:{c:0},d3:{c:0},d4:{c:0},d5:{c:0}};
                }
                content.database.setData("week_next", empty, start, start);
            }
            content.database.getData("week_next", (data) => { replace(data) }, ()=>{replace({})});
        }
        else st();
    }, st);
}
function adminTry(){
    document.getElementById("toolbar-dev").onclick = null;
    selectRole = (_1, _2) => {};
    content.database.secret(document.getElementById("loading-admin-input").value, adminResult);
}
document.getElementById("loading-admin-button").onclick = adminTry;

function getDays(roleType = null, role = null, isDev = false){
    let days = [[], [], [], [], [], []];
    if (roleType){
        let week = content.WeekCur;
        for (let weekCurKey in week) {
            if (weekCurKey === "date") {
                continue;
            }
            let pairWeek = week[weekCurKey] ? week[weekCurKey] : {d0:{c:0},d1:{c:0},d2:{c:0},d3:{c:0},d4:{c:0},d5:{c:0}};
            for (let i = 0; i < 6; i++) {
                let day = pairWeek["d" + i];
                let count = day.c;
                for (let j = 0; j < count; j++) {
                    while (days[i].length < j) {
                        days[i].push(null);
                    }

                    let pair = day["p" + j];
                    if (pair === "null"){
                        continue;
                    }
                    if ((pair.n instanceof Array) ? (pair.n[0] !== role && pair.n[1] !== role) : pair.n !== role){
                        continue;
                    }
                    days[i][j] = {
                        pair: pair.p.replaceAll("\\n", "\n"),
                        teacher: weekCurKey,
                        cabinet: (pair.c+"").replaceAll("\\n", "\n")
                    };
                }
            }
        }
    }
    else {
        let week = content.WeekCur[content.ListGroups[role]] ? content.WeekCur[content.ListGroups[role]] : {d0:{c:0},d1:{c:0},d2:{c:0},d3:{c:0},d4:{c:0},d5:{c:0}};
        for (let i = 0; i < 6; i++) {
            let day = week["d" + i];
            let count = day.c;
            for (let j = 0; j < count; j++) {
                let pair = day["p" + j];
                if (pair === "null"){
                    days[i].push(null);
                    continue;
                }
                days[i].push({
                    pair: pair.p.replaceAll("\\n", "\n"),
                    teacher: (isDev ? pair.n : (pair.n instanceof Array) ? [
                        content.ListTeachers[pair.n[0]], content.ListTeachers[pair.n[1]]
                    ] : content.ListTeachers[pair.n]),
                    cabinet: (pair.c + "").replaceAll("\\n", "\n")
                });
            }
        }
    }
    return days
}

function redraw(roleType = null, role = null, isDev = false, days = null){
    if (role < 0){
        Loading.style.opacity = "0";
        return;
    }
    if (roleType === null) roleType = content.selectedRoleType;
    if (role === null) role = content.selectedRole;

    ScheduleContainer.innerHTML = "";

    if (days === null){
        days = getDays(roleType, role, isDev);
    }
    if (isDev){
        ScheduleContainer.innerHTML = "<button id='send-data'>Применить<input id='send-check' style='display: inline-block; width: 23px; height: 23px; margin-left: 12px; transform: translateY(2px);' type='checkbox'><p style='display: inline;font-size: 15px'>След.</p></button>";
    }
    for (let i = 0; i < 6; i++) {
        addDay(
            ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота"][i],
            days[i],
            isDev,
            i
        );
    }
    Loading.style.opacity = "0";
}


function reload(fully = false) {
    Loading.style.opacity = "100%";
    let loaded = 0;
    function add() {
        loaded += 1;
        if (loaded >= 2) {
            reloadScrolls();
            content.loadCookie();
            if (content.selectedRole !== -1) selectRole(content.selectedRoleType, content.selectedRole);
            reload2();
        }
    }
    if (fully) {
        content.loadListGroups(add);
        content.loadListTeachers(add);
    }
    else reload2();
}
function reload2(isDev = false){
    reload2With(content.selectedRoleType, content.selectedRole, isDev);
}
function reload2With(roleType, role, isDev = false, need_redraw = true, onLol = null){
    Loading.style.opacity = "100%";
    function complete(){
        if (need_redraw) redraw(roleType, role, isDev);
        if (onLol !== null) onLol();
    }
    if (role >= 0){
        if (roleType){
            content.loadGroups(complete);
        }
        else{
            content.loadGroup(content.ListGroups[role], complete);
        }
    }
    else {
        complete();
    }
}

let selectRole = (roleType, role) =>{
    document.getElementById("loading-admin").style.display = "none";
    let toRemove = document.getElementsByClassName("hs-selected");
    if (toRemove.length > 0) toRemove[0].classList.remove("hs-selected");
    if (roleType){
        document.getElementById("warning-text").innerHTML = "Пары видно <b>только</b> при <b>явном упоминании</b> вас в расписании!"
        document.getElementById("teacher-"+role).classList.add("hs-selected");
    }
    else {
        document.getElementById("warning-text").innerHTML = "";
        document.getElementById("group-"+role).classList.add("hs-selected");
    }
    content.selectRole(roleType, role);
    reload2();
}
function reloadScrolls(){
    const scrollGroups = document.getElementById("scroll-groups");
    scrollGroups.innerHTML = "";
    for (let i = 0; i < content.ListGroups.length; i++) {
        let grpname = content.ListGroups[i];
        if (/^[0-9-]*$/.test(grpname)){ grpname = grpname.substring(3); }
        scrollGroups.innerHTML += "<button class='hsb-group' id='group-"+i+"'>"+grpname+"</button>";
    }
    {
        let wat1 = document.getElementsByClassName("hsb-group");
        for (let i = 0; i < wat1.length; i++) {
            let l1 = i;
            wat1[l1].addEventListener("click", () => {
                selectRole(false, l1)
            });
        }
    }
    const scrollTeachers = document.getElementById("scroll-teachers");
    if (!scrollTeachers){
        return;
    }
    scrollTeachers.innerHTML = "";
    for (let i = 0; i < content.ListTeachers.length; i++) {
        scrollTeachers.innerHTML += "<button class='hsb-teacher' id='teacher-"+i+"'>"+content.ListTeachers[i]+"</button>";
    }
    {
        let wat2 = document.getElementsByClassName("hsb-teacher");
        for (let i = 0; i < wat2.length; i++) {
            let l2 = i;
            wat2[l2].addEventListener("click", () => {
                selectRole(true, l2)
            });
        }
    }
}

function setSelectRole(val){
    selectRole = val;
}
content.setIsCurWeek(()=>{
    reload(true);
})
export {
    content,
    addDay,
    ScheduleContainer,
    selectRole,
    redraw,
    Loading,
    Content,
    setSelectRole,
    reload2With,
    getDays
}