from flask import Flask, render_template, request, jsonify
import random
import os

app = Flask(__name__)

game_data = [
     {
        "image": "image1.jpg",
        "question": "What is the shape of this sign?",
        "options": ["Square", "Circle", "Triangle", "Rectangle"],
        "correct": "C",
        "is_about_previous": False
    },
    {
        "image": "image2.png",
        "question": "What is the shape of this sign?",
        "options": ["Triangle", "Circle", "Square", "Rectangle"],
        "correct": "B",
        "is_about_previous": False
    },
    {
        "image": "image3.jpg", 
        "question": "What was the shape of the previous sign?",
        "options": ["Rectangle", "Circle", "Triangle", "Square"],
        "correct": "B",
        "is_about_previous": True
    },
    {
        "image": "image1.jpg",
        "question": "What is the color of the previous sign?",
        "options": ["Blue", "Green", "Black", "Red"],
        "correct": "A",
        "is_about_previous": True
    },
    {
        "image": "image3.jpg",
        "question": "What was the shape of the previous sign?",
        "options": ["Rectangle", "Circle", "Square", "Triangle"], 
        "correct": "D",
        "is_about_previous": True
    },
    {
        "image": "image4.jpeg",
        "question": "How many people in this image?",
        "options": ["1", "2", "3", "5"],
        "correct": "D",
        "is_about_previous": False
    },
    {
        "image": "image2.png",
        "question": "What is the text on the wall of the previous image?",
        "options": ["Eureka", "Robotics", "Millennials", "Millennial"],
        "correct": "C",
        "is_about_previous": True
    },
    {
        "image": "image2.png",
        "question": "What is the shape of this sign?",
        "options": ["Triangle", "Circle", "Square", "Rectangle"],
        "correct": "B",
        "is_about_previous": False
    },
    {
        "image": "image5.jpg",
        "question": "Are there yellow flowers in this image?",
        "options": ["Yes", "No", "Maybe", "Not sure"],
        "correct": "A",
        "is_about_previous": False
    },
    {
        "image": "image1.jpg",
        "question": "How many red flowers in the previous image?",
        "options": ["1", "2", "3", "4"],
        "correct": "C",
        "is_about_previous": True
    },
    {
        "image": "image3.jpg",
        "question": "How many up arrows in the previous image?",
        "options": ["1", "2", "3", "0"],
        "correct": "A",
        "is_about_previous": True
    },
    {
        "image": "image6.png",
        "question": "How many colors in the previous image?",
        "options": ["1", "2", "3", "0"],
        "correct": "B",
        "is_about_previous": True
    },
    {
        "image": "image4.jpeg",
        "question": "How many words in the blue text in the previous image?",
        "options": ["5", "6", "7", "8"],
        "correct": "D",
        "is_about_previous": True
    },
    {
        "image": "image8.png",
        "question": "How much did Eureka Robotics raise in series A?",
        "options": ["0.5M USD", "3.0M USD", "10.0M USD", "10.5M USD"],
        "correct": "D",
        "is_about_previous": True
    },
    {
        "image": "image7.png",
        "question": "Do you want to join us?",
        "options": ["Yes", "No", "Maybe", "Not sure"],
        "correct": "A",
        "is_about_previous": False
    },
    
    # Add more questions
]

# Ranking system based on score
def get_rank(score):
    if score < 5:
        return "Chicken"
    elif 5 <= score < 10:
        return "Potential"
    elif 10 <= score < 15:
        return "Talent"
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
    app.run(host='192.168.192.37', port=5041, debug=True)
