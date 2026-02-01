# app.py
from flask import Flask, render_template, request, jsonify
from data import NOUNS, ADJECTIVES, VERBS
from engine import build_sentence

app = Flask(__name__)

@app.route('/')
def index():
    # zaimki osobowe powinny być na górze listy
    pronouns = ["I", "you", "he", "she", "it"]
    all_nouns = sorted(list(NOUNS.keys()))
    common_nouns = [n for n in all_nouns if n not in pronouns]
    subject_nouns = pronouns + common_nouns
    object_nouns = common_nouns

    return render_template('index.html',
                           subject_nouns=subject_nouns,
                           object_nouns=object_nouns,
                           verbs=sorted(list(VERBS.keys())),
                           adjectives=sorted(ADJECTIVES))

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    sentence = build_sentence(data)
    return jsonify({"sentence": sentence})

if __name__ == '__main__':
    app.run(debug=True)