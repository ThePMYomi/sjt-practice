import { scoreRanking, scoreBest3 } from "./scoringEngine.js"
import { renderRankingQuestion } from "../ui/rankingUI.js"
import { renderBest3Question } from "../ui/multiSelectUI.js"
import { updateNavigation } from "../ui/navigationUI.js"


// =======================
// STORAGE
// =======================

let questionBank = []

let easyQuestions = []
let mediumQuestions = []
let hardQuestions = []

let examQuestions = []

let incorrectQuestions = []

let userAnswers = {}

let flaggedQuestions = new Set()

let currentQuestionIndex = 0

let timerInterval = null
let timeRemaining = 0

let currentMode = "exam"


const competencyIndex = {

"patient-centred care":[],
"professionalism":[],
"team communication":[],
"handling feedback":[],
"coping with pressure":[],
"clinical safety":[],
"ethical decision making":[],
"seeking supervision appropriately":[]

}


// =======================
// TEXT FORMATTER
// =======================

function formatReadableText(text){

if(!text) return ""

const sentences =
text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]

let formatted=""

for(let i=0;i<sentences.length;i++){

formatted+=sentences[i].trim()

if((i+1)%2===0) formatted+="<br><br>"
else formatted+=" "

}

return formatted

}


// =======================
// LOAD QUESTION BANK
// =======================

export async function loadQuestionBank(){

const response=await fetch("./data/questions.json")

questionBank=await response.json()

indexQuestions()

}


// =======================
// INDEX QUESTIONS
// =======================

function indexQuestions(){

easyQuestions=[]
mediumQuestions=[]
hardQuestions=[]

Object.keys(competencyIndex).forEach(c=>{
competencyIndex[c]=[]
})

questionBank.forEach(q=>{

if(q.difficulty==="easy") easyQuestions.push(q)
else if(q.difficulty==="medium") mediumQuestions.push(q)
else if(q.difficulty==="hard") hardQuestions.push(q)

if(competencyIndex[q.competency]){
competencyIndex[q.competency].push(q)
}

})

}


// =======================
// GENERATE EXAM
// =======================

export function generateExam(difficulty,count,type,mode){

currentMode=mode||"exam"

let pool=[]

if(difficulty==="easy") pool=easyQuestions
else if(difficulty==="medium") pool=mediumQuestions
else if(difficulty==="hard") pool=hardQuestions
else pool=questionBank

buildQuestionSet(pool,count,type)

resetExam()

}


// =======================
// COMPETENCY PRACTICE
// =======================

export function generateCompetencyPractice(comp,count,type,mode){

currentMode=mode||"exam"

const pool=competencyIndex[comp]||[]

buildQuestionSet(pool,count,type)

resetExam()

}


// =======================
// RESET EXAM STATE
// =======================

function resetExam(){

userAnswers={}
flaggedQuestions=new Set()
currentQuestionIndex=0

if(examQuestions.length===0){
alert("No questions available")
return
}

startTimer(examQuestions.length)

renderCurrentQuestion()

}


// =======================
// BUILD QUESTION SET
// =======================

function buildQuestionSet(pool,count,type){

if(pool.length===0){
alert("No questions available for this selection.")
return
}

const rankingPool=pool.filter(q=>q.type==="ranking")
const best3Pool=pool.filter(q=>q.type==="best3")

if(type==="ranking"){
examQuestions=shuffle(rankingPool).slice(0,count)
return
}

if(type==="best3"){
examQuestions=shuffle(best3Pool).slice(0,count)
return
}

let rankingCount=Math.round(count*0.7)
let best3Count=count-rankingCount

rankingCount=Math.min(rankingCount,rankingPool.length)
best3Count=Math.min(best3Count,best3Pool.length)

let remaining=count-(rankingCount+best3Count)

while(remaining>0){

if(rankingPool.length>rankingCount){
rankingCount++
}
else if(best3Pool.length>best3Count){
best3Count++
}
else break

remaining--

}

examQuestions=shuffle([
...shuffle(rankingPool).slice(0,rankingCount),
...shuffle(best3Pool).slice(0,best3Count)
])

}


