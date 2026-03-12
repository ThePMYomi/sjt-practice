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


export function calculateTotalScore(examQuestions, userAnswers){

    let totalScore = 0
    let maxScore = 0

    examQuestions.forEach((q, i) => {

        const answer = userAnswers[i]

        if(q.type === "ranking"){
            maxScore += 20
        }

        if(q.type === "best3"){
            maxScore += 12
        }

        if(!answer) return

        if(q.type === "ranking"){
            totalScore += scoreRanking(q.answer, answer)
        }

        if(q.type === "best3"){
            totalScore += scoreBest3(q.answer, answer)
        }

    })

    return {

        score: totalScore,
        maxScore: maxScore,
        percentage: Math.round((totalScore / maxScore) * 100)

    }

}
