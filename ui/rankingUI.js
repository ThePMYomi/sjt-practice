import { saveAnswer, getUserAnswers } from "../engine/examEngine.js"


export function renderRankingQuestion(container, question, questionIndex){

    const answers = getUserAnswers()

    const savedRanking = answers[questionIndex]


    // ==========================
    // SCENARIO
    // ==========================

    const scenario = document.createElement("div")

    scenario.className = "scenario"

    scenario.innerHTML = `
        <h3>Question ${questionIndex + 1}</h3>
        <p>${question.scenario}</p>
        <p><strong>Rank the responses from MOST appropriate (top) to LEAST appropriate (bottom).</strong></p>
    `

    container.appendChild(scenario)



    // ==========================
    // RANKING LIST
    // ==========================

    const list = document.createElement("ul")

    list.className = "ranking-list"



    // ==========================
    // RESTORE SAVED ORDER
    // ==========================

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



    // ==========================
    // INSTRUCTION TEXT
    // ==========================

    const instruction = document.createElement("p")

    instruction.className = "ranking-instruction"

    instruction.innerText = "Drag the options to reorder them."

    container.appendChild(instruction)



    // ==========================
    // NOTICE CONTAINER
    // ==========================

    const notice = document.createElement("div")

    notice.className = "ranking-notice"

    notice.style.display = "none"

    container.appendChild(notice)



    // ==========================
    // DRAG AND DROP
    // ==========================

    new Sortable(list,{

        animation:150,

        ghostClass:"ranking-ghost",

        onEnd:function(){

            const answer = getCurrentRanking(list)

            saveAnswer(questionIndex,answer)


            // mark visually answered
            list.classList.add("ranking-answered")


            // animation highlight
            list.classList.add("ranking-changed")

            setTimeout(()=>{

                list.classList.remove("ranking-changed")

            },600)


            // show update notice
            showRankingNotice(notice)

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
// SHOW NOTICE
// =======================

function showRankingNotice(notice){

    notice.innerText = "Order updated ✓"

    notice.style.display = "block"

    setTimeout(()=>{

        notice.style.display = "none"

    },1200)

}
