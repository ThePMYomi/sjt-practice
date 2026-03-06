// navigationUI.js

import { goToQuestion, getUserAnswers } from "../engine/examEngine.js"


export function updateNavigation(currentIndex, totalQuestions){

    const nav = document.getElementById("navigation")

    const answers = getUserAnswers()

    nav.innerHTML = ""

    for(let i = 0; i < totalQuestions; i++){

        const box = document.createElement("div")

        box.className = "nav-question"

        box.innerText = i + 1

        // current question
        if(i === currentIndex){

            box.classList.add("current")

        }

        // answered question
        if(answers[i]){

            box.classList.add("answered")

        }

        box.onclick = () => {

            goToQuestion(i)

        }

        nav.appendChild(box)

    }

}