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
let trialResponses = [];

let currentGuesses = [];

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
    document.getElementById("memProceedBtn").style.display = "inline-block";

    placed.fill(false);
    currentGuesses = [];

    document.getElementById("recallArea").style.display = "none";
    document.getElementById("resultsScreen").style.display = "none";
    document.getElementById("summaryScreen").style.display = "none";
    document.getElementById("result").innerText = "";
    document.getElementById("guessBox").value = "";

    // Re-enable submit in case it was disabled from previous trial
    document.getElementById("submitBtn").disabled = false;
    document.getElementById("submitBtn").style.opacity = "1";

    document.getElementById("phaseTitle").innerText = "Trial " + trial + " — Memorize the words";

    showWords();

    timeLeft = 40;
    document.getElementById("timer").innerText = timeLeft;

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

    clearInterval(countdownTimer);
    document.getElementById("memProceedBtn").style.display = "none";
    document.getElementById("wordRow").innerHTML = "";
    document.getElementById("recallArea").style.display = "block";
    document.getElementById("phaseTitle").innerText = "Trial " + trial + " — Recall the words";

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

    let matchedIndex = -1;

    for(let i = 0; i < words.length; i++){
        if(guess === words[i]){
            matchedIndex = i;
            placed[i] = true;
            break;
        }
    }

    if(matchedIndex >= 0){
        let line = document.getElementById("line" + matchedIndex);
        line.innerText = words[matchedIndex];
        line.style.color = "green";
        setTimeout(() => { line.style.color = "black"; }, 500);
        currentGuesses.push({ word: guess, correct: true });
    } else {
        box.classList.add("shake");
        setTimeout(() => { box.classList.remove("shake"); }, 200);
        currentGuesses.push({ word: guess, correct: false });
    }

    box.value = "";
    box.focus();

    // Auto-submit if all words placed
    if(placed.every(p => p)){
        submitRecall();
    }
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

    // Prevent double submissions
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

    // Hide recall area, show results screen
    document.getElementById("recallArea").style.display = "none";
    document.getElementById("phaseTitle").innerText = "Trial " + trial + " — Results";
    document.getElementById("resultsScreen").style.display = "block";

    document.getElementById("scoreText").innerText = "Score: " + score + "/15";
    document.getElementById("timeText").innerText = "Time: " + time + " s";

    // Change button label on final trial
    if(trial >= 3){
        document.getElementById("proceedBtn").innerText = "See Summary";
    } else {
        document.getElementById("proceedBtn").innerText = "Proceed to Next Trial";
    }
}

// =====================
// NEXT TRIAL
// =====================
function nextTrial(){
    document.getElementById("resultsScreen").style.display = "none";
    trial++;
    if(trial <= 3){
        startExperiment();
    } else {
        submitAndShowSummary();
    }
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
    document.getElementById("phaseTitle").innerText = "";
    document.getElementById("timer").style.display = "none";
    document.getElementById("summaryScreen").style.display = "block";

    let tbody = document.getElementById("summaryTable");
    tbody.innerHTML = "";
    for(let i = 0; i < trialScores.length; i++){
        let row = `<tr><td>${i+1}</td><td>${trialScores[i]}/15</td><td>${trialTimes[i]}</td></tr>`;
        tbody.innerHTML += row;
    }
}