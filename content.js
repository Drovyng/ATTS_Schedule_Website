import * as database from "database.js"

let ListGroups = []
let ListTeachers = []
let WeekCur = {}
let WeekNext = {}

let selectedRoleType = false
let selectedRole = -1
let isCurWeek = true;

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
        document.cookie = "role=" + (selectedRoleType ? ListTeachers[selectedRole] : ListGroups[selectedRole]) +
            ";max-age=7776000"
        document.cookie = "role-type=" + selectedRoleType +
            ";max-age=7776000"
    }
}
function loadCookie(){
    if (document.cookie.length < 17) return;
    selectedRoleType = getCookie("role-type") === "true";
    let role = getCookie("role")
    selectedRole = selectedRoleType ? ListTeachers.indexOf(role) : ListGroups.indexOf(role);
}
function loadGroupCur(name, onLoad){
    database.getData("week_cur/" + name, (data) => {
        WeekCur[name] = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
}
function loadGroupsCur(onLoad){
    database.getData("week_cur", (data) => {
        WeekCur = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
}
function loadListGroups(onLoad){
    ListGroups = []
    database.getData("groups", (data) => {
        ListGroups = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
}
function loadListTeachers(onLoad){
    ListTeachers = []
    database.getData("teachers", (data) => {
        ListTeachers = data;
        if (onLoad !== null) onLoad();
    }, onLoad);
}

export {
    ListGroups,
    loadListGroups,

    ListTeachers,
    loadListTeachers,

    selectedRoleType,
    selectedRole,
    isCurWeek,
    selectRole,

    loadCookie,

    loadGroupCur,
    loadGroupsCur,

    WeekCur,
    WeekNext,

    database
}