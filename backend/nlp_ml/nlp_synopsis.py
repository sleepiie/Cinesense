vad_lexicon ={}
try:
    with open('NRC-VAD-Lexicon-v2.1.txt' , 'r' , encoding='utf-8') as f:
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
    if not text or not vad_lexicon:
        return [0.0 , 0.0]
    words = text.lower().split()
    total_valence = 0.0
    total_arousal = 0.0
    count = 0

    for word in words:
        if word in vad_lexicon:
            valence , arousal = vad_lexicon[word]
            total_valence += valence
            total_arousal += arousal
            count += 1
    if count > 0:
        avg_valence = total_valence / count
        avg_arousal = total_arousal / count

        return [avg_valence,avg_arousal]
    return [0.0 , 0.0]