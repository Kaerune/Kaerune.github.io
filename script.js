// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAEk9Z8o4c9Rcl0Uxlfc-Zba2_W56P5iMg",
    authDomain: "discerning-between-ai-exp.firebaseapp.com",
    databaseURL: "https://discerning-between-ai-exp-default-rtdb.firebaseio.com",
    projectId: "discerning-between-ai-exp",
    storageBucket: "discerning-between-ai-exp.firebasestorage.app",
    messagingSenderId: "159730351162",
    appId: "1:159730351162:web:d7b4256cdb94dd40e20903",
    measurementId: "G-25KHXLFQLG"
  };

// Initialize Firebase
const app = firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Global variables for experiment
let currentTrial = 0;
let responseTimes = [];
let correctResponses = 0;
let startTime;

// Example image data
const imageData = [
    { img1: "images/real1.jpg", img2: "images/ai1.jpg", correct: "image-2" },
    { img1: "images/ai2.jpg", img2: "images/real2.jpg", correct: "image-1" },
    // Add more trials here
];

document.addEventListener("DOMContentLoaded", () => {
    // Event Listeners
    document.getElementById("start-button").addEventListener("click", () => {
        document.getElementById("form-section").style.display = "none";
        document.getElementById("instruction-section").style.display = "block";
    });

    document.getElementById("begin-trials").addEventListener("click", () => {
        document.getElementById("instruction-section").style.display = "none";
        document.getElementById("trial-section").style.display = "block";
        startTrial();
    });

    document.querySelectorAll("#buttons button").forEach((button) => {
        button.addEventListener("click", (e) => {
            handleResponse(e.target.id);
        });
    });

    document.getElementById("finish-experiment").addEventListener("click", () => {
        const username = document.getElementById("username").value || "Anonymous";
        const totalTrials = imageData.length;
        const avgResponseTime = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2);

        saveData(username, correctResponses, totalTrials, avgResponseTime);
    });
});

// Start a trial
function startTrial() {
    if (currentTrial >= imageData.length) {
        showResults();
        return;
    }
    const trial = imageData[currentTrial];
    document.getElementById("image-1").src = trial.img1;
    document.getElementById("image-2").src = trial.img2;
    startTime = performance.now();
}

// Handle responses
function handleResponse(selected) {
    const trial = imageData[currentTrial];
    const endTime = performance.now();
    const responseTime = endTime - startTime;

    responseTimes.push(responseTime);
    if (selected === trial.correct) correctResponses++;

    currentTrial++;
    startTrial();
}

// Save experiment data to Firebase
function saveData(username, correctResponses, totalTrials, avgResponseTime) {
    const data = {
        username: username,
        correctResponses: correctResponses,
        totalTrials: totalTrials,
        avgResponseTime: avgResponseTime,
        timestamp: Date.now()
    };

    db.ref("experiment-results").push(data)
        .then(() => {
            alert("Data saved successfully!");
        })
        .catch((error) => {
            console.error("Error saving data:", error);
        });
}

// Show results
function showResults() {
    document.getElementById("trial-section").style.display = "none";
    document.getElementById("result-section").style.display = "block";

    document.getElementById("total-correct").textContent = `Correct Responses: ${correctResponses}/${imageData.length}`;
    const avgTime = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2);
    document.getElementById("average-response-time").textContent = `Average Response Time: ${avgTime} ms`;
}