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


    let examInProgress = false


    // =======================
    // START EXAM
    // =======================

    const startBtn = document.getElementById("startBtn")

    if(startBtn){

        startBtn.addEventListener("click", () => {

            const difficulty =
                document.getElementById("difficulty")?.value || "all"

            const questionCount =
                parseInt(document.getElementById("questionCount")?.value || 10)

            const practiceMode =
                document.getElementById("practiceMode")?.value || "exam"

            const competency =
                document.getElementById("competency")?.value || "all"

            const questionType =
                document.getElementById("questionType")?.value || "both"


            // hide start screen
            const startMenu = document.getElementById("startMenu")
            if(startMenu) startMenu.style.display = "none"


            examInProgress = true


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

    }


    // =======================
    // NAVIGATION BUTTONS
    // =======================

    const prevBtn = document.getElementById("prevBtn")

    if(prevBtn){
        prevBtn.addEventListener("click", () => {
            previousQuestion()
        })
    }


    const nextBtn = document.getElementById("nextBtn")

    if(nextBtn){
        nextBtn.addEventListener("click", () => {
            nextQuestion()
        })
    }


    // =======================
    // PRACTICE INCORRECT
    // =======================

    const incorrectBtn = document.getElementById("incorrectBtn")

    if(incorrectBtn){

        incorrectBtn.addEventListener("click", () => {

            const startMenu = document.getElementById("startMenu")
            if(startMenu) startMenu.style.display = "none"

            examInProgress = true

            practiceIncorrect()

        })

    }


    // =======================
    // SUBMIT EXAM
    // =======================

    const submitBtn = document.getElementById("submitBtn")

    if(submitBtn){

        submitBtn.addEventListener("click", () => {

            const confirmSubmit = confirm(
                "Are you sure you want to submit the exam?"
            )

            if(confirmSubmit){

                examInProgress = false

                submitExam()

            }

        })

    }


    // =======================
    // PREVENT ACCIDENTAL REFRESH
    // =======================

    window.addEventListener("beforeunload", function (e) {

        if(!examInProgress) return

        e.preventDefault()

        e.returnValue = ""

    })

})
