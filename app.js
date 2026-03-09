// app.js

import {
    loadQuestionBank,
    generateExam,
    generateCompetencyPractice,
    nextQuestion,
    previousQuestion,
    submitExam,
    practiceIncorrect
} from "./engine/examEngine.js"


// =======================
// INITIALISE APP
// =======================

document.addEventListener("DOMContentLoaded", async () => {

    console.log("Loading question bank...")

    await loadQuestionBank()

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

    showReviewScreen()

})

})