// =======================
// SHUFFLE
// =======================

function shuffle(arr){

const a=[...arr]

for(let i=a.length-1;i>0;i--){

const j=Math.floor(Math.random()*(i+1))

[a[i],a[j]]=[a[j],a[i]]

}

return a

}


// =======================
// TIMER
// =======================

function startTimer(questionCount){

if(timerInterval) clearInterval(timerInterval)

timeRemaining=Math.round(questionCount*1.9*60)

const timerDiv=document.getElementById("timer")

timerInterval=setInterval(()=>{

timeRemaining--

const m=Math.floor(timeRemaining/60)
const s=timeRemaining%60

timerDiv.innerText=m+":"+(s<10?"0"+s:s)

if(timeRemaining<=0) submitExam()

},1000)

}


// =======================
// RENDER QUESTION
// =======================

export function renderCurrentQuestion(){

const question=examQuestions[currentQuestionIndex]

const formattedScenario=
formatReadableText(question.scenario)

const container=document.getElementById("quiz")

container.innerHTML=""

const header=document.createElement("div")
header.className="question-header"

header.innerHTML=
`<h3>Question ${currentQuestionIndex+1} of ${examQuestions.length}</h3>`

container.appendChild(header)


const flagBtn=document.createElement("button")

flagBtn.innerText=
flaggedQuestions.has(currentQuestionIndex)
?"Unflag":"⚑ Flag for Review"

flagBtn.onclick=()=>{
toggleFlag(currentQuestionIndex)
renderCurrentQuestion()
}

header.appendChild(flagBtn)


if(question.type==="ranking"){

renderRankingQuestion(
container,
{...question,scenario:formattedScenario},
currentQuestionIndex
)

}

else{

renderBest3Question(
container,
{...question,scenario:formattedScenario},
currentQuestionIndex
)

}


if(currentMode==="learn"){

const btn=document.createElement("button")

btn.className="check-answer-btn"

btn.innerText="Check Answer"

btn.onclick=showImmediateFeedback

container.appendChild(btn)

}


updateNavigation(currentQuestionIndex,examQuestions.length)

}


// =======================
// FEEDBACK
// =======================

function showImmediateFeedback(){

const question=examQuestions[currentQuestionIndex]

const userAnswer=userAnswers[currentQuestionIndex]

if(!userAnswer){
alert("Please answer before checking.")
return
}

const feedback=document.createElement("div")

feedback.className="immediate-feedback"

feedback.innerHTML=`

<h4>Answer Feedback</h4>

<p><strong>Your Answer:</strong> ${formatAnswer(userAnswer)}</p>

<p><strong>Correct Answer:</strong> ${formatAnswer(question.answer)}</p>

<p><strong>Explanation:</strong><br>${formatReadableText(question.explanation)}</p>

`

document.getElementById("quiz").appendChild(feedback)

}


// =======================
// SAVE ANSWER
// =======================

export function saveAnswer(index,answer){
userAnswers[index]=answer
}


// =======================
// NAVIGATION
// =======================

export function goToQuestion(i){
currentQuestionIndex=i
renderCurrentQuestion()
}

export function nextQuestion(){

if(currentQuestionIndex<examQuestions.length-1){
currentQuestionIndex++
renderCurrentQuestion()
}

}

export function previousQuestion(){

if(currentQuestionIndex>0){
currentQuestionIndex--
renderCurrentQuestion()
}

}


// =======================
// FLAGGING
// =======================

export function toggleFlag(i){

if(flaggedQuestions.has(i))
flaggedQuestions.delete(i)
else
flaggedQuestions.add(i)

updateNavigation(currentQuestionIndex,examQuestions.length)

}


// =======================
// SUBMIT EXAM
// =======================

