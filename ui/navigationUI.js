// navigationUI.js

import {
    goToQuestion,
    getUserAnswers,
    getFlaggedQuestions
} from "../engine/examEngine.js"


export function updateNavigation(currentIndex, totalQuestions){

    const nav = document.getElementById("navigation")

    const answers = getUserAnswers()

    const flagged = getFlaggedQuestions()

    nav.innerHTML = ""

    for(let i = 0; i < totalQuestions; i++){

        const box = document.createElement("div")

        box.className = "nav-question"

        box.innerText = i + 1


        // CURRENT QUESTION
        if(i === currentIndex){

            box.classList.add("current")

        }


        // ANSWERED QUESTION
        if(answers[i]){

            box.classList.add("answered")

        }


        // FLAGGED QUESTION
        if(flagged.has(i)){

            box.classList.add("flagged")

        }


        // CLICK NAVIGATION
        box.onclick = () => {

            goToQuestion(i)

        }

        nav.appendChild(box)

    }

}
