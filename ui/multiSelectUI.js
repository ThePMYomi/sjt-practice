// multiSelectUI.js

import { saveAnswer, getUserAnswers } from "../engine/examEngine.js"

export function renderBest3Question(container, question, questionIndex){

    const answers = getUserAnswers()

    const savedAnswer = answers[questionIndex] || []


    // =====================
    // SCENARIO
    // =====================

    const scenario = document.createElement("div")

    scenario.className = "scenario"

    scenario.innerHTML = `
        <p>${question.scenario}</p>
        <p><strong>Select the THREE most appropriate actions.</strong></p>
    `

    container.appendChild(scenario)


    // =====================
    // OPTIONS
    // =====================

    const optionsDiv = document.createElement("div")

    optionsDiv.className = "best3-options"


    Object.entries(question.options).forEach(([key,value])=>{

        const label = document.createElement("label")

        label.className = "best3-option"


        const checkbox = document.createElement("input")

        checkbox.type = "checkbox"

        checkbox.value = key


        // Restore previous answers
        if(savedAnswer.includes(key)){
            checkbox.checked = true
            label.classList.add("selected-option")
        }


        checkbox.addEventListener("change",()=>{

            const selected =
                [...optionsDiv.querySelectorAll("input:checked")]

            if(selected.length > 3){

                checkbox.checked = false

                alert("You may only select THREE options.")

                return

            }


            const answer =
                selected.map(cb=>cb.value)

            saveAnswer(questionIndex,answer)


            // highlight selected

            optionsDiv.querySelectorAll(".best3-option")
            .forEach(opt=>opt.classList.remove("selected-option"))

            selected.forEach(cb=>{
                cb.parentElement.classList.add("selected-option")
            })

        })


        // safer way to add text (does not rebuild DOM)
        const text = document.createElement("span")
        text.innerHTML = `<strong>${key}</strong> — ${value}`

        label.appendChild(checkbox)
        label.appendChild(text)

        optionsDiv.appendChild(label)

    })


    container.appendChild(optionsDiv)

}