export function submitExam(){

clearInterval(timerInterval)

let totalScore=0
let maxScore=0

incorrectQuestions=[]

examQuestions.forEach((q,i)=>{

const userAnswer=userAnswers[i]

let score=0

if(q.type==="ranking"){

maxScore+=20

if(userAnswer)
score=scoreRanking(q.answer,userAnswer)

}

if(q.type==="best3"){

maxScore+=12

if(userAnswer)
score=scoreBest3(q.answer,userAnswer)

}

totalScore+=score

if(score===0) incorrectQuestions.push(q)

})

localStorage.setItem(
"incorrectSJTQuestions",
JSON.stringify(incorrectQuestions)
)

showResults(totalScore,maxScore)

}


// =======================
// SHOW RESULTS
// =======================

function showResults(score,maxScore){

const resultsDiv=document.getElementById("results")

const percent=Math.round((score/maxScore)*100)

resultsDiv.innerHTML=`

<h2>Exam Results</h2>

<p><strong>Score:</strong> ${score} / ${maxScore}</p>

<p><strong>Percentage:</strong> ${percent}%</p>

<button id="reviewBtn">Review Questions</button>

<button onclick="location.reload()">Start New Practice</button>

`

const analytics=calculateAnalytics()

let analyticsHTML="<h3>Performance by Competency</h3>"

Object.entries(analytics).forEach(([comp,data])=>{

const p=data.max
?Math.round((data.earned/data.max)*100)
:0

analyticsHTML+=`

<div class="competency-row">

<div class="competency-label">${comp} (${p}%)</div>

<div class="competency-bar">

<div class="competency-fill" style="width:${p}%"></div>

</div>

</div>

`

})

resultsDiv.innerHTML+=analyticsHTML

document.getElementById("reviewBtn").onclick=showReview

}


// =======================
// ANALYTICS
// =======================

function calculateAnalytics(){

let stats={}

examQuestions.forEach((q,i)=>{

if(!stats[q.competency]){
stats[q.competency]={earned:0,max:0}
}

let earned=0
let max=0

const userAnswer=userAnswers[i]

if(q.type==="ranking"){

max=20

if(userAnswer)
earned=scoreRanking(q.answer,userAnswer)

}

if(q.type==="best3"){

max=12

if(userAnswer)
earned=scoreBest3(q.answer,userAnswer)

}

stats[q.competency].earned+=earned
stats[q.competency].max+=max

})

return stats

}


// =======================
// REVIEW MODE
// =======================

function showReview(){

const quiz=document.getElementById("quiz")

quiz.innerHTML="<h2>Review Questions</h2>"

examQuestions.forEach((q,i)=>{

const userAnswer=userAnswers[i]

let html=`<div class="review-question">`

html+=`<p><strong>Scenario:</strong> ${formatReadableText(q.scenario)}</p>`

html+=`<ul>`

Object.entries(q.options).forEach(([k,v])=>{
html+=`<li><b>${k}</b> — ${v}</li>`
})

html+=`</ul>`

html+=`<p><strong>Your Answer:</strong> ${formatAnswer(userAnswer)}</p>`

html+=`<p><strong>Correct Answer:</strong> ${formatAnswer(q.answer)}</p>`

html+=`<p class="explanation"><strong>Explanation:</strong><br>${formatReadableText(q.explanation)}</p>`

html+=`</div>`

quiz.innerHTML+=html

})

}


// =======================
// FORMAT ANSWER
// =======================

function formatAnswer(answer){

if(!answer) return "No answer given"

if(Array.isArray(answer))
return answer.join(", ")

return answer

}


// =======================
// PRACTICE INCORRECT
// =======================

export function practiceIncorrect(){

const saved=
JSON.parse(localStorage.getItem("incorrectSJTQuestions"))

if(!saved||saved.length===0){
alert("No incorrect questions saved yet.")
return
}

examQuestions=shuffle(saved)

resetExam()

}


// =======================
// GETTERS
// =======================

export function getUserAnswers(){
return userAnswers
}

export function getFlaggedQuestions(){
return flaggedQuestions
}
