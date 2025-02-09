const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const dayNames = ["вс", "пн", "вт", "ср", "чт", "пт", "сб"];

var tg = window.Telegram.WebApp;
var targetDate = new Date();
var backButton = tg.BackButton;
tg.onEvent("backButtonClicked", () => closeLesson())

// HTML groups
var navigationBar = document.getElementById("navigation-bar");
var lessons = document.getElementById("lessons");
var lessonDetails = document.getElementById("lesson-details");

// Дата начала первого & второго семестров
var firstSemesterStart = new Date("2000-09-01");
firstSemesterStart.setFullYear(targetDate.getFullYear());
var secondSemesterStart = new Date("2000-02-10");
secondSemesterStart.setFullYear(targetDate.getFullYear());


lessonDetails.style.display = "none";
createNavigation();
loadLessons();
//setInterval(lifecycle, 1000);


function createNavigation() {
    let prevButton = document.createElement("button");
    prevButton.id = "prev-day";
    prevButton.innerText = "⇐";
    prevButton.addEventListener("click", () => loadDay(-1));

    let targetButton = document.createElement("button");
    targetButton.id = "target-day";

    let nextButton = document.createElement("button");
    nextButton.id = "next-day";
    nextButton.innerText = "⇒";
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
                let fullName = xml[i]
                    .getElementsByTagName("name")[0]
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
                createLesson(name, hours, minutes, room, lecturer, isLecture == "true", fullName);
            }
        }
    }
    xhttp.open("GET", "groups\\1251\\" + days[targetDate.getDay()] + ".xml");
    xhttp.send();
}

function createLesson(inputName, hours, minutes, inputRoom, inputLecturer, isLecture, fullName) {
    let name = document.createElement("p");
    name.id = "name";
    name.innerHTML = inputName;

    let time = document.createElement("p");
    time.id = "time";
    time.innerHTML = hours + ":" + standardizeDate(minutes);

    let room = document.createElement("p");
    room.id = "room";
    room.innerHTML = inputRoom;

    let lecturer = document.createElement("p");
    lecturer.id = "lecturer";
    lecturer.innerHTML = inputLecturer;

    let lesson = document.createElement("div");
    if (isLecture) {
        lesson.id = "lecture";
    } else {
        lesson.id = "lesson";
    }
    lesson.appendChild(name);
    lesson.appendChild(room);
    lesson.appendChild(lecturer);
    lesson.appendChild(time);

    lesson.addEventListener("click", () => openLesson(fullName, inputRoom, inputLecturer, isLecture, hours, minutes));

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



function openLesson(name, room, lecturer, isLecture, hours, minutes) {
    clearLessons();
    removeNavigation();
    lessonDetails.style.display = "block";
    if (isLecture) {
        lessonDetails.style.borderColor = "#3f3f95";
    } else {
        lessonDetails.style.borderColor = "#111419";
    }

    let element = document.createElement("p");
    element.innerHTML = name;
    element.id = "details-name";
    lessonDetails.appendChild(element);

    element = document.createElement("p");
    if (isLecture) {
        element.innerHTML = "Лекция";
    } else {
        element.innerHTML = "Семинар";
    }
    element.id = "details-type";
    lessonDetails.appendChild(element);

    element = document.createElement("p");
    element.innerHTML = "Аудитория: ";
    element.id = "details-room-name";
    lessonDetails.appendChild(element);

    element = document.createElement("p");
    element.innerHTML = room;
    element.id = "details-room";
    lessonDetails.appendChild(element);

    element = document.createElement("p");
    element.innerHTML = "Преподаватель: ";
    element.id = "details-lecturer-name";
    lessonDetails.appendChild(element);

    element = document.createElement("p");
    element.innerHTML = lecturer;
    element.id = "details-lecturer";
    lessonDetails.appendChild(element);

    element = document.createElement("p");
    element.innerHTML = "Домашнее задание: ";
    element.id = "details-description-name";
    lessonDetails.appendChild(element);

    element = document.createElement("p");
    element.id = "details-description";
    lessonDetails.appendChild(element);


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
            let hoursElement = xml[i]
                .getElementsByTagName("hours")[0]
                .childNodes[0]
                .nodeValue;
            let minutesElement = xml[i]
                .getElementsByTagName("minutes")[0]
                .childNodes[0]
                .nodeValue;
            if (hours = hoursElement && minutes == minutesElement) {
                let description = xml[i]
                    .getElementsByTagName("description")[0]
                    .childNodes[0]
                    .nodeValue;

                descriptionElement.innerHTML = description;
                return true;
            }
        }
        descriptionElement.innerHTML = "Домашнее задание не указано.";

    };
    xhttp.open("GET", "groups\\1251\\hw\\" + standardizeDate(targetDate.getMonth() + 1) + "-" + standardizeDate(targetDate.getDate()) + ".xml");
    xhttp.send();
}

function closeLesson() {
    let element = document.getElementById("details-name");
    element.remove();
    element = document.getElementById("details-type");
    element.remove();
    element = document.getElementById("details-room-name");
    element.remove();
    element = document.getElementById("details-room");
    element.remove();
    element = document.getElementById("details-lecturer-name");
    element.remove();
    element = document.getElementById("details-lecturer");
    element.remove();
    element = document.getElementById("details-description-name");
    element.remove();
    element = document.getElementById("details-description");
    element.remove();

    backButton.hide();
    lessonDetails.style.display = "none";
    loadLessons();
    createNavigation();
}