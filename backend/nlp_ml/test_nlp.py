

from nlp_synopsis import analyze_va

# example synopsis
synopsis_1 = "A powerful and dark thriller that keeps you on the edge of your seat with shocking plot twists."
synopsis_2 = "A heartwarming and gentle story about a lonely man who finds true friendship in an unexpected place."
synopsis_3 = "A confusing and boring drama with no clear plot or character development."
synopsis_4 = "The film follows a quiet and contemplative journey through nature's serene beauty."

# va
va_1 = analyze_va(synopsis_1)
va_2 = analyze_va(synopsis_2)
va_3 = analyze_va(synopsis_3)
va_4 = analyze_va(synopsis_4)

print(f"Synopsis 1 (Thriller): Valence={va_1[0]:.2f}, Arousal={va_1[1]:.2f}")
print(f"Synopsis 2 (Heartwarming): Valence={va_2[0]:.2f}, Arousal={va_2[1]:.2f}")
print(f"Synopsis 3 (Boring Drama): Valence={va_3[0]:.2f}, Arousal={va_3[1]:.2f}")
print(f"Synopsis 4 (Contemplative): Valence={va_4[0]:.2f}, Arousal={va_4[1]:.2f}")