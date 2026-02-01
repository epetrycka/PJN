// static/script.js

async function generateSentence() {
    // Pobieranie wartości z formularza
    const data = {
        // SUBJECT
        subject_determiner: document.getElementById('s_det').value,
        subject_adjective: document.getElementById('s_adj').value,
        subject_noun: document.getElementById('s_noun').value,
        subject_number: document.getElementById('s_num').value,

        // VERB
        verb: document.getElementById('verb').value,
        tense: document.getElementById('tense').value,
        mode: document.getElementById('mode').value,

        // OBJECT
        object_determiner: document.getElementById('o_det').value,
        object_adjective: document.getElementById('o_adj').value,
        object_noun: document.getElementById('o_noun').value,
        object_number: document.getElementById('o_num').value
    };

    try {
        // Wysłanie zapytania do Pythona (app.py)
        const response = await fetch('/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        // Wyświetlenie wyniku
        const outputDiv = document.getElementById('result-text');
        outputDiv.textContent = result.sentence;
        outputDiv.style.opacity = "0";
        setTimeout(() => {
            outputDiv.style.opacity = "1";
        }, 100);

    } catch (error) {
        console.error('Error:', error);
        document.getElementById('result-text').textContent = "Wystąpił błąd połączenia.";
    }
}