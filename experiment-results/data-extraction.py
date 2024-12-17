import json
from collections import defaultdict

# Function to calculate numCorrect based on the refined rules
def calculate_correct_based_on_choice(trial, correct_type, selected_type):
    # Default to 2 for correct answers
    if trial.get("isCorrect", False):
        return 2

    # Logic for incorrect answers
    choice_penalty_map = {
        "AwithA": {"HwithH": 0, "AwithH": 1, "HwithA": 1},
        "HwithH": {"AwithA": 0, "AwithH": 1, "HwithA": 1},
        "AwithH": {"AwithA": 1, "HwithH": 1, "HwithA": 0},
        "HwithA": {"AwithA": 1, "HwithH": 1, "AwithH": 0},
    }

    # Return the penalty score based on the mismatch
    return choice_penalty_map.get(correct_type, {}).get(selected_type, 0)

# Mapping for choiceType
choice_type_map = {
    "all-ai": "AwithA",
    "no-ai": "HwithH",
    "image-1": "AwithH",
    "image-2": "HwithA",
}

# Function to process the data
def process_experiment_results(data):
    final_results = []

    # Iterate through each participant's data
    for participant_id, participant_data in data.get("experiment-results", {}).items():
        username = participant_data.get("username", "Unknown")
        trial_details = participant_data.get("trialDetails", [])
        
        # Default structure for 8 combinations
        section_data = {
            "Realistic": {choice: {"correct": 0, "response_times": []} for choice in choice_type_map.values()},
            "Artistic": {choice: {"correct": 0, "response_times": []} for choice in choice_type_map.values()}
        }
        
        # Process each trial detail
        for trial in trial_details:
            section = trial.get("section", "")
            selected = trial.get("selected", "")
            correct_choice = trial.get("correct", "")
            response_time = trial.get("responseTime", 0)

            # Map selected and correct to choiceType
            selected_type = choice_type_map.get(selected, "Unknown")
            correct_type = choice_type_map.get(correct_choice, "Unknown")
            
            # Update the correct count and response times
            if section in section_data:
                section_data[section][correct_type]["correct"] += calculate_correct_based_on_choice(
                    trial, correct_type, selected_type
                )
                section_data[section][correct_type]["response_times"].append(response_time)

        # Compile results ensuring 8 entries per participant
        for section, choices in section_data.items():
            for choice_type, stats in choices.items():
                num_correct = stats["correct"]
                avg_response_time = (
                    sum(stats["response_times"]) / 2 if stats["response_times"] else 0
                )
                final_results.append(
                    f"{username} {choice_type} {section.lower()} {num_correct} {avg_response_time:.2f}"
                )
    
    return final_results

# Save the results to a file
def save_results_to_file(results, output_file_path):
    with open(output_file_path, "w") as output_file:
        output_file.write("\n".join(results))

# Main logic
if __name__ == "__main__":
    # Load the JSON file
    file_path = "C:/Users/grego/Downloads/experiment-results/discerning-between-ai-exp-default-rtdb-export.json"
    with open(file_path, "r") as file:
        data = json.load(file)
    
    # Process the data
    final_refined_results = process_experiment_results(data)
    
    # Save to a file
    output_file_path = "C:/Users/grego/Downloads/experiment-results/refined_experiment_results_with_response_time.txt"
    save_results_to_file(final_refined_results, output_file_path)
    print(f"Results saved to {output_file_path}")