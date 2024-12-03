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

let currentTrial = 0;
let responseTimes = [];
let correctResponses = 0;
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

document.getElementById("finish-experiment").addEventListener("click", () => {
    // Capture user input for name, age, and gender
    const username = document.getElementById("username").value;
    const age = document.getElementById("age").value;  // Can be blank
    const gender = document.getElementById("gender").value;  // Can be blank or one of the options

    // Collect the results (for example, correct responses and average response time)
    const results = {
        correct: correctResponses,
        total: imageDataPart1.length + imageDataPart2.length,
        avgResponseTime: responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length
    };

    // Save all the data including age and gender
    saveData(username, age, gender, results);
});

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

// Shuffle the trials at the start of the experiment
shuffleArray(imageData);

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

    // Log the response time
    responseTimes.push(responseTime);
    
    // Check if the response is correct
    if (selected === trial.correct) {
        correctResponses++;
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

// Show results
function showResults() {
    document.getElementById("instruction-art-section").style.display = "none";
    document.getElementById("result-section").style.display = "block";

    // Display the number of correct responses
    document.getElementById("total-correct").textContent = `Correct Responses: ${correctResponses}/${imageData.length}`;

    // Calculate and display the average response time
    const avgTime = (responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length).toFixed(2);
    document.getElementById("average-response-time").textContent = `Average Response Time: ${avgTime} ms`;
}

// Function to save experiment results to Firebase
function saveData(username, age, gender, results) {
    const timestamp = Date.now();
    const data = {
        username: username,
        age: age || "Not Specified",  // Default to "Not Specified" if no age is provided
        gender: gender || "Not Specified",  // Default to "Unspecified" if no gender is selected
        results: results,
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