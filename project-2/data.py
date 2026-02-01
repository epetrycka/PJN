
# Irregular nouns
NOUNS = {
    "I": "we",
    "you": "you",
    "he": "they",
    "she": "they",
    "it": "they",
    # Animals
    "cat": "cats",
    "dog": "dogs",
    "mouse": "mice",
    "child": "children",
    "person": "people",
    "wolf": "wolves",
    "fish": "fish",
    # Objects
    "book": "books",
    "car": "cars",
    "apple": "apples",
    "knife": "knives",
    "box": "boxes",
    # Places
    "house": "houses",
    "city": "cities"
}

ADJECTIVES = [
    "good", "bad", "big", "small", "happy", "sad", "red", "green", "blue",
    "old", "new", "fast", "slow", "intelligent", "beautiful", "crazy"
]

# Czasowniki
# klucz = bezokolicznik
# wartości = {past: czas przeszły, pp: imiesłów, 3sg: 3 os. l.poj (opcjonalnie, domyślnie +s)}
VERBS = {
    # Regularne (prosta logika w engine, ale można nadpisać)
    "play": {"type": "regular"},
    "work": {"type": "regular"},
    "like": {"type": "regular"},
    "cook": {"type": "regular"},
    "want": {"type": "regular"},

    # Nieregularne (musimy podać formy)
    "go": {"type": "irregular", "past": "went", "pp": "gone", "3sg": "goes"},
    "eat": {"type": "irregular", "past": "ate", "pp": "eaten"},
    "drink": {"type": "irregular", "past": "drank", "pp": "drunk"},
    "see": {"type": "irregular", "past": "saw", "pp": "seen"},
    "have": {"type": "irregular", "past": "had", "pp": "had", "3sg": "has"},
    "do": {"type": "irregular", "past": "did", "pp": "done", "3sg": "does"},
    "swim": {"type": "irregular", "past": "swam", "pp": "swum", "3sg": "swims", "ing": "swimming"},
    "be": {"type": "special", "past": "was/were", "pp": "been"}  # 'Be' to zawsze wyjątek
}