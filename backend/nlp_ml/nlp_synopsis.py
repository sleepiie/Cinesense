import nltk
from nltk.tokenize import word_tokenize, sent_tokenize
nltk.download('punkt')
nltk.download('punkt_tab')


vad_lexicon ={}
try:
    with open('nlp_ml/NRC-VAD-Lexicon-v2.1.txt' , 'r' , encoding='utf-8') as f:
        next(f)
        for line in f:
            parts = line.strip().split('\t')
            if len(parts) == 4:
                word , valence , arousal , dominance = parts
                vad_lexicon[word.lower()]= (float(valence) , float(arousal))
except FileNotFoundError:
    print("NRC-VAD file not found")
    vad_lexicon = {}

def analyze_va(text):
    tokens = word_tokenize(text.lower())
    valences, arousals = [], []
    for token in tokens:
        if token in vad_lexicon:
            v, a = vad_lexicon[token]
            valences.append(v)
            arousals.append(a)

    if valences and arousals:
        avg_valence = round(sum(valences) / len(valences), 3)
        avg_arousal = round(sum(arousals) / len(arousals), 3)
        return [avg_valence, avg_arousal]
    else:
        return [0.0, 0.0]