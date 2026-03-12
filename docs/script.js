const trials = [
    "DOG TREE APPLE",
    "HOUSE CAR RIVER",
    "PHONE BOOK CLOUD"
];

let currentTrial = -1;
let responses = [];

const trialText = document.getElementById("trialText");

document.getElementById("startBtn").onclick = () => {

    // hide start button after beginning
    document.getElementById("startBtn").style.display = "none";

    nextTrial();
};

document.getElementById("submitBtn").onclick = () => {

    const response = document.getElementById("responseBox").value;

    responses.push({
        trial: currentTrial,
        answer: response
    });

    document.getElementById("responseBox").value = "";

    nextTrial();
};

function nextTrial(){

    currentTrial++;

    if(currentTrial >= trials.length){
        finishTest();
        return;
    }

    trialText.innerText = trials[currentTrial];
}

function finishTest() {
    // Safely handle missing participant info
    const raw = localStorage.getItem("participantInfo");
    const participant = raw ? JSON.parse(raw) : { name: "Unknown", email: "", school: "", major: "" };

    const submission = {
        name: participant.name,
        email: participant.email,
        school: participant.school,
        major: participant.major,
        responses: responses
    };

    console.log("Final submission:", submission);

    fetch("https://formspree.io/f/mgonyvgr", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(submission)
    });

    trialText.innerText = "Thank you for participating! Your response has been recorded :)";
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("responseBox").style.display = "none";
    document.getElementById("startBtn").style.display = "none";
}