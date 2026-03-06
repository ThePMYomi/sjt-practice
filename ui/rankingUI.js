// rankingUI.js

import { saveAnswer } from "../engine/examEngine.js"



export function renderRankingQuestion(container, question, questionIndex){

    const scenario = document.createElement("div")

    scenario.className = "scenario"

    scenario.innerHTML = `
        <h3>Question ${questionIndex + 1}</h3>
        <p>${question.scenario}</p>
        <p><strong>Rank the responses from MOST appropriate (top) to LEAST appropriate (bottom).</strong></p>
    `

    container.appendChild(scenario)



    const list = document.createElement("ul")

    list.id = "rankingList"

    list.className = "ranking-list"



    Object.entries(question.options).forEach(([key,value])=>{

        const item = document.createElement("li")

        item.className = "ranking-item"

        item.dataset.option = key

        item.innerHTML = `
            <span class="option-label">${key}</span>
            <span class="option-text">${value}</span>
        `

        list.appendChild(item)

    })



    container.appendChild(list)



    const instruction = document.createElement("p")

    instruction.innerText = "Drag the options to reorder them."

    container.appendChild(instruction)



    new Sortable(list,{

        animation:150,

        onEnd:function(){

            const answer = getCurrentRanking(list)

            saveAnswer(questionIndex,answer)

        }

    })

}



function getCurrentRanking(list){

    const items = list.querySelectorAll("li")

    const ranking = []

    items.forEach(item=>{

        ranking.push(item.dataset.option)

    })

    return ranking

}