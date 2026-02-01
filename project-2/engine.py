# engine.py
from data import NOUNS, VERBS


PRONOUNS_LIST = ["I", "you", "he", "she", "it", "we", "they"]

def get_gerund(verb_lemma):
    """Tworzy formę -ing (Gerund)"""
    verb_data = VERBS.get(verb_lemma, {})

    # 1. Jeśli mamy to w bazie (wyjątki), użyj tego
    if "ing" in verb_data:
        return verb_data["ing"]

    # 2. Prosta automatyzacja dla reszty
    if verb_lemma.endswith("e") and verb_lemma not in ["be", "see"]:
        return verb_lemma[:-1] + "ing"  # make -> making

    return verb_lemma + "ing"  # play -> playing

def get_article(word, article_type):
    if article_type == "definite":
        return "the"
    elif article_type == "indefinite":
        if word and word[0].lower() in 'aeiou': return "an"
        return "a"
    return ""


def conjugate_verb(verb_lemma, tense, person, number, mode):
    """
    Args:
        mode: affirmative, negative, question, imperative, conditional
    """
    verb_data = VERBS.get(verb_lemma, {"type": "regular"})
    is_3rd_sg = (number == "singular" and person not in ["I", "you", "we", "they"])

    # 1. IMPERATIVE (Rozkazujący) - "Eat!" / "Do not eat!"
    if mode == "imperative":
        if tense == "negative":  # specyficzne mapowanie dla rozkazującego przeczącego
            return f"do not {verb_lemma}"
        # W rozkazującym używamy czystej bazy (chyba że 'be')
        return verb_lemma

    # 2. CONDITIONAL (Przypuszczający) - "would eat"
    if mode == "conditional":
        # Conditional zazwyczaj nie ma czasów w prostym ujęciu (Future in the past)
        # Traktujemy to jako "would + verb"
        return f"would {verb_lemma}"

    # --- SPECIAL CASE: TO BE ---
    if verb_lemma == "be":
        if tense == "future":
            base = "will be"
            if mode == "question": return "will", "be"
            if mode == "negative": return "will not be"
            return base

        if tense == "present":
            if person == "I":
                form = "am"
            elif is_3rd_sg:
                form = "is"
            else:
                form = "are"
        elif tense == "past":
            if person == "I" or is_3rd_sg:
                form = "was"
            else:
                form = "were"
        else:
            form = "is"  # fallback

        if mode == "negative": form += " not"
        return form

    # --- STANDARD VERBS ---

    # FUTURE
    if tense == "future":
        if mode == "question": return "will", verb_lemma
        if mode == "negative": return f"will not {verb_lemma}"
        return f"will {verb_lemma}"

    # PAST
    if tense == "past":
        if mode == "negative": return f"did not {verb_lemma}"
        if mode == "question": return "did", verb_lemma

        past_form = verb_data.get("past", verb_lemma + "ed")
        if verb_data["type"] == "regular" and verb_lemma.endswith("e"):
            past_form = verb_lemma + "d"
        return past_form

    # PRESENT
    if tense == "present":
        aux = "does" if is_3rd_sg else "do"
        if mode == "negative": return f"{aux} not {verb_lemma}"
        if mode == "question": return aux, verb_lemma
        if is_3rd_sg: return verb_data.get("3sg", verb_lemma + "s")
        return verb_lemma

    # PRESENT PERFECT
    if tense == "present_perfect":
        # Ustalanie operatora (have/has)
        aux = "has" if is_3rd_sg else "have"

        # Pobranie imiesłowu (3. forma)
        # Dla regularnych to to samo co past (np. played), dla nieregularnych bierzemy z "pp"
        if verb_data["type"] == "irregular":
            pp_form = verb_data.get("pp", verb_data.get("past"))  # fallback do past jak nie ma pp
        else:
            # Regularne: base + ed (lub d)
            if verb_lemma.endswith("e"):
                pp_form = verb_lemma + "d"
            else:
                pp_form = verb_lemma + "ed"

        # Obsługa 'be' w Perfect (bin/been)
        if verb_lemma == "be":
            pp_form = "been"

        # Zwracanie formy w zależności od trybu
        if mode == "question":
            return aux, pp_form  # Zwraca krotkę: (Have, eaten) -> Have I eaten...

        if mode == "negative":
            return f"{aux} not {pp_form}"

        return f"{aux} {pp_form}"

    # PRESENT CONTINUOUS
    if tense == "present_continuous":
        # Krok 1: Odmień operator "to be"
        if person == "I":
            aux = "am"
        elif is_3rd_sg:
            aux = "is"
        else:
            aux = "are"

        # Krok 2: Pobierz formę -ing
        ing_form = get_gerund(verb_lemma)

        # Krok 3: Złóż w całość
        if mode == "question":
            return aux, ing_form  # Am I playing...

        if mode == "negative":
            return f"{aux} not {ing_form}"

        return f"{aux} {ing_form}"

    return verb_lemma


