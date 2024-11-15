import * as database from "/ATTS_Schedule_Website/src/database.js"

let ListGroups = {}
let ListTeachers = {}
let WeekCur = {}
let WeekNext = {}

const weekDivide = 1000 * 60 * 60 * 24 * 7;
let WeekNubmer = Math.floor((Date.now()-Date.parse('1/1/2024')) / weekDivide);

let selectedRoleType = false
let selectedRole = -1
let isCurWeek = true;
function setIsCurWeek(next){
    database.getData("week_cur/date", (data) => {
        isCurWeek = (WeekNubmer + "") === (data + "");
        next();
    }, next);
}

function selectRole(roleType, role){
    selectedRoleType = roleType;
    selectedRole = role;
    saveCookie();
}
function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}
function saveCookie(){
    if (selectedRole >= 0) {
        document.cookie = "role=" + (selectedRoleType ? selectedRole : selectedRole) +
            ";max-age=7776000"
        document.cookie = "role-type=" + selectedRoleType +
            ";max-age=7776000"
    }
}
function loadCookie(){
    if (document.cookie.length < 17) return;
    selectedRoleType = getCookie("role-type") === "true";
    let role = getCookie("role")
    selectedRole = parseInt(role);
}
function loadGroup(name, onLoad){
    database.getData(`week_${isCurWeek ? "cur" : "next"}/${name}`, (data) => {
        WeekCur[name] = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
}
function loadGroups(onLoad){
    database.getData(`week_${isCurWeek ? "cur" : "next"}`, (data) => {
        WeekCur = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
}
function loadGroupsNext(onLoad){
    database.getData("week_next", (data) => {
        WeekNext = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
}
function loadListGroups(onLoad){
    ListGroups = {}
    database.getData("groups", (data) => {
        ListGroups = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
    if (ListGroups instanceof Array){
        ListGroups = Object.assign({}, ListGroups);
    }
}
function loadListTeachers(onLoad){
    ListTeachers = {}
    database.getData("teachers", (data) => {
        ListTeachers = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
    if (ListTeachers instanceof Array){
        ListTeachers = Object.assign({}, ListTeachers);
    }
}

export {
    ListGroups,
    loadListGroups,

    ListTeachers,
    loadListTeachers,

    selectedRoleType,
    selectedRole,
    isCurWeek,
    setIsCurWeek,
    selectRole,

    loadCookie,

    loadGroup,
    loadGroups,
    loadGroupsNext,

    WeekCur,
    WeekNext,

    database,
    weekDivide
}