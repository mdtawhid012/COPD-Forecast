import joblib, itertools, numpy as np

model = joblib.load('ehr_xgb_model.pkl')

ages = list(range(40, 85, 2))
smoking = [0, 1]
gender = [0, 1]
diabetes = [0, 1]
htn = [0, 1]
afib = [0, 1]
ihd = [0, 1]

low_profiles = []
mod_profiles = []
high_profiles = []

for a,s,g,d,h,af,i in itertools.product(ages, smoking, gender, diabetes, htn, afib, ihd):
    prob = model.predict_proba(np.array([[a, s, g, d, h, af, i]]))[0][1]
    
    if prob < 0.2 and len(low_profiles) < 10:
        low_profiles.append((a, s, g, d, h, af, i, prob))
    elif 0.4 < prob < 0.6 and len(mod_profiles) < 10:
        mod_profiles.append((a, s, g, d, h, af, i, prob))
    elif prob > 0.8 and len(high_profiles) < 10:
        high_profiles.append((a, s, g, d, h, af, i, prob))

print("LOW")
for p in low_profiles: print(p)
print("\nMOD")
for p in mod_profiles: print(p)
print("\nHIGH")
for p in high_profiles: print(p)
