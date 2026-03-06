// multiSelectUI.js

import { saveAnswer } from "../engine/examEngine.js"


export function renderBest3Question(container, question, questionIndex){

    const scenario = document.createElement("div")

    scenario.className = "scenario"

    scenario.innerHTML = `
        <h3>Question ${questionIndex + 1}</h3>
        <p>${question.scenario}</p>
        <p><strong>Select the THREE most appropriate actions.</strong></p>
    `

    container.appendChild(scenario)



    const optionsContainer = document.createElement("div")

    optionsContainer.className = "options-container"



    Object.entries(question.options).forEach(([key,value])=>{

        const option = document.createElement("label")

        option.className = "option"

        option.innerHTML = `
            <input type="checkbox" value="${key}" name="q${questionIndex}">
            <span class="option-label">${key}</span>
            <span class="option-text">${value}</span>
        `

        optionsContainer.appendChild(option)

    })



    container.appendChild(optionsContainer)



    const checkboxes = optionsContainer.querySelectorAll("input[type=checkbox]")



    checkboxes.forEach(cb => {

        cb.addEventListener("change",()=>{

            const selected = getSelected(checkboxes)

            // enforce max 3 selections
            if(selected.length > 3){

                cb.checked = false

                alert("You may only select THREE options.")

                return

            }

            saveAnswer(questionIndex, selected)

        })

    })

}



function getSelected(checkboxes){

    const selected = []

    checkboxes.forEach(cb => {

        if(cb.checked){

            selected.push(cb.value)

        }

    })

    return selected

}