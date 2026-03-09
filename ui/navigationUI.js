import {
    goToQuestion,
    getUserAnswers,
    getFlaggedQuestions
} from "../engine/examEngine.js"


export function updateNavigation(currentIndex, totalQuestions){

    const nav = document.getElementById("navigation")

    if(!nav) return

    const answers = getUserAnswers()

    const flagged = getFlaggedQuestions()

    nav.innerHTML = ""



    for(let i = 0; i < totalQuestions; i++){

        const box = document.createElement("div")

        box.className = "nav-question"

        box.innerText = i + 1



        const isCurrent = i === currentIndex
        const isFlagged = flagged.has(i)
        const isAnswered = answers[i] !== undefined



        // =====================
        // PRIORITY ORDER
        // =====================

        if(isCurrent){

            box.classList.add("current")

        }

        else if(isFlagged){

            box.classList.add("flagged")

        }

        else if(isAnswered){

            box.classList.add("answered")

        }

        else{

            box.classList.add("unanswered")

        }



        // =====================
        // CLICK NAVIGATION
        // =====================

        box.addEventListener("click", () => {

            goToQuestion(i)

        })



        nav.appendChild(box)

    }

}
