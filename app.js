// app.js

import {
    loadQuestionBank,
    generateExam,
    generateCompetencyPractice,
    nextQuestion,
    previousQuestion,
    submitExam,
    practiceIncorrect,
    getCompetencyCounts
} from "./engine/examEngine.js"
import { showHistory } from "./ui/historyUI.js"
import { generateWeakAreaPractice } from "./engine/examEngine.js"

// =======================
// INITIALISE APP
// =======================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Loading question bank...")

    await loadQuestionBank()
    updateCompetencyDropdown()

    console.log("App ready")


    // =======================
    // START EXAM
    // =======================

    const startBtn = document.getElementById("startBtn")

    startBtn.addEventListener("click", () => {

        const difficulty =
            document.getElementById("difficulty").value

        const questionCount =
            parseInt(document.getElementById("questionCount").value)

        const practiceMode =
            document.getElementById("practiceMode").value

        const competency =
            document.getElementById("competency").value

        const questionType =
            document.getElementById("questionType").value


        // hide start screen
        document.getElementById("startMenu").style.display = "none"


        if (competency === "all") {

            generateExam(
                difficulty,
                questionCount,
                questionType,
                practiceMode
            )

        }
        else {

            generateCompetencyPractice(
                competency,
                questionCount,
                questionType,
                practiceMode
            )

        }

    })


    // =======================
    // NAVIGATION BUTTONS
    // =======================

    const prevBtn = document.getElementById("prevBtn")

    prevBtn.addEventListener("click", () => {
        previousQuestion()
    })


    const nextBtn = document.getElementById("nextBtn")

    nextBtn.addEventListener("click", () => {
        nextQuestion()
    })


    // =======================
    // PRACTICE INCORRECT
    // =======================

    const incorrectBtn = document.getElementById("incorrectBtn")

    if(incorrectBtn){

        incorrectBtn.addEventListener("click", () => {

            document.getElementById("startMenu").style.display = "none"

            practiceIncorrect()

        })

    }


// =======================
// SUBMIT EXAM
// =======================

const submitBtn = document.getElementById("submitBtn")

submitBtn.addEventListener("click", () => {

    const confirmSubmit = confirm(
        "Are you sure you want to submit the exam?"
    )

    if(confirmSubmit){

        submitExam()

    }

})


// ========================
// Load History Page    
// ======================    
const historyBtn = document.getElementById("historyBtn")

if(historyBtn){

    historyBtn.addEventListener("click",()=>{

        document.getElementById("startMenu").style.display = "none"

        showHistory()

    })

}

//==============================
//LOAD WEAK AREAS
//=========================
const weakBtn =
    document.getElementById("weakPracticeBtn")

if(weakBtn){

    weakBtn.addEventListener("click",()=>{

        document.getElementById("startMenu").style.display = "none"

        generateWeakAreaPractice()

    })

}
    
// =======================
// PREVENT ACCIDENTAL REFRESH
// =======================

let examInProgress = false

// mark exam started
document.getElementById("startBtn").addEventListener("click", () => {
    examInProgress = true
})

// mark exam finished
document.getElementById("submitBtn").addEventListener("click", () => {
    examInProgress = false
})

window.addEventListener("beforeunload", function (e) {

    if(!examInProgress) return

    e.preventDefault()

    e.returnValue = ""

})
    
})


