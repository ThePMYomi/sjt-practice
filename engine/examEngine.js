// examEngine.js

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
// LOAD QUESTION BANK
// =======================

export async function loadQuestionBank() {

    const response = await fetch("./data/questions.json")

    questionBank = await response.json()

    console.log("Questions loaded:", questionBank.length)

    indexQuestions()

}



// =======================
// INDEX QUESTIONS
// =======================

function indexQuestions() {

    easyQuestions = []
    mediumQuestions = []
    hardQuestions = []

    Object.keys(competencyIndex).forEach(key => {
        competencyIndex[key] = []
    })

    questionBank.forEach(q => {

        if (q.difficulty === "easy") {
            easyQuestions.push(q)
        }
        else if (q.difficulty === "medium") {
            mediumQuestions.push(q)
        }
        else if (q.difficulty === "hard") {
            hardQuestions.push(q)
        }

        if (competencyIndex[q.competency]) {
            competencyIndex[q.competency].push(q)
        }

    })

}



// =======================
// GENERATE EXAM
// =======================

export function generateExam(difficulty, numberOfQuestions, questionType) {

    let pool = []

    if (difficulty === "easy") pool = easyQuestions
    else if (difficulty === "medium") pool = mediumQuestions
    else if (difficulty === "hard") pool = hardQuestions
    else pool = questionBank


    let rankingPool = pool.filter(q => q.type === "ranking")
    let best3Pool = pool.filter(q => q.type === "best3")


    if (questionType === "ranking") {

        examQuestions = shuffle(rankingPool).slice(0, numberOfQuestions)

    }

    else if (questionType === "best3") {

        examQuestions = shuffle(best3Pool).slice(0, numberOfQuestions)

    }

else {

    // REALISTIC DISTRIBUTION
    // 70% ranking, 30% best3

    let rankingCount =
        Math.round(numberOfQuestions * 0.7)

    let best3Count =
        numberOfQuestions - rankingCount


    // Prevent requesting more questions than available

    rankingCount = Math.min(rankingCount, rankingPool.length)
    best3Count = Math.min(best3Count, best3Pool.length)


    const rankingQuestions =
        shuffle(rankingPool).slice(0, rankingCount)

    const best3Questions =
        shuffle(best3Pool).slice(0, best3Count)


    // Ranking questions must come first

    examQuestions = [
        ...rankingQuestions,
        ...best3Questions
    ]

}


    userAnswers = {}

    currentQuestionIndex = 0

    startTimer(numberOfQuestions)

    renderCurrentQuestion()

}



// =======================
// COMPETENCY PRACTICE
// =======================

export function generateCompetencyPractice(
    competency,
    numberOfQuestions,
    questionType
) {

    let pool = competencyIndex[competency] || []

    let rankingPool = pool.filter(q => q.type === "ranking")
    let best3Pool = pool.filter(q => q.type === "best3")


    if (questionType === "ranking") {

        examQuestions =
            shuffle(rankingPool).slice(0, numberOfQuestions)

    }

    else if (questionType === "best3") {

        examQuestions =
            shuffle(best3Pool).slice(0, numberOfQuestions)

    }

else {

    let rankingCount =
        Math.round(numberOfQuestions * 0.7)

    let best3Count =
        numberOfQuestions - rankingCount


    rankingCount = Math.min(rankingCount, rankingPool.length)
    best3Count = Math.min(best3Count, best3Pool.length)


    const rankingQuestions =
        shuffle(rankingPool).slice(0, rankingCount)

    const best3Questions =
        shuffle(best3Pool).slice(0, best3Count)


    examQuestions = [
        ...rankingQuestions,
        ...best3Questions
    ]

}

    userAnswers = {}

    currentQuestionIndex = 0

    startTimer(numberOfQuestions)

    renderCurrentQuestion()

}



// =======================
// SHUFFLE
// =======================

function shuffle(array) {

    let newArray = [...array]

    for (let i = newArray.length - 1; i > 0; i--) {

        const j = Math.floor(Math.random() * (i + 1))

        const temp = newArray[i]
        newArray[i] = newArray[j]
        newArray[j] = temp

    }

    return newArray

}



// =======================
// TIMER
// =======================

function startTimer(questionCount) {

    timeRemaining = Math.round(questionCount * 1.9 * 60)

    const timerDiv = document.getElementById("timer")

    timerInterval = setInterval(() => {

        timeRemaining--

        const minutes = Math.floor(timeRemaining / 60)
        const seconds = timeRemaining % 60

        timerDiv.innerText =
            minutes + ":" + (seconds < 10 ? "0" + seconds : seconds)

        if (timeRemaining <= 0) {
            submitExam()
        }

    }, 1000)

}



// =======================
// RENDER QUESTION
// =======================

export function renderCurrentQuestion() {

    const question = examQuestions[currentQuestionIndex]

    const container = document.getElementById("quiz")

    container.innerHTML = ""

    const header = document.createElement("div")
    header.className = "question-header"

    header.innerHTML =
    `<h3>Question ${currentQuestionIndex + 1} of ${examQuestions.length}</h3>`

    container.appendChild(header)

    const flagBtn = document.createElement("button")

    flagBtn.className = "flag-btn"
    
    flagBtn.innerText =
    flaggedQuestions.has(currentQuestionIndex)
    ? "Unflag"
    : "⚑ Flag for Review"
    
    flagBtn.onclick = () => {
    
        toggleFlag(currentQuestionIndex)
    
        renderCurrentQuestion()
    
    }
    
    header.appendChild(flagBtn)

    if (question.type === "ranking") {

        renderRankingQuestion(container, question, currentQuestionIndex)

    }
    else if (question.type === "best3") {

        renderBest3Question(container, question, currentQuestionIndex)

    }

    updateNavigation(currentQuestionIndex, examQuestions.length)

}



