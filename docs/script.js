const trials = [
    "DOG TREE APPLE",
    "HOUSE CAR RIVER",
    "PHONE BOOK CLOUD"
];

let currentTrial = -1;
let responses = [];

const trialText = document.getElementById("trialText");

document.getElementById("startBtn").onclick = () => {
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

function finishTest(){

    const participant = JSON.parse(localStorage.getItem("participantInfo"));

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

    trialText.innerText = "Thank you for participating! You're response has been recorded :)";
    
      // hide all controls
    document.getElementById("submitBtn").style.display = "none";
    document.getElementById("responseBox").style.display = "none";
    document.getElementById("startBtn").style.display = "none";
}