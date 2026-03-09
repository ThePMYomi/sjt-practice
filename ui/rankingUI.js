// rankingUI.js

import { saveAnswer, getUserAnswers } from "../engine/examEngine.js"


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



    // ==========================
    // RESTORE SAVED ORDER
    // ==========================

    const savedAnswers = getUserAnswers()

    const savedRanking = savedAnswers[questionIndex]

    let optionsOrder

    if(savedRanking && Array.isArray(savedRanking)){
        optionsOrder = savedRanking
        list.classList.add("ranking-answered")
    }
    else{
        optionsOrder = Object.keys(question.options)
    }



    // ==========================
    // RENDER OPTIONS
    // ==========================

    optionsOrder.forEach((key)=>{

        const value = question.options[key]

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

    instruction.className = "ranking-instruction"

    instruction.innerText = "Drag the options to reorder them."

    container.appendChild(instruction)



    // ==========================
    // DRAG AND DROP
    // ==========================

    new Sortable(list,{

        animation:150,

        onEnd:function(){

            const answer = getCurrentRanking(list)

            saveAnswer(questionIndex,answer)


            // mark question visually answered
            list.classList.add("ranking-answered")


            // highlight reorder animation
            list.classList.add("ranking-changed")

            setTimeout(()=>{
                list.classList.remove("ranking-changed")
            },600)


            // show confirmation notice
            showRankingNotice(list)

        }

    })

}



// =======================
// GET CURRENT ORDER
// =======================

function getCurrentRanking(list){

    const items = list.querySelectorAll("li")

    const ranking = []

    items.forEach(item=>{
        ranking.push(item.dataset.option)
    })

    return ranking

}



// =======================
// SHOW "ORDER UPDATED"
// =======================

function showRankingNotice(list){

    const existingNotice =
        list.querySelector(".ranking-notice")

    if(existingNotice){
        existingNotice.remove()
    }

    const notice = document.createElement("div")

    notice.className = "ranking-notice"

    notice.innerText = "Order updated ✓"

    list.prepend(notice)

    setTimeout(()=>{
        notice.remove()
    },1000)

}