// =======================
// SAVE ANSWER
// =======================

export function saveAnswer(questionIndex, answer) {
    userAnswers[questionIndex] = answer
}



// =======================
// NAVIGATION
// =======================

export function goToQuestion(index) {

    if (index < 0 || index >= examQuestions.length) return

    currentQuestionIndex = index

    renderCurrentQuestion()

}

export function nextQuestion() {

    if (currentQuestionIndex < examQuestions.length - 1) {
        currentQuestionIndex++
        renderCurrentQuestion()
    }

}

export function previousQuestion() {

    if (currentQuestionIndex > 0) {
        currentQuestionIndex--
        renderCurrentQuestion()
    }

}

//==========================
// FLAG TOGGLE
// =======================

export function toggleFlag(questionIndex){

    if(flaggedQuestions.has(questionIndex)){
        flaggedQuestions.delete(questionIndex)
    }
    else{
        flaggedQuestions.add(questionIndex)
    }

    updateNavigation(currentQuestionIndex, examQuestions.length)

}

// =======================
// SUBMIT EXAM
// =======================

export function submitExam() {

    clearInterval(timerInterval)

    let totalScore = 0
    let maxScore = 0

    incorrectQuestions = []

    examQuestions.forEach((q, i) => {

        const userAnswer = userAnswers[i]

        let score = 0

        if (q.type === "ranking") {

            maxScore += 20

            if (userAnswer) {
                score = scoreRanking(q.answer, userAnswer)
            }

        }

        if (q.type === "best3") {

            maxScore += 12

            if (userAnswer) {
                score = scoreBest3(q.answer, userAnswer)
            }

        }

        totalScore += score

        if (score === 0) {
            incorrectQuestions.push(q)
        }

    })

    localStorage.setItem(
        "incorrectSJTQuestions",
        JSON.stringify(incorrectQuestions)
    )

    showResults(totalScore, maxScore)

}



// =======================
// SHOW RESULTS
// =======================

function showResults(score, maxScore){

    const resultsDiv = document.getElementById("results")

    const examPercent = Math.round((score / maxScore) * 100)

    resultsDiv.innerHTML = `
        <h2>Exam Results</h2>

        <p><strong>Score:</strong> ${score} / ${maxScore}</p>

        <p><strong>Percentage:</strong> ${examPercent}%</p>

        <button id="reviewBtn">Review Questions</button>

        <button onclick="location.reload()">Start New Practice</button>
    `


    // ANALYTICS

    const analytics = calculateAnalytics()

    let analyticsHTML = "<h3>Performance by Competency</h3>"

    Object.entries(analytics).forEach(([comp,data])=>{

        const competencyPercent =
            data.max
            ? Math.round((data.earned / data.max) * 100)
            : 0

        analyticsHTML += `
        <div class="competency-row">
            <div class="competency-label">${comp} (${competencyPercent}%)</div>
            <div class="competency-bar">
                <div class="competency-fill" style="width:${competencyPercent}%"></div>
            </div>
        </div>
        `

    })

    resultsDiv.innerHTML += analyticsHTML

    document.getElementById("reviewBtn").onclick = showReview

}



// =======================
// ANALYTICS
// =======================

function calculateAnalytics(){

    let stats = {}

    examQuestions.forEach((q,i)=>{

        if(!stats[q.competency]){
            stats[q.competency] = {
                earned:0,
                max:0
            }
        }

        const userAnswer = userAnswers[i]

        let earnedPoints = 0
        let maxPoints = 0

        if(q.type === "ranking"){

            maxPoints = 20

            if(userAnswer){
                earnedPoints = scoreRanking(q.answer,userAnswer)
            }

        }

        if(q.type === "best3"){

            maxPoints = 12

            if(userAnswer){
                earnedPoints = scoreBest3(q.answer,userAnswer)
            }

        }

        stats[q.competency].earned += earnedPoints
        stats[q.competency].max += maxPoints

    })

    return stats

}



// =======================
// REVIEW QUESTIONS
// =======================

function showReview(){

    const quiz = document.getElementById("quiz")

    quiz.innerHTML = "<h2>Review Questions</h2>"

    examQuestions.forEach((q,i)=>{

        const userAnswer = userAnswers[i]

        let html = `<div class="review-question">`

        html += `<p><strong>Scenario:</strong> ${q.scenario}</p>`

        html += `<p><strong>Options:</strong></p><ul>`

        Object.entries(q.options).forEach(([key,val])=>{
            html += `<li><b>${key}</b> — ${val}</li>`
        })

        html += `</ul>`

        html += `<p><strong>Your Answer:</strong> ${formatAnswer(userAnswer)}</p>`

        html += `<p><strong>Correct Answer:</strong> ${formatAnswer(q.answer)}</p>`

        html += `<p class="explanation"><strong>Explanation:</strong> ${q.explanation}</p>`

        html += `</div>`

        quiz.innerHTML += html

    })

}



function formatAnswer(answer){

    if(!answer) return "No answer given"

    if(Array.isArray(answer)){
        return answer.join(", ")
    }

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

export function getExamQuestions() {
    return examQuestions
}

export function getUserAnswers() {
    return userAnswers
}


