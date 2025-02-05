const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const dayNames = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

var tg = window.Telegram.WebApp;
var targetDate = new Date();

var firstSemesterStart = new Date("2000-09-01");
firstSemesterStart.setFullYear(targetDate.getFullYear());
var secondSemesterStart = new Date("2000-02-10");
secondSemesterStart.setFullYear(targetDate.getFullYear());

loadLessons();
setTargetDayName(targetDate.getDay())
setInterval(lifecycle, 1000);

var MainButton = WebApp.MainButton;
var BackButton = WebApp.BackButton;

MainButton.show();
BackButton.show();


function clearLessons() {
    let lesson = document.getElementById("lesson");
    while (lesson != null) {
        lesson.remove();
        lesson = document.getElementById("lesson");
    }
    lesson = document.getElementById("lecture")
    while (lesson != null) {
        lesson.remove();
        lesson = document.getElementById("lecture");
    }
}

function loadLessons() {
    clearLessons();
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        const xml = this.responseXML.getElementsByTagName("lesson");
        for (let i = 0; i < xml.length; i++) {
            let weekType = xml[i]
                .getElementsByTagName("week")[0]
                .childNodes[0]
                .nodeValue;
            if (weekType == "both" || weekType == getWeekType()) {
                let name = xml[i]
                    .getElementsByTagName("short-name")[0]
                    .childNodes[0]
                    .nodeValue;
                let hours = xml[i]
                    .getElementsByTagName("hours")[0]
                    .childNodes[0]
                    .nodeValue;
                let minutes = xml[i]
                    .getElementsByTagName("minutes")[0]
                    .childNodes[0]
                    .nodeValue;
                let room = xml[i]
                    .getElementsByTagName("room")[0]
                    .childNodes[0]
                    .nodeValue;
                let lecturer = xml[i]
                    .getElementsByTagName("lecturer")[0]
                    .childNodes[0]
                    .nodeValue;
                let isLecture = xml[i]
                    .getElementsByTagName("lecture")[0]
                    .childNodes[0]
                    .nodeValue;
                createLesson(name, hours, minutes, room, lecturer, isLecture, weekType);
            }
        }
    }
    xhttp.open("GET", "groups\\1251\\" + days[targetDate.getDay()] + ".xml");
    xhttp.send();
}

function createLesson(inputName, inputHours, inputMinutes, inputRoom, inputLecturer, isLecture) {
    let name = document.createElement("p");
    name.id = "name";
    name.innerHTML = inputName;

    let time = document.createElement("p");
    time.id = "time";
    if (inputMinutes < 10) {
        time.innerHTML =  inputHours + ":0" + inputMinutes;
    } else {
        time.innerHTML =  inputHours + ":" + inputMinutes;
    }

    let room = document.createElement("p");
    room.id = "room";
    room.innerHTML = inputRoom;

    let lecturer = document.createElement("p");
    lecturer.id = "lecturer";
    lecturer.innerHTML = inputLecturer;

    let lesson = document.createElement("div");
    if (isLecture == "true") {
        lesson.id = "lecture";
    } else {
        lesson.id = "lesson";
    }
    lesson.appendChild(name);
    lesson.appendChild(room);
    lesson.appendChild(lecturer);
    lesson.appendChild(time);


    let lessons = document.getElementById("lessons");
    lessons.appendChild(lesson);
}

function standardizeDate(inputDate) {
    if (inputDate < 10) {
        return "0" + inputDate;
    }
    return inputDate;
}

function setTargetDayName(day) {
    let element = document.getElementById("target-day");
    element.innerHTML = dayNames[day] + ". (";
    element.innerHTML += standardizeDate(targetDate.getDate()) + ".";
    element.innerHTML += standardizeDate(targetDate.getMonth() + 1) + ")";

}

function generateCurrentTime() {
    let date = new Date();

    let element = document.getElementById("time");
    element.innerHTML = "Current time: " + date.getHours() + " " + date.getMinutes() + " " + date.getSeconds();
    element.innerHTML = getWeekType();
}

function loadDay(offset) {
    targetDate.setDate(targetDate.getDate() + offset);
    loadLessons();
    setTargetDayName(targetDate.getDay());
}

function lifecycle() {
}

function getWeekType() {
    let isSecondSemester = false;
    if (secondSemesterStart.getMonth() < targetDate.getMonth() && targetDate.getMonth() < firstSemesterStart.getMonth()) {
        isSecondSemester = true;
    } else if (secondSemesterStart.getMonth() == targetDate.getMonth() && secondSemesterStart.getDate() <= targetDate.getDate()) {
        isSecondSemester = true;
    } else if (firstSemesterStart.getMonth() == targetDate.getMonth() && firstSemesterStart.getDate() > targetDate.getDate()) {
        isSecondSemester = true;
    }

    const minute = 1000 * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const week = day * 7;
    let deltaTime = targetDate.getTime();
    if (isSecondSemester) {
        deltaTime -= secondSemesterStart.getTime();
    } else {
        deltaTime -= firstSemesterStart.getTime();
    }

    if ((Math.floor(deltaTime / week) + 1)%2 == 0) {
        return "even";
    }
    return "odd";


}