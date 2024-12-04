import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import { getDatabase, ref, set } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAEk9Z8o4c9Rcl0Uxlfc-Zba2_W56P5iMg",
    authDomain: "discerning-between-ai-exp.firebaseapp.com",
    databaseURL: "https://discerning-between-ai-exp-default-rtdb.firebaseio.com",
    projectId: "discerning-between-ai-exp",
    storageBucket: "discerning-between-ai-exp.firebasestorage.app",
    messagingSenderId: "159730351162",
    appId: "1:159730351162:web:d7b4256cdb94dd40e20903",
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

let avgTimePart1 = 0;
let avgTimePart2 = 0;

let currentTrial = 0;
let responseTimesPart1 = [];
let responseTimesPart2 = [];
let correctResponsesPart1 = 0;
let correctResponsesPart2 = 0;
let trialResults = []; // Array to store detailed results for all trials
let startTime;

// Divide trials into two sections
const imageDataPart1 = [
    { img1: "images/real1.jpg", img2: "images/ai1.jpg", correct: "image-2" },
    { img1: "images/real2.jpg", img2: "images/ai2.jpg", correct: "image-2" },
    { img1: "images/ai3.jpg", img2: "images/real3.jpg", correct: "image-1" },
    { img1: "images/ai4.jpg", img2: "images/real4.jpg", correct: "image-1" },
    { img1: "images/ai9.jpg", img2: "images/ai10.jpg", correct: "all-ai" },
    { img1: "images/ai11.jpg", img2: "images/ai12.jpg", correct: "all-ai" },
    { img1: "images/real9.jpg", img2: "images/real10.jpg", correct: "no-ai" },
    { img1: "images/real11.jpg", img2: "images/real12.jpg", correct: "no-ai" }
];

const imageDataPart2 = [
    { img1: "images/real5.jpg", img2: "images/ai5.jpg", correct: "image-2" },
    { img1: "images/real6.jpg", img2: "images/ai6.jpg", correct: "image-2" },
    { img1: "images/ai7.jpg", img2: "images/real7.jpg", correct: "image-1" },
    { img1: "images/ai8.jpg", img2: "images/real8.jpg", correct: "image-1" },
    { img1: "images/ai13.jpg", img2: "images/ai14.jpg", correct: "all-ai" },
    { img1: "images/ai15.jpg", img2: "images/ai16.jpg", correct: "all-ai" },
    { img1: "images/real13.jpg", img2: "images/real14.jpg", correct: "no-ai" },
    { img1: "images/real15.jpg", img2: "images/real16.jpg", correct: "no-ai" }
];

// Shuffle the trials before the start of the experiment
shuffleArray(imageDataPart1);
shuffleArray(imageDataPart2);

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

let currentImageData = imageDataPart1;

document.getElementById("begin-art-trials").addEventListener("click", () => {
    document.getElementById("instruction-art-section").style.display = "none";
    document.getElementById("trial-section").style.display = "block";
    currentTrial = 0; // Reset trial counter
    currentImageData = imageDataPart2; // Switch to the second set of trials
    startTrial();
});

document.querySelectorAll("#buttons button").forEach((button) => {
    button.addEventListener("click", (e) => {
        handleResponse(e.target.id);
    });
});

// Function to shuffle the array (Fisher-Yates shuffle)
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Start a trial
function startTrial() {
    if (currentTrial >= currentImageData.length) {
        if (currentImageData === imageDataPart1) {
            showArtInstructions();
        } else {
            showResults();
        }
        return;
    }

    // Get the current trial
    const trial = currentImageData[currentTrial];

    // Set the images for the trial
    document.getElementById("image-1").style.height = "300px";
    document.getElementById("image-1").style.width = "300px";
    document.getElementById("image-2").style.height = "300px";
    document.getElementById("image-2").style.width = "300px";
    document.getElementById("image-1").src = trial.img1;
    document.getElementById("image-2").src = trial.img2;

    // Record the start time for this trial
    startTime = performance.now();
}

// Handle responses
function handleResponse(selected) {
    const trial = currentImageData[currentTrial];
    const endTime = performance.now();
    const responseTime = endTime - startTime;
    const isCorrect = selected === trial.correct;

    // Store response details
    trialResults.push({
        trialNumber: currentTrial + 1,
        section: currentTrial < imageDataPart1.length ? "Realistic" : "Art",
        selected: selected,
        correct: trial.correct,
        isCorrect: isCorrect,
        responseTime: responseTime,
    });
    
    // Log the response time and if the response was correct
    if (currentImageData === imageDataPart1) {
        responseTimesPart1.push(responseTime);
        if (selected === trial.correct) correctResponsesPart1++;
    } else if (currentImageData === imageDataPart2) {
        responseTimesPart2.push(responseTime);
        if (selected === trial.correct) correctResponsesPart2++;
    }

    // Move to the next trial
    currentTrial++;

    // Start the next trial
    startTrial();
}

// Show art instructions
function showArtInstructions() {
    document.getElementById("trial-section").style.display = "none";
    document.getElementById("instruction-art-section").style.display = "block";
}

// Show results for both sections in the same result-section
function showResults() {
    document.getElementById("trial-section").style.display = "none";
    document.getElementById("result-section").style.display = "block";

    // Realistic Section Results
    avgTimePart1 = (responseTimesPart1.reduce((a, b) => a + b, 0) / responseTimesPart1.length).toFixed(2);
    document.getElementById("realistic-results").innerHTML = `
        <h3>Realistic Images Section</h3>
        <p>Correct Responses: ${correctResponsesPart1}/${imageDataPart1.length}</p>
        <p>Average Response Time: ${avgTimePart1} ms</p>
    `;

    // Art Section Results
    avgTimePart2 = (responseTimesPart2.reduce((a, b) => a + b, 0) / responseTimesPart2.length).toFixed(2);
    document.getElementById("art-results").innerHTML = `
        <h3>Artistic Images Section</h3>
        <p>Correct Responses: ${correctResponsesPart2}/${imageDataPart2.length}</p>
        <p>Average Response Time: ${avgTimePart2} ms</p>
    `;
}

document.getElementById("finish-experiment").addEventListener("click", () => {
    // Capture user input for name, age, and gender
    const username = document.getElementById("username").value;
    const age = document.getElementById("age").value;  // Can be blank
    const gender = document.getElementById("gender").value;  // Can be blank or one of the options

    // Prepare and save results
    const results = {
        realistic: {
            correct: correctResponsesPart1,
            total: imageDataPart1.length,
            avgResponseTime: avgTimePart1,
        },
        art: {
            correct: correctResponsesPart2,
            total: imageDataPart2.length,
            avgResponseTime: avgTimePart2,
        },
    };

    // Save all the data including age and gender
    saveData(username, age, gender, results);
});

// Function to save experiment results to Firebase
function saveData(username, age, gender, results) {
    const timestamp = Date.now();
    const data = {
        username: username,
        age: age || "Not Specified",  // Default to "Not Specified" if no age is provided
        gender: gender || "Not Specified",  // Default to "Unspecified" if no gender is selected
        results: results,
        trialDetails: trialResults, // Include detailed trial data
        timestamp: timestamp
    };

    // Define the reference where data will be saved
    const dataRef = ref(database, 'experiment-results/' + timestamp);

    // Save the data to the reference
    set(dataRef, data)
        .then(() => {
            document.getElementById("result-section").style.display = "none";
            document.getElementById("thank-you-message").style.display = "block";
        })
        .catch((error) => {
            console.error("Error saving data:", error);
        });
}