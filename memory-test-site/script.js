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

    if(currentTrial < trials.length){
        trialText.innerText = trials[currentTrial];
    }

    else{
        fetch("https://formspree.io/f/mgonyvgr", {
method: "POST",
headers: {
"Content-Type": "application/json"
},
body: JSON.stringify(submission)
});;
    }
}

function finishTest(){

    const participant = JSON.parse(localStorage.getItem("participantInfo"));

    const submission = {
        participant: participant,
        responses: responses
    };

    console.log("Final submission:", submission);

    trialText.innerText = "Thank you for participating!";
}