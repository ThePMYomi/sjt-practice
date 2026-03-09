// =======================
// RANKING QUESTION SCORING
// =======================

// Correct example:
// ["A","C","E","D","B"]

// User example:
// ["A","E","C","D","B"]

// Distance scoring:
// perfect = 4
// distance 1 = 3
// distance 2 = 2
// distance 3 = 1
// distance 4+ = 0

export function scoreRanking(correctOrder, userOrder){

    if(!Array.isArray(correctOrder) || !Array.isArray(userOrder)){
        return 0
    }

    let score = 0

    correctOrder.forEach((option, correctIndex) => {

        const userIndex = userOrder.indexOf(option)

        if(userIndex === -1) return

        const distance = Math.abs(correctIndex - userIndex)

        const points = Math.max(0, 4 - distance)

        score += points

    })

    return score

}



// =======================
// BEST-3 QUESTION SCORING
// =======================

// Correct example:
// ["A","C","F"]

// User example:
// ["A","F","D"]

// Each correct answer = 4 marks

export function scoreBest3(correctAnswers, userAnswers){

    if(!Array.isArray(correctAnswers) || !Array.isArray(userAnswers)){
        return 0
    }

    let score = 0

    userAnswers.forEach(answer => {

        if(correctAnswers.includes(answer)){
            score += 4
        }

    })

    return score

}



// =======================
// TOTAL EXAM SCORE
// =======================

export function calculateTotalScore(examQuestions, userAnswers){

    let totalScore = 0
    let maxScore = 0

    examQuestions.forEach((q, i) => {

        const answer = userAnswers[i]

        if(q.type === "ranking"){

            maxScore += 20

            if(answer){
                totalScore += scoreRanking(q.answer, answer)
            }

        }

        if(q.type === "best3"){

            maxScore += 12

            if(answer){
                totalScore += scoreBest3(q.answer, answer)
            }

        }

    })

    let percentage = 0

    if(maxScore > 0){
        percentage = Math.round((totalScore / maxScore) * 100)
    }

    return {

        score: totalScore,
        maxScore: maxScore,
        percentage: percentage

    }

}
