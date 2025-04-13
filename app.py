from flask import Flask, render_template, request, jsonify

app = Flask(__name__)

game_data = [
     {
        "image": "image1.jpg",
        "question": "Hình dạng của biển báo này là gì?",
        "options": ["Vuông", "Tròn", "Tam giác", "Chữ nhật"],
        "correct": "C",
        "is_about_previous": False
    },
    {
        "image": "image2.png",
        "question": "Hình dạng của biển báo này là gì?",
        "options": ["Tam giác", "Tròn", "Vuông", "Chữ nhật"],
        "correct": "B",
        "is_about_previous": False
    },
    {
        "image": "image3.jpg", 
        "question": "Hình dạng của biển báo trước đó là gì?",
        "options": ["Chữ nhật", "Tròn", "Tam giác", "Vuông"],
        "correct": "B",
        "is_about_previous": True
    },
    {
        "image": "image1.jpg",
        "question": "Màu sắc của biển báo trước đó là gì?",
        "options": ["Xanh dương", "Xanh lá", "Đen", "Đỏ"],
        "correct": "A",
        "is_about_previous": True
    },
    {
        "image": "image3.jpg",
        "question": "Hình dạng của biển báo trước đó là gì?",
        "options": ["Chữ nhật", "Tròn", "Vuông", "Tam giác"], 
        "correct": "D",
        "is_about_previous": True
    },
    {
        "image": "image4.jpeg",
        "question": "Có bao nhiêu người trong hình ảnh này?",
        "options": ["1", "2", "3", "5"],
        "correct": "D",
        "is_about_previous": False
    },
    {
        "image": "image2.png",
        "question": "Dòng chữ trên tường trong hình ảnh trước đó là gì?",
        "options": ["Eureka", "Robotics", "Millennials", "Millennial"],
        "correct": "C",
        "is_about_previous": True
    },
    {
        "image": "image2.png",
        "question": "Hình dạng của biển báo này là gì?",
        "options": ["Tam giác", "Tròn", "Vuông", "Chữ nhật"],
        "correct": "B",
        "is_about_previous": False
    },
    {
        "image": "image5.jpg",
        "question": "Có hoa màu vàng trong hình ảnh này không?",
        "options": ["Có", "Không", "Có thể", "Không chắc"],
        "correct": "A",
        "is_about_previous": False
    },
    {
        "image": "image1.jpg",
        "question": "Có bao nhiêu bông hoa màu đỏ trong hình ảnh trước đó?",
        "options": ["1", "2", "3", "4"],
        "correct": "C",
        "is_about_previous": True
    },
    {
        "image": "image3.jpg",
        "question": "Có bao nhiêu mũi tên hướng lên trong hình ảnh trước đó?",
        "options": ["1", "2", "3", "0"],
        "correct": "A",
        "is_about_previous": True
    },
    {
        "image": "image6_vn.png",
        "question": "Có bao nhiêu màu sắc trong hình ảnh trước đó?",
        "options": ["1", "2", "3", "0"],
        "correct": "B",
        "is_about_previous": True
    },
    {
        "image": "image4.jpeg",
        "question": "Có bao nhiêu từ trong dòng chữ màu xanh trong hình ảnh trước đó?",
        "options": ["5", "6", "7", "8"],
        "correct": "D",
        "is_about_previous": True
    },
    {
        "image": "image8.png",
        "question": "Eureka Robotics đã huy động được bao nhiêu trong vòng gọi vốn series A?",
        "options": ["0.5M USD", "3.0M USD", "10.0M USD", "10.5M USD"],
        "correct": "D",
        "is_about_previous": True
    },
    {
        "image": "image7_vn.png",
        "question": "Bạn có muốn tham gia với chúng tôi không?",
        "options": ["Có", "Không", "Có thể", "Không chắc"],
        "correct": "A",
        "is_about_previous": False
    },
    
    # Add more questions
]

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
    app.run(host='192.168.192.37', port=5041, debug=True)
