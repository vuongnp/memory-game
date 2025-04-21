from flask import Flask, render_template, request, jsonify
import pandas as pd

app = Flask(__name__)

# Load game data from Excel file
try:
    # Read the Excel file
    excel_data = pd.read_excel('static/questions.xlsx')
    
    # Convert Excel data to the required format
    game_data = []
    for _, row in excel_data.iterrows():
        question_item = {
            "image": row["Anh"],
            "question": row["Cau_hoi"],
            "options": [row["A"], row["B"], row["C"], row["D"]],
            "correct": row["Dap_an"],
            "is_about_previous": bool(row["Hoi_cau_truoc_do"])  # Convert to boolean
        }
        game_data.append(question_item)
        
except Exception as e:
    print(f"Error loading questions from Excel: {e}")
    game_data = []


# Ranking system based on score
def get_rank(score):
    if score < 5:
        return "Gà mờ"
    elif 5 <= score < 10:
        return "Tiềm năng"
    elif 10 <= score < 15:
        return "Tài năng"
    else:  # score >= 20
        return "Eureka"

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/get_question', methods=['POST'])
def get_question():
    current_index = int(request.form.get('current_index', 0))
    
    if current_index >= len(game_data):
        score = int(request.form.get('score', 0))
        rank = get_rank(score)
        return jsonify({"game_over": True, "score": score, "rank": rank})
    
    question_data = game_data[current_index]
    return jsonify({
        "image": question_data["image"],
        "question": question_data["question"],
        "options": question_data["options"],
        "is_about_previous": question_data["is_about_previous"]
    })

@app.route('/check_answer', methods=['POST'])
def check_answer():
    current_index = int(request.form.get('current_index', 0))
    selected_answer = request.form.get('answer', '')
    score = int(request.form.get('score', 0))
    
    if current_index < len(game_data):
        correct_answer = game_data[current_index]["correct"]
        is_correct = (selected_answer == correct_answer)
        
        if is_correct:
            return jsonify({
                "correct": True,
                "correct_answer": correct_answer
            })
        else:
            rank = get_rank(score)
            return jsonify({
                "correct": False,
                "correct_answer": correct_answer,
                "game_over": True,
                "final_score": score,
                "rank": rank
            })
    
    return jsonify({"error": "Invalid question index"})

@app.route('/get_correct_answer', methods=['POST'])
def get_correct_answer():
    current_index = int(request.form.get('current_index', 0))
    score = int(request.form.get('score', 0))
    
    if current_index < len(game_data):
        correct_answer = game_data[current_index]["correct"]
        rank = get_rank(score)
        return jsonify({
            "correct_answer": correct_answer,
            "rank": rank
        })
    
    return jsonify({"error": "Invalid question index"})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
