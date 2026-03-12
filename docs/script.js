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
        finishTest();
    }
}

function finishTest(){

    console.log("Final submission:", submission);

    fetch("https://formspree.io/f/YOUR_ID", {
    method: "POST",
    headers: {
    "Content-Type": "application/json"
    },
    body: JSON.stringify(submission)
    });

    trialText.innerText = "Thank you for participating!";
}