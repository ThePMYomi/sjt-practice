// examEngine.js

import { scoreRanking, scoreBest3 } from "./scoringEngine.js"
import { renderRankingQuestion } from "../ui/rankingUI.js"
import { renderBest3Question } from "../ui/multiSelectUI.js"
import { updateNavigation } from "../ui/navigationUI.js"

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



export async function loadQuestionBank(){

    const response = await fetch("./data/questions.json")

    questionBank = await response.json()

    indexQuestions()

}



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

    startTimer(examQuestions.length)

    renderCurrentQuestion()

}



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

    startTimer(examQuestions.length)

    renderCurrentQuestion()

}



function buildQuestionSet(pool, numberOfQuestions, questionType){

    let rankingPool = pool.filter(q=>q.type === "ranking")
    let best3Pool = pool.filter(q=>q.type === "best3")

    if(questionType === "ranking"){

        examQuestions =
            shuffle(rankingPool).slice(0, numberOfQuestions)

    }

    else if(questionType === "best3"){

        examQuestions =
            shuffle(best3Pool).slice(0, numberOfQuestions)

    }

    else{

        let rankingCount = Math.round(numberOfQuestions * 0.7)

        let best3Count = numberOfQuestions - rankingCount

        const rankingQuestions =
            shuffle(rankingPool).slice(0, rankingCount)

        const best3Questions =
            shuffle(best3Pool).slice(0, best3Count)

        examQuestions = [
            ...rankingQuestions,
            ...best3Questions
        ]

    }

}



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



function startTimer(questionCount){

    if(timerInterval) clearInterval(timerInterval)

    timeRemaining = Math.round(questionCount * 1.9 * 60)

    const timerDiv = document.getElementById("timer")

    timerInterval = setInterval(()=>{

        timeRemaining--

        const minutes = Math.floor(timeRemaining/60)
        const seconds = timeRemaining % 60

        if(timerDiv){
            timerDiv.innerText =
                minutes + ":" + (seconds < 10 ? "0"+seconds : seconds)
        }

        if(timeRemaining <= 0){
            submitExam()
        }

    },1000)

}



export function renderCurrentQuestion(){

    if(!examQuestions[currentQuestionIndex]) return

    const question = examQuestions[currentQuestionIndex]

    const container = document.getElementById("quiz")

    container.innerHTML = ""



    const header = document.createElement("div")
    header.className = "question-header"

    header.innerHTML =
    `<h3>Question ${currentQuestionIndex+1} of ${examQuestions.length}</h3>`

    container.appendChild(header)



    if(question.type === "ranking"){
        renderRankingQuestion(container, question, currentQuestionIndex)
    }

    else if(question.type === "best3"){
        renderBest3Question(container, question, currentQuestionIndex)
    }



    updateNavigation(currentQuestionIndex, examQuestions.length)

}



export function saveAnswer(questionIndex, answer){

    userAnswers[questionIndex] = answer

}



export function goToQuestion(index){

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



export function submitExam(){

    clearInterval(timerInterval)

    alert("Exam submitted!")

}



export function practiceIncorrect(){

    alert("Practice incorrect questions feature coming soon.")

}



export function getExamQuestions(){
    return examQuestions
}

export function getUserAnswers(){
    return userAnswers
}

export function getFlaggedQuestions(){
    return flaggedQuestions
}
