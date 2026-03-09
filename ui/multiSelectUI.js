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
        <h3>Question ${questionIndex + 1}</h3>
        <p>${question.scenario}</p>
        <p><strong>Select the THREE most appropriate actions.</strong></p>
    `

    container.appendChild(scenario)



    // =====================
    // OPTIONS CONTAINER
    // =====================

    const optionsDiv = document.createElement("div")

    optionsDiv.className = "options-container"



    Object.entries(question.options).forEach(([key,value])=>{

        const label = document.createElement("label")

        label.className = "option"



        const checkbox = document.createElement("input")

        checkbox.type = "checkbox"

        checkbox.value = key



        const text = document.createElement("span")

        text.innerHTML = `<strong>${key}</strong> — ${value}`



        // =====================
        // RESTORE SAVED ANSWERS
        // =====================

        if(savedAnswer.includes(key)){

            checkbox.checked = true

            label.classList.add("selected-option")

        }



        // =====================
        // CLICK BEHAVIOUR
        // =====================

        checkbox.addEventListener("change",()=>{

            const selected =
                [...optionsDiv.querySelectorAll("input:checked")]



            // enforce max 3 selections
            if(selected.length > 3){

                checkbox.checked = false

                alert("You may only select THREE options.")

                return

            }



            const answer =
                selected.map(cb=>cb.value)

            saveAnswer(questionIndex,answer)



            // =====================
            // UPDATE VISUAL STATES
            // =====================

            optionsDiv.querySelectorAll(".option")
            .forEach(opt=>opt.classList.remove("selected-option"))



            selected.forEach(cb=>{
                cb.closest(".option").classList.add("selected-option")
            })

        })



        label.appendChild(checkbox)

        label.appendChild(text)

        optionsDiv.appendChild(label)

    })



    container.appendChild(optionsDiv)

}
