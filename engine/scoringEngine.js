// scoringEngine.js


// =======================
// RANKING QUESTION SCORING
// =======================

// Correct answer example:
// ["A","C","E","D","B"]

// User answer example:
// ["A","E","C","D","B"]

// Distance scoring:
// perfect = 4
// distance 1 = 3
// distance 2 = 2
// distance 3 = 1
// distance 4 = 0


export function scoreRanking(correctOrder, userOrder){

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

// correct answers example:
// ["A","C","F"]

// user answers example:
// ["A","F","D"]

// scoring:
// each correct = 4 marks


export function scoreBest3(correctAnswers, userAnswers){

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

        if(!answer) return

        if(q.type === "ranking"){

            totalScore += scoreRanking(q.answer, answer)
            maxScore += 20

        }

        if(q.type === "best3"){

            totalScore += scoreBest3(q.answer, answer)
            maxScore += 12

        }

    })

    return {

        score: totalScore,
        maxScore: maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)

    }

}