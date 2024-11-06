import * as content from "ATTS_Schedule_Website/src/content.js"
const ScheduleContainer = document.getElementById("schedule-container")

const pairClass = "schedule-pair-";
function addDay(title, pair_list, isDev = false, index = -1) {
    let dayDivOuter = document.createElement("div");
    let dayDiv = document.createElement("div");
    let teacherList = "<option value='-1'>--преподаватель--</option>";
    for (let i = 0; i < content.ListTeachers.length; i++) {
        teacherList += "<option value='" + i + "'>" + content.ListTeachers[i] + "</option>";
    }
    dayDivOuter.classList.add("schedule-day-outer");
    dayDiv.classList.add("schedule-day");

    for (let i = 0; i < pair_list.length; i++) {
        let enabled = pair_list[i] !== null;

        let id = index + "/" + i + "/";

        let pairElementOut = document.createElement("div2");
        let teacherElementOut = document.createElement("div2");
        let cabinetElementOut = document.createElement("div2");

        let pairElement = document.createElement("div");
        let teacherElement = document.createElement("div");
        let cabinetElement = document.createElement("div");

        if (isDev) {
            pairElement = document.createElement("textarea");
            pairElement.id = id + "0";
            teacherElement = document.createElement("select");
            teacherElement.id = id + "1";
            teacherElement.innerHTML = teacherList;
            cabinetElement = document.createElement("textarea");
            cabinetElement.id = id + "2";

            teacherElementOut.appendChild(teacherElement);

            pairElementOut.innerHTML += `<button class='minus' id='${id+"add"}' title="Удалить"></button>`;
            pairElementOut.innerHTML += `<button class='plus' id='${id+"remove"}' title="Добавить"></button>`;

            pairElement.classList.add("edit-text");
            teacherElement.classList.add("edit-select");
            cabinetElement.classList.add("edit-text");
        }

        pairElement.classList.add(pairClass + "name");
        teacherElement.classList.add(pairClass + "teacher");
        cabinetElement.classList.add(pairClass + "cabinet");

        let multy = false;

        if (enabled) {
            if (isDev){
                pairElement.innerHTML = pair_list[i].pair;
            }
            else {
                pairElement.innerText = pair_list[i].pair;
            }
            cabinetElement.innerHTML = pair_list[i].cabinet;
            if (pair_list[i].teacher instanceof Array){
                multy = true;
                if (isDev){
                    teacherElement.value = pair_list[i].teacher[0];
                    teacherElement.classList.add(pairClass + "multy");
                    teacherElement.id = id + "1-0";
                    let teacherElement2 = document.createElement("select");
                    teacherElement2.innerHTML = teacherList;
                    teacherElement2.classList.add(pairClass + "multy", pairClass + "teacher", "edit-select");
                    teacherElement2.id = id + "1-1";
                    teacherElement2.value = pair_list[i].teacher[1];
                    teacherElementOut.appendChild(teacherElement2);
                }
                else {
                    teacherElement.innerText = "1. " + pair_list[i].teacher[0] + "\n2. " + pair_list[i].teacher[1];
                }
                teacherElement.classList.add(pairClass + "multy");
                pairElement.classList.add(pairClass + "multy");
            }
            else {
                if (isDev) {
                    teacherElement.value = pair_list[i].teacher;
                }
                else teacherElement.innerHTML = pair_list[i].teacher;
            }
        }
        else {
            pairElement.classList.add(pairClass + "blank");
            teacherElement.classList.add(pairClass + "blank");
            cabinetElement.classList.add(pairClass + "blank");
            if (isDev) {
                pairElement.disabled = true;
                teacherElement.disabled = true;
                cabinetElement.disabled = true;
            }
        }
        if (isDev){
            pairElementOut.appendChild(pairElement);
            cabinetElementOut.appendChild(cabinetElement);
            cabinetElementOut.innerHTML += `<button class='word-top' id='${id+(enabled ? "off" : "on")}' title="${enabled ? "Выключить" : "Включить"}">${enabled ? "D" : "E"}</button>`;
            if (enabled) {
                cabinetElementOut.innerHTML += `<button class='word-bottom' id='${id+(multy ? "single" : "multy")}' title="${multy ? "Сделать Одинарным" : "Сделать Двойным"}">${multy ? "S" : "M"}</button>`;
            }
        }
        dayDiv.appendChild(isDev ? pairElementOut : pairElement);
        dayDiv.appendChild(isDev ? teacherElementOut : teacherElement);
        dayDiv.appendChild(isDev ? cabinetElementOut : cabinetElement);
    }
    let dayDivTitle = document.createElement("div3");
    if (isDev){
        dayDivTitle.innerHTML = `<button title="Добавить" class="plus" id="${index}/-1/none"></button>`;
    }
    dayDivTitle.innerHTML += `<p>${title}</p>`;
    dayDivOuter.appendChild(dayDivTitle);
    dayDivOuter.appendChild(dayDiv);
    ScheduleContainer.appendChild(dayDivOuter);
}
export {
    addDay,
    ScheduleContainer,
    content,
}