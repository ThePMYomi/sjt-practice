import { scoreRanking, scoreBest3 } from "./scoringEngine.js"
import { renderRankingQuestion } from "../ui/rankingUI.js"
import { renderBest3Question } from "../ui/multiSelectUI.js"
import { updateNavigation } from "../ui/navigationUI.js"


// =======================
// QUESTION STORAGE
// =======================

let questionBank = []

let easyQuestions = []
let mediumQuestions = []
let hardQuestions = []

let incorrectQuestions = []

let currentMode = "exam"

let flaggedQuestions = new Set()

let competencyIndex = {

    "patient-centred care": [],
    "professionalism": [],
    "team communication": [],
    "handling feedback": [],
    "coping with pressure": [],
    "clinical safety": [],
    "ethical decision making": [],
    "seeking supervision appropriately": []

}

let examQuestions = []
let userAnswers = {}

let currentQuestionIndex = 0

let timerInterval = null
let timeRemaining = 0



// =======================
// TEXT FORMATTER
// Adds spacing after every 2 sentences
// =======================

function formatReadableText(text){

    if(!text) return ""

    const sentences =
        text.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [text]

    let formatted = ""

    for(let i = 0; i < sentences.length; i++){

        formatted += sentences[i].trim()

        if((i + 1) % 2 === 0){
            formatted += "<br><br>"
        }
        else{
            formatted += " "
        }

    }

    return formatted
}



// =======================
// LOAD QUESTION BANK
// =======================

export async function loadQuestionBank(){

    const response = await fetch("./data/questions.json")

    questionBank = await response.json()

    indexQuestions()

}



// =======================
// INDEX QUESTIONS
// =======================

function indexQuestions(){

    easyQuestions = []
    mediumQuestions = []
    hardQuestions = []

    Object.keys(competencyIndex).forEach(key=>{
        competencyIndex[key] = []
    })

    questionBank.forEach(q=>{

        if(q.difficulty === "easy") easyQuestions.push(q)
        else if(q.difficulty === "medium") mediumQuestions.push(q)
        else if(q.difficulty === "hard") hardQuestions.push(q)

        if(competencyIndex[q.competency]){
            competencyIndex[q.competency].push(q)
        }

    })

}



// =======================
// GENERATE EXAM
// =======================

export function generateExam(difficulty, numberOfQuestions, questionType, mode){

    currentMode = mode || "exam"

    let pool = []

    if(difficulty === "easy") pool = easyQuestions
    else if(difficulty === "medium") pool = mediumQuestions
    else if(difficulty === "hard") pool = hardQuestions
    else pool = questionBank

    buildQuestionSet(pool, numberOfQuestions, questionType)

    userAnswers = {}
    flaggedQuestions = new Set()

    currentQuestionIndex = 0

    if(examQuestions.length === 0){
        alert("No questions available.")
        return
    }

    startTimer(examQuestions.length)

    renderCurrentQuestion()

}



// =======================
// COMPETENCY PRACTICE
// =======================

export function generateCompetencyPractice(
    competency,
    numberOfQuestions,
    questionType,
    mode
){

    currentMode = mode || "exam"

    let pool = competencyIndex[competency] || []

    buildQuestionSet(pool, numberOfQuestions, questionType)

    userAnswers = {}
    flaggedQuestions = new Set()

    currentQuestionIndex = 0

    if(examQuestions.length === 0){
        alert("No questions available for this competency.")
        return
    }

    startTimer(examQuestions.length)

    renderCurrentQuestion()

}



// =======================
// BUILD QUESTION SET
// =======================

function buildQuestionSet(pool, numberOfQuestions, questionType){

    if(pool.length === 0){
        alert("No questions available for this selection.")
        return
    }

    let rankingPool = pool.filter(q=>q.type === "ranking")
    let best3Pool = pool.filter(q=>q.type === "best3")

    if(questionType === "ranking"){

        examQuestions =
            shuffle(rankingPool).slice(0, numberOfQuestions)

        return
    }

    if(questionType === "best3"){

        examQuestions =
            shuffle(best3Pool).slice(0, numberOfQuestions)

        return
    }

    let rankingCount = Math.round(numberOfQuestions * 0.7)
    let best3Count = numberOfQuestions - rankingCount

    rankingCount = Math.min(rankingCount, rankingPool.length)
    best3Count = Math.min(best3Count, best3Pool.length)

    let remaining = numberOfQuestions - (rankingCount + best3Count)

    while(remaining > 0){

        if(rankingPool.length > rankingCount){
            rankingCount++
        }
        else if(best3Pool.length > best3Count){
            best3Count++
        }
        else{
            break
        }

        remaining--
    }

    const rankingQuestions =
        shuffle(rankingPool).slice(0, rankingCount)

    const best3Questions =
        shuffle(best3Pool).slice(0, best3Count)

    examQuestions = shuffle([
        ...rankingQuestions,
        ...best3Questions
    ])

}



// =======================
// SHUFFLE
// =======================

function shuffle(array){

    let newArray = [...array]

    for(let i=newArray.length-1;i>0;i--){

        const j = Math.floor(Math.random()*(i+1))

        const temp = newArray[i]

        newArray[i] = newArray[j]
        newArray[j] = temp

    }

    return newArray

}



// =======================
// TIMER
// =======================

