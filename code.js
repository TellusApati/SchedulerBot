// Constants
const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const dayAbbreviations = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];
const existingLessons = [];



// Telegram settings
var tg = window.Telegram.WebApp;
var backButton = tg.BackButton;
tg.onEvent("backButtonClicked", () => closeLesson())



// HTML groups
var navigationBar = document.getElementById("navigation-bar");
var lessons = document.getElementById("lessons");



// Dates
var targetDate = new Date();

var firstSemesterStart = new Date("2000-09-01");
firstSemesterStart.setFullYear(targetDate.getFullYear());
var secondSemesterStart = new Date("2000-02-10");
secondSemesterStart.setFullYear(targetDate.getFullYear());


loadPossibleLessons();
document.getElementById("lesson-details").style.display = "none";
createNavigation();
loadLessons();
//setInterval(lifecycle, 1000);


// --------------------
//
// Navigation bar
//
// --------------------

function createNavigation() {
    let prevButton = document.createElement("button");
    prevButton.id = "prev-day";
    prevButton.innerText = "⇐";
    prevButton.classList.add("navigation-button");
    prevButton.addEventListener("click", () => loadDay(-1));

    let targetButton = document.createElement("button");
    targetButton.id = "target-day";
    targetButton.classList.add("navigation-button");

    let nextButton = document.createElement("button");
    nextButton.id = "next-day";
    nextButton.innerText = "⇒";
    nextButton.classList.add("navigation-button");
    nextButton.addEventListener("click", () => loadDay(1));

    navigationBar.appendChild(prevButton);
    navigationBar.appendChild(targetButton);
    navigationBar.appendChild(nextButton);

    setTargetDayName(targetDate.getDay())
};

function removeNavigation() {
    let button = document.getElementById("prev-day");
    button.remove();
    button = document.getElementById("next-day");
    button.remove();
    button = document.getElementById("target-day");
    button.remove();
};



// --------------------
//
// Lesson Manipulation
//
// --------------------

function getNodeValue(object, name) {
    return object
        .getElementsByTagName(name)[0]
        .childNodes[0]
        .nodeValue;
}

function loadPossibleLessons() {
    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        const xml = this.responseXML.getElementsByTagName("lesson");
        for (let i = 0; i < xml.length; i ++) {
            let lesson = {
                id: getNodeValue(xml[i], "id"),
                shortName: getNodeValue(xml[i], "short-name"),
                name: getNodeValue(xml[i], "name"),
                lecturer: getNodeValue(xml[i], "lecturer")
            };
            existingLessons.push(lesson);
        }
    }
    xhttp.open("GET", "lessons.xml");
    xhttp.send();
}










function clearLessons() {
    let lesson = document.getElementById("lesson");
    while (lesson != null) {
        lesson.remove();
        lesson = document.getElementById("lesson");
    }

    lesson = document.getElementById("lecture");
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
            let weekType = getNodeValue(xml[i], "week");
            if (weekType == "both" || weekType == getWeekType()) {
                let id = getNodeValue(xml[i], "id");
                let hours = getNodeValue(xml[i], "hours");
                let minutes = getNodeValue(xml[i], "minutes");
                let room = getNodeValue(xml[i], "room");
                let isLecture = getNodeValue(xml[i], "lecture");
                createLesson(existingLessons[Number(id)-1], hours, minutes, room, isLecture == "true");
            }
        }
    }
    xhttp.open("GET", "groups\\2251\\" + days[targetDate.getDay()] + ".xml");
    xhttp.send();
}

function createLesson(lessonInput, hours, minutes, inputRoom, isLecture) {
    let name = document.createElement("p");
    name.id = "name";
    name.innerHTML = lessonInput.shortName;

    let time = document.createElement("p");
    time.id = "time";
    time.innerHTML = hours + ":" + standardizeDate(minutes);

    let room = document.createElement("p");
    room.id = "room";
    room.innerHTML = inputRoom;

    let lecturer = document.createElement("p");
    lecturer.id = "lecturer";
    lecturer.innerHTML = lessonInput.lecturer;

    let lesson = document.createElement("div");
    if (isLecture) {
        lesson.id = "lecture";
    } else {
        lesson.id = "lesson";
    }
    lesson.appendChild(name);
    lesson.appendChild(time);
    lesson.appendChild(room);
    lesson.appendChild(lecturer);

    lesson.addEventListener("click", () => openLesson(lessonInput, inputRoom, isLecture, hours, minutes));

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

    element.innerHTML = dayAbbreviations[day] + ". (";
    element.innerHTML += standardizeDate(targetDate.getDate()) + ".";
    element.innerHTML += standardizeDate(targetDate.getMonth() + 1) + ")";

}

function loadDay(offset) {
    targetDate.setDate(targetDate.getDate() + offset);
    loadLessons();
    setTargetDayName(targetDate.getDay());
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



function openLesson(lesson, room, isLecture, hours, minutes) {
    clearLessons();
    removeNavigation();
    let lessonDetails = document.getElementById("lesson-details");
    lessonDetails.style.display = "block";
    if (isLecture) {
        lessonDetails.style.borderColor = "#3f3f95";
    } else {
        lessonDetails.style.borderColor = "#111419";
    }
    function addDetailsChild(id, text) {
        let element = document.createElement("p");
        element.innerHTML = text;
        element.id = id;
        lessonDetails.appendChild(element);
    }
    addDetailsChild("details-name", lesson.name);
    if (isLecture) {
        addDetailsChild("details-type", "Лекция");
    } else {
        addDetailsChild("details-type", "Семинар");
    }
    addDetailsChild("details-room-name", "Аудитория: ");
    addDetailsChild("details-room", room);
    addDetailsChild("details-lecturer-name", "Преподаватель: ");
    addDetailsChild("details-lecturer", lesson.lecturer);
    addDetailsChild("details-description-name", "Домашнее задание: ");
    addDetailsChild("details-description", "");
    backButton.show();

    const xhttp = new XMLHttpRequest();
    xhttp.onload = function() {
        let descriptionElement = document.getElementById("details-description");
        if (this.responseXML == null) {
            descriptionElement.innerHTML = "Домашнее задание не указано.";
            return false;
        }
        const xml = this.responseXML.getElementsByTagName("task");
        for (let i = 0; i < xml.length; i++) {
            let hoursElement = getNodeValue(xml[i], "hours");
            let minutesElement = getNodeValue(xml[i], "minutes");
            if (hours = hoursElement && minutes == minutesElement) {
                let description = getNodeValue(xml[i], "description");

                descriptionElement.innerHTML = description;
                return true;
            }
        }
        descriptionElement.innerHTML = "Домашнее задание не указано.";

    };
    xhttp.open("GET", "groups\\2251\\hw\\" + standardizeDate(targetDate.getMonth() + 1) + "-" + standardizeDate(targetDate.getDate()) + ".xml");
    xhttp.send();
}

function closeLesson() {
    const clearing = [
        "details-name",
        "details-type",
        "details-room-name",
        "details-room",
        "details-lecturer-name",
        "details-lecturer",
        "details-description-name",
        "details-description"
    ];
    let element;
    /*
    for (let i = 0; i < clearing.length; i ++) {
        let element = document.getElementById(clearing[i]);
        element.remove();
    }
    */

    backButton.hide();
    let lessonDetails = document.getElementById("lesson-details");
    lessonDetails.style.display = "none";
    lessonDetails.remove();
    loadLessons();
    createNavigation();
}