def build_sentence(data):
    # Pobieranie danych
    s_det = data.get('subject_determiner', '')
    s_adj = data.get('subject_adjective', '')
    s_noun_lemma = data.get('subject_noun')
    s_num = data.get('subject_number', 'singular')

    # zaimek osobowy nie potrzebuje deteminatora ani przymiotnika
    if s_noun_lemma in PRONOUNS_LIST:
        s_det = ""
        s_adj = ""

    mode = data.get('mode', 'affirmative')  # affirmative, negative, question, imperative, conditional
    tense = data.get('tense', 'present')

    # Budowanie podmiotu (Subject)
    # Obsługa these/those
    if s_num == "plural":
        if s_det == "this":
            s_det = "these"
        elif s_det == "that":
            s_det = "those"
    s_noun = s_noun_lemma
    if s_num == "plural": s_noun = NOUNS.get(s_noun_lemma, s_noun_lemma + "s")

    subject_parts = []
    next_word_s = s_adj if s_adj else s_noun
    if s_det == "indefinite":
        subject_parts.append(get_article(next_word_s, "indefinite"))
    elif s_det == "definite":
        subject_parts.append("The")  # Start zdania dużą literą
    elif s_det:
        subject_parts.append(s_det)
    if s_adj: subject_parts.append(s_adj)
    subject_parts.append(s_noun)
    full_subject = " ".join(subject_parts)

    # Budowanie obiektu (Object)
    o_det = data.get('object_determiner', '')
    o_adj = data.get('object_adjective', '')
    o_noun_lemma = data.get('object_noun')
    o_num = data.get('object_number', 'singular')

    # Obsługa these/those
    if o_num == "plural":
        if o_det == "this":
            o_det = "these"
        elif o_det == "that":
            o_det = "those"

    o_noun = o_noun_lemma
    if o_num == "plural": o_noun = NOUNS.get(o_noun_lemma, o_noun_lemma + "s")

    object_parts = []
    next_word_o = o_adj if o_adj else o_noun
    if o_det == "indefinite":
        object_parts.append(get_article(next_word_o, "indefinite"))
    elif o_det == "definite":
        object_parts.append("the")
    elif o_det:
        object_parts.append(o_det)
    if o_adj: object_parts.append(o_adj)
    object_parts.append(o_noun)
    full_object = " ".join(object_parts)

    # LOGIKA SKŁADANIA ZDANIA (SVO)

    # 1. TRYB ROZKAZUJĄCY (IMPERATIVE) - Specjalny przypadek (brak podmiotu)
    if mode == "imperative":
        # W trybie rozkazującym ignorujemy podmiot użytkownika!
        # Verb + Object
        # np. "Eat the apple!"

        # Jeśli wybrano negację w UI dla Imperative (trzeba to obsłużyć sprytnie)
        # Przyjmijmy uproszczenie: jeśli user wybrał Imperative, to ignorujemy "tense",
        # ale sprawdzamy czy chciał 'Negative' (zróbmy to hackiem: w UI Imperative to osobna opcja,
        # ale dodajmy też "Imperative (Negative)" lub obsłużmy to inaczej.
        # W engine.py conjugate_verb przyjmuje 'imperative'.

        verb_part = conjugate_verb(data['verb'], "present", "you", "singular", "imperative")
        sentence = f"{verb_part} {full_object}!"
        return sentence[0].upper() + sentence[1:]

    # DETEKCJA OSOBY (PERSON)
    # Domyślnie to "noun" (czyli 3 osoba), ale sprawdzamy czy to zaimek
    grammatical_person = "noun"

    # Lista zaimków, które zmieniają koniugację
    if s_noun_lemma in ["I", "we"]:
        grammatical_person = "I" if s_noun_lemma == "I" else "we"
    elif s_noun_lemma == "you":
        grammatical_person = "you"
    elif s_noun_lemma in ["he", "she", "it", "they"]:
        grammatical_person = "he"  # traktowane jak 3 os. pojedyncza (chyba że plural niżej zmieni)

    # Jeśli liczba mnoga (np. "students" lub "they"), to zmienia postać rzeczy
    if s_num == "plural":
        grammatical_person = "they"
        # Wyjątek: "we" i "you" zachowują swoją osobę
        if s_noun_lemma == "we": grammatical_person = "we"
        if s_noun_lemma == "you": grammatical_person = "you"

    # Koniugacja z uwzględnieniem wykrytej osoby
    verb_result = conjugate_verb(
        data['verb'],
        tense,
        grammatical_person,  # <--- Tu używamy nowej zmiennej zamiast "noun"
        s_num,
        mode
    )

    # 2. PYTANIE
    if mode == 'question':
        if isinstance(verb_result, tuple):
            aux, main_verb = verb_result
            sentence = f"{aux} {full_subject} {main_verb} {full_object}?"
        else:
            # Dla 'to be'
            sentence = f"{verb_result} {full_subject} {full_object}?"

    # 3. WARUNKOWY (CONDITIONAL) i TWIERDZENIE/PRZECZENIE
    else:
        # Conditional zwraca np "would play"
        # Affirmative zwraca np "plays"
        # Negative zwraca np "does not play"
        sentence = f"{full_subject} {verb_result} {full_object}."

    return sentence[0].upper() + sentence[1:]