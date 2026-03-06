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

    // reset competency buckets

    Object.keys(competencyIndex).forEach(key => {

        competencyIndex[key] = []

    })

    questionBank.forEach(q => {

        // difficulty indexing

        if (q.difficulty === "easy") {

            easyQuestions.push(q)

        }

        else if (q.difficulty === "medium") {

            mediumQuestions.push(q)

        }

        else if (q.difficulty === "hard") {

            hardQuestions.push(q)

        }

        // competency indexing

        if (competencyIndex[q.competency]) {

            competencyIndex[q.competency].push(q)

        }

    })

    console.log("Questions indexed")

}



// =======================
// GENERATE EXAM
// =======================

export function generateExam(difficulty, numberOfQuestions) {

    let pool = []

    if (difficulty === "easy") {

        pool = easyQuestions

    }

    else if (difficulty === "medium") {

        pool = mediumQuestions

    }

    else if (difficulty === "hard") {

        pool = hardQuestions

    }

    else {

        pool = questionBank

    }

    examQuestions = shuffle(pool).slice(0, numberOfQuestions)

    userAnswers = {}

    currentQuestionIndex = 0

    startTimer(numberOfQuestions)

    renderCurrentQuestion()

}



// =======================
// GENERATE COMPETENCY PRACTICE
// =======================

export function generateCompetencyPractice(competency, numberOfQuestions) {

    let pool = competencyIndex[competency] || []

    examQuestions = shuffle(pool).slice(0, numberOfQuestions)

    userAnswers = {}

    currentQuestionIndex = 0

    startTimer(numberOfQuestions)

    renderCurrentQuestion()

}



// =======================
// SHUFFLE QUESTIONS
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
// TIMER SYSTEM
// =======================

function startTimer(questionCount) {

    // ~1.9 minutes per question

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

    if (question.type === "ranking") {

        renderRankingQuestion(container, question, currentQuestionIndex)

    }

    if (question.type === "best3") {

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



// =======================
// SUBMIT EXAM
// =======================

export function submitExam() {

    clearInterval(timerInterval)

    let totalScore = 0
    let maxScore = 0

    examQuestions.forEach((q, i) => {

    const userAnswer = userAnswers[i]

    if (!userAnswer) return

    let score = 0

    if (q.type === "ranking") {

        score = scoreRanking(q.answer, userAnswer)
        maxScore += 20

    }

    if (q.type === "best3") {

        score = scoreBest3(q.answer, userAnswer)
        maxScore += 12

    }

    totalScore += score

    if(score === 0){

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

    const percent = Math.round((score / maxScore) * 100)

    resultsDiv.innerHTML = `

        <h2>Exam Results</h2>

        <p><strong>Score:</strong> ${score} / ${maxScore}</p>

        <p><strong>Percentage:</strong> ${percent}%</p>

        <button id="reviewBtn">Review Questions</button>

        <button onclick="location.reload()">Start New Practice</button>

    `


    // =======================
    // ANALYTICS
    // =======================

    const analytics = calculateAnalytics()

    let analyticsHTML = "<h3>Performance by Competency</h3>"

    Object.entries(analytics).forEach(([comp,data])=>{

        const percent =
            Math.round((data.correct/data.total)*100)

        analyticsHTML += `<p>${comp}: ${percent}%</p>`

    })

    resultsDiv.innerHTML += analyticsHTML


    // review button
    document.getElementById("reviewBtn").onclick = showReview

}


==============


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
// Practice Incorrect Questions
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
// Analytics Function
// =======================


function calculateAnalytics(){

    let stats = {}

    examQuestions.forEach((q,i)=>{

        if(!stats[q.competency]){

            stats[q.competency] = {
                correct:0,
                total:0
            }

        }

        stats[q.competency].total++

        const userAnswer = userAnswers[i]

        if(!userAnswer) return

        let score = 0

        if(q.type === "ranking"){

            score = scoreRanking(q.answer,userAnswer)

        }

        if(q.type === "best3"){

            score = scoreBest3(q.answer,userAnswer)

        }

        if(score > 0){

            stats[q.competency].correct++

        }

    })

    return stats

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