function startTimer(questionCount){

    if(timerInterval) clearInterval(timerInterval)

    if(questionCount === 0) return

    timeRemaining = Math.round(questionCount * 1.9 * 60)

    const timerDiv = document.getElementById("timer")

    timerInterval = setInterval(()=>{

        timeRemaining--

        const minutes = Math.floor(timeRemaining/60)
        const seconds = timeRemaining % 60

        timerDiv.innerText =
            minutes + ":" + (seconds < 10 ? "0"+seconds : seconds)

        if(timeRemaining <= 0){
            submitExam()
        }

    },1000)

}



// =======================
// RENDER QUESTION
// =======================

export function renderCurrentQuestion(){

    if(!examQuestions[currentQuestionIndex]) return

    const question = examQuestions[currentQuestionIndex]

    const formattedScenario =
        formatReadableText(question.scenario)

    const container = document.getElementById("quiz")

    container.innerHTML = ""


    const header = document.createElement("div")
    header.className = "question-header"

    header.innerHTML =
    `<h3>Question ${currentQuestionIndex+1} of ${examQuestions.length}</h3>`

    container.appendChild(header)


    const flagBtn = document.createElement("button")

    flagBtn.className = "flag-btn"

    flagBtn.innerText =
        flaggedQuestions.has(currentQuestionIndex)
        ? "Unflag"
        : "⚑ Flag for Review"

    flagBtn.onclick = ()=>{

        toggleFlag(currentQuestionIndex)

        renderCurrentQuestion()

    }

    header.appendChild(flagBtn)



    if(question.type === "ranking"){

        renderRankingQuestion(
            container,
            {...question, scenario: formattedScenario},
            currentQuestionIndex
        )

    }

    else if(question.type === "best3"){

        renderBest3Question(
            container,
            {...question, scenario: formattedScenario},
            currentQuestionIndex
        )

    }



    if(currentMode === "learn"){

        const checkBtn = document.createElement("button")

        checkBtn.className = "check-answer-btn"

        checkBtn.innerText = "Check Answer"

        checkBtn.onclick = ()=>showImmediateFeedback()

        container.appendChild(checkBtn)

    }



    updateNavigation(currentQuestionIndex, examQuestions.length)



    const nextBtn = document.getElementById("nextBtn")
    const prevBtn = document.getElementById("prevBtn")

    if(nextBtn){
        nextBtn.disabled =
            currentQuestionIndex === examQuestions.length - 1
    }

    if(prevBtn){
        prevBtn.disabled =
            currentQuestionIndex === 0
    }

}



// =======================
// IMMEDIATE FEEDBACK
// =======================

function showImmediateFeedback(){

    const existing =
        document.querySelector(".immediate-feedback")

    if(existing) existing.remove()

    const question = examQuestions[currentQuestionIndex]

    const userAnswer = userAnswers[currentQuestionIndex]

    if(!userAnswer){
        alert("Please answer the question before checking.")
        return
    }

    const feedback = document.createElement("div")

    feedback.className = "immediate-feedback"

    feedback.innerHTML = `
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

export function saveAnswer(questionIndex, answer){

    userAnswers[questionIndex] = answer

}



// =======================
// NAVIGATION
// =======================

export function goToQuestion(index){

    if(index<0 || index>=examQuestions.length) return

    currentQuestionIndex = index

    renderCurrentQuestion()

}



export function nextQuestion(){

    if(currentQuestionIndex < examQuestions.length-1){

        currentQuestionIndex++

        renderCurrentQuestion()

    }

}



export function previousQuestion(){

    if(currentQuestionIndex > 0){

        currentQuestionIndex--

        renderCurrentQuestion()

    }

}



// =======================
// FLAG TOGGLE
// =======================

export function toggleFlag(questionIndex){

    if(flaggedQuestions.has(questionIndex))
        flaggedQuestions.delete(questionIndex)
    else
        flaggedQuestions.add(questionIndex)

    updateNavigation(currentQuestionIndex, examQuestions.length)

}



// =======================
// SUBMIT EXAM
// =======================

export function submitExam(){

    clearInterval(timerInterval)

    let totalScore = 0
    let maxScore = 0

    incorrectQuestions = []

    examQuestions.forEach((q,i)=>{

        const userAnswer = userAnswers[i]

        let score = 0

        if(q.type === "ranking"){

            maxScore += 20

            if(userAnswer)
                score = scoreRanking(q.answer,userAnswer)

        }

        if(q.type === "best3"){

            maxScore += 12

            if(userAnswer)
                score = scoreBest3(q.answer,userAnswer)

        }

        totalScore += score

        if(score === 0) incorrectQuestions.push(q)

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

    const resultsDiv = document.getElementById("results")

    const examPercent =
        Math.round((score/maxScore)*100)

    resultsDiv.innerHTML = `
        <h2>Exam Results</h2>

        <p><strong>Score:</strong> ${score} / ${maxScore}</p>

        <p><strong>Percentage:</strong> ${examPercent}%</p>

        <button onclick="location.reload()">Start New Practice</button>
    `
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

    const saved =
        JSON.parse(localStorage.getItem("incorrectSJTQuestions"))

    if(!saved || saved.length === 0){

        alert("No incorrect questions saved yet.")

        return

    }

    examQuestions = shuffle(saved)

    userAnswers = {}

    currentQuestionIndex = 0

    startTimer(examQuestions.length)

    renderCurrentQuestion()

}



// =======================
// GETTERS
// =======================

export function getExamQuestions(){
    return examQuestions
}

export function getUserAnswers(){
    return userAnswers
}

export function getFlaggedQuestions(){
    return flaggedQuestions
}
