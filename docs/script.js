// =====================
// WORD LIST
// =====================
const words = [
    "apple","chair","river","glass","stone",
    "paper","light","train","cloud","bread",
    "green","music","plant","table","phone"
];

let placed = new Array(words.length).fill(false);

// =====================
// TRIAL DATA
// =====================
let trial = 1;
let trialTimes = [];
let trialScores = [];
let trialResponses = []; // stores per-trial guesses for submission

let currentGuesses = []; // guesses within the current trial

// =====================
// TIMERS
// =====================
let countdownTimer;
let countupTimer;
let timeLeft = 40;
let recallTime = 0;
let startTime;

// =====================
// START EXPERIMENT / TRIAL
// =====================
function startExperiment(){

    document.getElementById("instructionsPage").style.display = "none";
    document.getElementById("timer").style.display = "block";
    document.getElementById("instructions").style.display = "block";

    placed.fill(false);
    currentGuesses = [];

    document.getElementById("recallArea").style.display = "none";
    document.getElementById("summaryScreen").style.display = "none";
    document.getElementById("proceedBtn").style.display = "none";
    document.getElementById("result").innerText = "";
    document.getElementById("guessBox").value = "";
    recallTime = 0;

    showWords();

    timeLeft = 40;
    document.getElementById("timer").innerText = timeLeft;
    document.getElementById("instructions").innerText = "Memorize the words";

    clearInterval(countdownTimer);
    clearInterval(countupTimer);

    countdownTimer = setInterval(countdown, 1000);
}

// =====================
// SHOW WORDS (Memorization)
// =====================
function showWords(){
    let row = document.getElementById("wordRow");
    row.innerHTML = "";
    for(let w of words){
        let span = document.createElement("span");
        span.innerText = w;
        row.appendChild(span);
    }
}

// =====================
// COUNTDOWN TIMER
// =====================
function countdown(){
    timeLeft--;
    document.getElementById("timer").innerText = timeLeft;
    if(timeLeft <= 0){
        clearInterval(countdownTimer);
        startRecall();
    }
}

// =====================
// START RECALL
// =====================
function startRecall(){

    document.getElementById("wordRow").innerHTML = "";
    document.getElementById("recallArea").style.display = "block";
    document.getElementById("instructions").innerText = "Recall the words";

    makeLines();

    recallTime = 0;
    document.getElementById("timer").innerText = recallTime;

    startTime = Date.now();

    clearInterval(countupTimer);
    countupTimer = setInterval(countUp, 1000);

    document.getElementById("guessBox").focus();
}

// =====================
// COUNTUP TIMER
// =====================
function countUp(){
    recallTime = Math.floor((Date.now() - startTime) / 1000);
    document.getElementById("timer").innerText = recallTime;
}

// =====================
// MAKE LINES (Recall)
// =====================
function makeLines(){
    let row = document.getElementById("lineRow");
    row.innerHTML = "";
    let tempSpan = document.createElement("span");
    tempSpan.style.visibility = "hidden";
    tempSpan.style.position = "absolute";
    document.body.appendChild(tempSpan);
    for(let i = 0; i < words.length; i++){
        let w = words[i];
        let span = document.createElement("span");
        span.className = "line";
        span.id = "line" + i;
        tempSpan.innerText = w;
        span.style.width = tempSpan.offsetWidth + "px";
        span.innerHTML = "&nbsp;";
        row.appendChild(span);
    }
    document.body.removeChild(tempSpan);
}

// =====================
// ENTER GUESS
// =====================
function enterGuess(){
    let box = document.getElementById("guessBox");
    let guess = box.value.trim().toLowerCase();
    if(!guess) return;

    let correct = false;

    for(let i = 0; i < words.length; i++){
        if(guess === words[i] && !placed[i]){
            let line = document.getElementById("line" + i);
            line.innerText = words[i];
            line.style.color = "green";
            setTimeout(() => { line.style.color = "black"; }, 500);
            placed[i] = true;
            correct = true;
        }
    }

    currentGuesses.push({ word: guess, correct: correct });

    if(!correct){
        box.classList.add("shake");
        setTimeout(() => { box.classList.remove("shake"); }, 200);
    }

    box.value = "";
    box.focus();
}

// =====================
// ENTER KEY
// =====================
document.getElementById("guessBox").addEventListener("keypress", function(e){
    if(e.key === "Enter"){
        enterGuess();
    }
});

// =====================
// SUBMIT / END TRIAL
// =====================
function submitRecall(){

    // Immediately disable submit to prevent double submissions
    document.getElementById("submitBtn").disabled = true;
    document.getElementById("submitBtn").style.opacity = "0.5";

    clearInterval(countupTimer);

    let time = Math.floor((Date.now() - startTime) / 1000);
    let score = placed.filter(p => p).length;

    trialTimes.push(time);
    trialScores.push(score);
    trialResponses.push({
        trial: trial,
        score: score,
        time: time,
        guesses: currentGuesses
    });

    document.getElementById("result").innerText =
        "Score: " + score + "/15   Time: " + time + " s";

    // Review phase
    showWords();
    let reviewTime = Math.max(1, Math.round(2.5 * score));
    document.getElementById("instructions").innerText =
        "Review the words (" + reviewTime + "s)";

    setTimeout(() => {
        document.getElementById("wordRow").innerHTML = "";
        if(trial < 3){
            document.getElementById("proceedBtn").style.display = "inline-block";
        } else {
            submitAndShowSummary();
        }
    }, reviewTime * 1000);
}

// =====================
// NEXT TRIAL
// =====================
function nextTrial(){
    trial++;
    document.getElementById("proceedBtn").style.display = "none";

    // Re-enable submit for the new trial
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("submitBtn").style.opacity = "1";

    startExperiment();
}

// =====================
// SUBMIT TO FORMSPREE & SHOW SUMMARY
// =====================
function submitAndShowSummary(){

    const raw = localStorage.getItem("participantInfo");
    const participant = raw
        ? JSON.parse(raw)
        : { name: "Unknown", email: "", school: "", major: "" };

    const submission = {
        name: participant.name,
        email: participant.email,
        school: participant.school,
        major: participant.major,
        trials: trialResponses
    };

    console.log("Final submission:", submission);

    fetch("https://formspree.io/f/mgonyvgr", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(submission)
    }).catch(err => console.error("Submission error:", err));

    showSummary();
}

// =====================
// SHOW SUMMARY
// =====================
function showSummary(){
    document.getElementById("recallArea").style.display = "none";
    document.getElementById("instructions").style.display = "none";
    document.getElementById("summaryScreen").style.display = "block";
    document.getElementById("timer").style.display = "none";

    let tbody = document.getElementById("summaryTable");
    tbody.innerHTML = "";
    for(let i = 0; i < 3; i++){
        let row = `<tr><td>${i+1}</td><td>${trialScores[i]}/15</td><td>${trialTimes[i]}</td></tr>`;
        tbody.innerHTML += row;
    }
}