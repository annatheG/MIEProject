let words=[
  "clock","lucid","snake","plate","pinky",
  "wreck","vegan","shelf","clown","kiosk",
  "house","ratio","flute","binge","moose",
  "scene","ether","query","globe","image",
  "stoic","canoe","chief","ghost","towel",
  "alien","frame","knife","brush","index"]

let trial=1
let scores=[]
let times=[]

let countdown
let countup
let reviewCount

let startTime

function startTrial(){

  document.getElementById("instructionsPage").style.display="none"
  document.getElementById("timer").style.display="block"
  document.getElementById("skipBtn").style.display="inline-block"
  document.getElementById("resultsScreen").style.display="none"
  document.getElementById("reviewArea").style.display="none"
  document.getElementById("recallArea").style.display="none"
  document.getElementById("summaryScreen").style.display="none"
  document.getElementById("wordRow").innerHTML=""

  document.getElementById("phaseTitle").innerText="Memorize the words"

  showWords()

  let t=30
  document.getElementById("timer").innerText=t

  clearInterval(countdown)
  clearInterval(countup)
  clearInterval(reviewCount)

  countdown=setInterval(()=>{
    t--
    document.getElementById("timer").innerText=t
    if(t <= 0){
      clearInterval(countdown)
      startRecall()
    }
  },1000)
}

function showWords() {
  let row = document.getElementById("wordRow");
  row.innerHTML = "";
  for (let w of words) {
    let s = document.createElement("span");
    s.innerText = w;
    row.appendChild(s);
  }
}

function startRecall(){

  clearInterval(countdown)

  document.getElementById("skipBtn").style.display="none"
  document.getElementById("wordRow").innerHTML=""

  document.getElementById("phaseTitle").innerText="Recall Phase"

  document.getElementById("recallArea").style.display="block"
  document.getElementById("recallBox").value=""
  document.getElementById("wordCount").innerText=0

  startTime=Date.now()
  document.getElementById("timer").style.display="block"

  countup=setInterval(()=>{
    let t = (Date.now() - startTime)/1000
    document.getElementById("timer").innerText = t.toFixed(2)
  },50)
}

const recallBox = document.getElementById("recallBox")
if(recallBox){
  recallBox.addEventListener("input",()=>{
    let txt=document.getElementById("recallBox").value.trim()
    if(txt===""){
      document.getElementById("wordCount").innerText=0
      return
    }
    let arr=txt.split(/\s+/)
    document.getElementById("wordCount").innerText=arr.length
  })
}

function submitRecall(){

  clearInterval(countup)

  let time = ((Date.now() - startTime)/1000).toFixed(2)

  let txt=document.getElementById("recallBox").value.trim().toLowerCase()
  let arr=txt.split(/\s+/)

  let correct=[]
  let wrong=[]

  for(let w of arr){
    if(words.includes(w) && !correct.includes(w)){
      correct.push(w)
    } else {
      wrong.push(w)
    }
  }

  scores.push(correct.length)
  times.push(time)

  showReview(correct,wrong)
}

function showReview(correct,wrong){

  document.getElementById("recallArea").style.display="none"
  document.getElementById("reviewArea").style.display="block"
  document.getElementById("timer").style.display="none"
  document.getElementById("phaseTitle").innerText="Review Phase"

  let row = document.getElementById("lineRow")
  row.innerHTML = ""

  for(let w of words){
    let s = document.createElement("span")
    s.className = "line"
    if(correct.includes(w)){
      s.innerText = w
    } else {
      s.innerHTML = "&nbsp;"
    }
    row.appendChild(s)
  }

  document.getElementById("wrongWords").innerText =
    wrong.length>0 ? "Extra words: " + wrong.join(" ") : ""

  let t = 10
  document.getElementById("reviewTimer").innerText = t

  clearInterval(reviewCount)
  reviewCount = setInterval(()=>{
    t--
    document.getElementById("reviewTimer").innerText = t
    if(t <= 0){
      clearInterval(reviewCount)
      showTrialResult()
    }
  },1000)
}

function skipReview(){
  clearInterval(reviewCount)
  showTrialResult()
}

function showTrialResult(){

  document.getElementById("reviewArea").style.display="none"
  document.getElementById("resultsScreen").style.display="block"
  document.getElementById("timer").style.display="none"

  let s = scores[scores.length-1]
  let t = times[times.length-1]

  document.getElementById("scoreText").innerText = "Score: "+s+"/30"
  document.getElementById("timeText").innerText = "Time: "+t+" s"

  if(trial >= 3){
    document.getElementById("proceedBtn").innerText = "Finish Test"
  } else {
    document.getElementById("proceedBtn").innerText = "Proceed to Next Trial"
  }
}

function nextTrial(){

  document.getElementById("resultsScreen").style.display="none"

  trial++

  if(trial<=3){
    startTrial()
  } else {
    submitAndShowSummary()
  }
}

function submitAndShowSummary(){

  let participant = { name: "Unknown", email: "", school: "", major: "", group: "Unknown" }

  try {
    const raw = localStorage.getItem("participantInfo")
    if(raw){
      participant = JSON.parse(raw)
    }
  } catch(err) {
    console.error("localStorage error:", err)
  }

  const trialResponses = scores.map((s, i) => ({
    trial: i + 1,
    score: s,
    time: times[i]
  }))

  const submission = {
    name: participant.name,
    email: participant.email,
    school: participant.school,
    major: participant.major,
    group: participant.group,
    trials: trialResponses
  }

  console.log("Final submission:", submission)

  showSummary()

  try {
    fetch("https://formspree.io/f/mgonyvgr", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(submission)
    })
    .then(res => {
      if(res.ok){
        console.log("Submission successful")
      } else {
        console.error("Submission failed with status:", res.status)
      }
    })
    .catch(err => console.error("Submission error:", err))
  } catch(err) {
    console.error("Fetch error:", err)
  }
}

function showSummary(){

  document.getElementById("summaryScreen").style.display="block"

  let tb = document.getElementById("summaryTable")

  for(let i=0;i<3;i++){
    tb.innerHTML +=
    `<tr>
      <td>${i+1}</td>
      <td>${scores[i]}/30</td>
      <td>${times[i]}</td>
    </tr>`
  }
}