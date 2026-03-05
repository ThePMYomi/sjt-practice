let questions = [];
let selectedQuestions = [];
let time = 600;

async function loadQuestions(){
 const response = await fetch("questions.csv");
 const data = await response.text();

 const rows = data.split("\n").slice(1);

 questions = rows.map(row=>{
  const cols = row.split(",");
  return {
   id: cols[0],
   question: cols[1],
   options: [cols[2],cols[3],cols[4],cols[5]],
   answer: cols[6],
   rationale: cols[7]
  }
 });
}

function randomQuestions(n){
 return [...questions].sort(()=>0.5-Math.random()).slice(0,n);
}

function startQuiz(){
 selectedQuestions = randomQuestions(10);
 renderQuestions();
 startTimer();
}

function renderQuestions(){
 const quizDiv = document.getElementById("quiz");
 quizDiv.innerHTML="";

 selectedQuestions.forEach((q,i)=>{
  let html=`<div class="question">
  <p>${i+1}. ${q.question}</p>`;

  q.options.forEach((opt,j)=>{
   const letter=["A","B","C","D"][j];
   html+=`
   <label>
   <input type="radio" name="q${i}" value="${letter}">
   ${opt}
   </label><br>`;
  });

  html+="</div>";

  quizDiv.innerHTML+=html;
 });
}

function startTimer(){
 const timerDiv=document.getElementById("timer");

 const interval=setInterval(()=>{
  time--;
  timerDiv.innerText="Time: "+time+"s";

  if(time<=0){
   clearInterval(interval);
   submitQuiz();
  }
 },1000);
}

function submitQuiz(){

 let score=0;
 const resultsDiv=document.getElementById("results");
 resultsDiv.innerHTML="<h2>Results</h2>";

 selectedQuestions.forEach((q,i)=>{

  const answer=document.querySelector(`input[name="q${i}"]:checked`);
  const userAnswer=answer?answer.value:"None";

  if(userAnswer===q.answer) score++;

  resultsDiv.innerHTML+=`
  <p>
  <b>${i+1}. ${q.question}</b><br>
  Your answer: ${userAnswer}<br>
  Correct answer: ${q.answer}<br>
  Rationale: ${q.rationale}
  </p>
  <hr>
  `;
 });

 resultsDiv.innerHTML=`<h2>Score: ${score}/${selectedQuestions.length}</h2>`+resultsDiv.innerHTML;

}

loadQuestions();