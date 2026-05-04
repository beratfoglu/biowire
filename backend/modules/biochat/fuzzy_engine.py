"""
Biowire Fuzzy Logic Engine v2.1
================================
Multi-layer clinical decision support system.

Katmanlar:
  1. Temel Fuzzy Inference (severity, duration, count)
  2. Bölge Ağırlığı (region_weight)
  3. Cinsiyet Faktörü (gender_factor)
  4. Duration Paradoksu (bölge bazlı duration yorumu)
  5. Kombinasyon Kuralları (CRITICAL override)
  6. Kalibrasyon Soruları (severity düzeltme)

Düzeltmeler v2.1:
  - Concurrency: ControlSystemSimulation her istekte yeniden oluşturuluyor
  - False Positive: keyword matching regex word boundary ile yapılıyor
  - Type Safety: Optional[str] annotasyonları düzeltildi

Kaynaklar: WHO, ESC/AHA, NICE, UpToDate, BMJ Best Practice
"""

import re
import numpy as np
import skfuzzy as fuzz
from skfuzzy import control as ctrl
from typing import List, Optional, Tuple, Dict
from dataclasses import dataclass
from enum import Enum


# ─────────────────────────────────────────────
# ENUM & DATACLASS
# ─────────────────────────────────────────────

class UrgencyLevel(str, Enum):
    LOW      = "LOW"
    MEDIUM   = "MEDIUM"
    HIGH     = "HIGH"
    CRITICAL = "CRITICAL"


@dataclass
class FuzzyResult:
    urgency_score:            float
    urgency_level:            UrgencyLevel
    specialist:               str
    secondary_specialist:     Optional[str]
    red_flag:                 bool
    red_flag_reason:          Optional[str]
    cancer_warning:           bool
    cancer_warning_reason:    Optional[str]
    combination_triggered:    bool
    combination_name:         Optional[str]
    calibration_questions:    List[str]
    explanation:              str


# ─────────────────────────────────────────────
# BÖLGE AĞIRLIKLARI & UZMANLAR
# ─────────────────────────────────────────────

REGION_WEIGHTS: Dict[str, float] = {
    "chest":   2.0,
    "heart":   2.0,
    "head":    1.8,
    "abdomen": 1.5,
    "pelvis":  1.4,
    "back":    1.3,
    "throat":  1.2,
    "arms":    1.2,
    "legs":    1.2,
    "eyes":    1.3,
    "hands":   0.8,
    "feet":    0.8,
    "ears":    0.9,
    "skin":    1.0,
}

REGION_SPECIALISTS: Dict[str, str] = {
    "chest":   "cardiologist",
    "heart":   "cardiologist",
    "head":    "neurologist",
    "abdomen": "gastroenterologist",
    "pelvis":  "urologist",
    "back":    "orthopedist",
    "throat":  "ent_specialist",
    "arms":    "orthopedist",
    "legs":    "vascular_surgeon",
    "eyes":    "ophthalmologist",
    "hands":   "orthopedist",
    "feet":    "orthopedist",
    "ears":    "ent_specialist",
    "skin":    "dermatologist",
}


# ─────────────────────────────────────────────
# CİNSİYET FAKTÖRLERİ
# ─────────────────────────────────────────────

def get_gender_factor(region: str, gender: str) -> float:
    """
    Bölge + cinsiyet kombinasyonuna göre risk çarpanı.
    Kaynak: AHA (2016) Sex differences in cardiovascular disease;
            NICE Women's health guidelines.
    """
    if gender == "female":
        factors: Dict[str, float] = {
            "chest":   1.3,
            "abdomen": 1.4,
            "pelvis":  1.5,
            "back":    1.2,
            "throat":  1.1,
            "legs":    1.2,
            "skin":    1.3,
            "head":    1.1,
        }
    elif gender == "male":
        factors = {
            "chest":   1.2,
            "arms":    1.3,
            "pelvis":  1.8,
            "back":    1.1,
            "skin":    1.2,
            "abdomen": 1.2,
            "legs":    1.1,
        }
    else:
        factors = {}

    return factors.get(region, 1.0)


# ─────────────────────────────────────────────
# DURATION PARADOKSU
# ─────────────────────────────────────────────

def apply_duration_paradox(
    base_score: float,
    region: str,
    duration_days: int,
    severity: float,
) -> Tuple[float, Optional[str]]:
    """
    Süre paradoksunu uygular.

    Kısa süre bazı bölgelerde aciliyeti artırır (akut MI, SAH).
    Uzun süre bazı bölgelerde aciliyeti düşürür (kronik baş ağrısı).
    Çok uzun süre kanser uyarısı tetikler.
    """
    cancer_warning: Optional[str] = None
    adjusted = base_score

    # Akut pencere — <1 gün, yüksek riskli bölgeler
    if duration_days == 0 and region in ("chest", "heart", "head"):
        adjusted = min(adjusted * 1.4, 100.0)

    # Kronik normalize — uzun süre = daha az akut (bazı bölgeler)
    chronic_normalize: Dict[str, Tuple[int, float]] = {
        "chest":   (14, 0.75),
        "heart":   (7,  0.80),
        "head":    (7,  0.85),
        "abdomen": (3,  0.90),
    }
    if region in chronic_normalize:
        threshold, factor = chronic_normalize[region]
        if duration_days >= threshold:
            adjusted = adjusted * factor

    # Kronik eskalasyon — uzun süre = daha tehlikeli (malignite şüphesi)
    chronic_escalate: Dict[str, Tuple[int, float]] = {
        "back":    (21, 1.2),
        "abdomen": (30, 1.15),
        "skin":    (42, 1.3),
        "throat":  (21, 1.2),
    }
    if region in chronic_escalate:
        threshold, factor = chronic_escalate[region]
        if duration_days >= threshold:
            adjusted = min(adjusted * factor, 100.0)
            cancer_warning = (
                f"Symptom duration >{threshold} days in {region} "
                f"— malignancy screening recommended"
            )

    # Kanser uyarı pencereleri
    cancer_thresholds: Dict[str, Tuple[int, str]] = {
        "chest":   (21, "Persistent chest symptoms >3 weeks + weight loss → lung malignancy screening"),
        "abdomen": (42, "Persistent abdominal symptoms >6 weeks → GI malignancy workup"),
        "back":    (28, "Back pain >4 weeks not improving → spinal pathology/malignancy"),
        "head":    (42, "Headache >6 weeks progressive → intracranial lesion"),
        "throat":  (21, "Hoarseness/dysphagia >3 weeks → laryngeal/esophageal ca"),
        "skin":    (42, "Non-healing skin lesion >6 weeks → SCC/BCC/melanoma"),
        "pelvis":  (14, "Pelvic symptoms >2 weeks in female → gynecological malignancy screening"),
    }
    if region in cancer_thresholds and cancer_warning is None:
        threshold, warning = cancer_thresholds[region]
        if duration_days >= threshold:
            cancer_warning = warning

    return min(adjusted, 100.0), cancer_warning


# ─────────────────────────────────────────────
# KALİBRASYON SORULARI
# ─────────────────────────────────────────────

CALIBRATION_QUESTIONS: Dict[str, List[str]] = {
    "chest": [
        "Does the pain radiate to your left arm, jaw, or back?",
        "Are you sweating, nauseated, or feeling short of breath?",
        "Did the pain start suddenly or gradually?",
        "Does it get worse with physical activity?",
        "Have you had this type of pain before?",
    ],
    "heart": [
        "Do you feel your heart racing or skipping beats?",
        "Have you experienced any fainting or near-fainting?",
        "Do you have a family history of sudden cardiac death?",
        "Does the palpitation come with chest pain or shortness of breath?",
    ],
    "head": [
        "Is this the worst headache you have ever had?",
        "Did it start suddenly (thunderclap) or gradually?",
        "Do you have neck stiffness or sensitivity to light?",
        "Is there any weakness, numbness, or vision changes?",
        "Did the headache wake you from sleep?",
    ],
    "abdomen": [
        "Where exactly is the pain — upper, lower, left, right, or all over?",
        "Do you have fever, nausea, or vomiting?",
        "Has the pain moved or changed location?",
        "Do you have any changes in bowel habits?",
        "Is there any yellowing of the skin or eyes?",
    ],
    "back": [
        "Do you have any weakness or numbness in your legs?",
        "Do you have any difficulty with bladder or bowel control?",
        "Is the pain worse at night or when lying down?",
        "Did it start after an injury or lifting?",
        "Does the pain radiate down your leg?",
    ],
    "pelvis": [
        "Could you be pregnant? (if applicable)",
        "Do you have any unusual vaginal discharge or bleeding? (if applicable)",
        "Is the pain sudden and severe, or gradual?",
        "Do you have any urinary symptoms — burning, frequency, blood?",
        "Is there any testicular pain or swelling? (if applicable)",
    ],
    "eyes": [
        "Did the vision loss occur suddenly or gradually?",
        "Do you see flashes of light or floaters?",
        "Is there severe eye pain?",
        "Do you see halos around lights?",
        "Has your vision changed in the last hour?",
    ],
    "skin": [
        "Is the rash spreading rapidly?",
        "Does the rash disappear when you press on it (blanching)?",
        "Do you have fever along with the rash?",
        "Have you started any new medications recently?",
        "Is there any swelling of the face or throat?",
    ],
    "legs": [
        "Is one leg more swollen than the other?",
        "Is the leg warm, red, or tender to touch?",
        "Do you have any chest pain or shortness of breath?",
        "Have you been immobile or on a long flight recently?",
        "Is the pain constant or only with walking?",
    ],
    "throat": [
        "Do you have difficulty swallowing or breathing?",
        "Is there any drooling or muffled voice?",
        "Do you have fever?",
        "Is there swelling visible on one side of the throat?",
        "Have you lost your voice for more than 3 weeks?",
    ],
}

UNIVERSAL_CALIBRATION: List[str] = [
    "On a scale of 1-10, how much does this pain interfere with your daily activities?",
    "Did this symptom wake you from sleep?",
    "Have you had unexplained weight loss in the past 3 months?",
    "Do you have any history of cancer, heart disease, or immunosuppression?",
    "Are your symptoms getting worse, better, or staying the same?",
]


def get_calibration_questions(regions: List[str]) -> List[str]:
    questions: List[str] = []
    for region in regions[:2]:
        questions.extend(CALIBRATION_QUESTIONS.get(region, [])[:3])
    questions.extend(UNIVERSAL_CALIBRATION[:2])
    # Deduplicate while preserving order
    seen = set()
    result = []
    for q in questions:
        if q not in seen:
            seen.add(q)
            result.append(q)
    return result


# ─────────────────────────────────────────────
# KOMBİNASYON KURALLARI
# ─────────────────────────────────────────────

@dataclass
class CombinationRule:
    name:        str
    regions:     List[str]
    keywords:    List[str]
    min_score:   float
    specialist:  str
    red_flag:    bool
    description: str


COMBINATION_RULES: List[CombinationRule] = [
    CombinationRule("STEMI_PATTERN",          ["chest", "arms"],       ["arm", "left", "jaw", "sweat", "pressure", "crushing", "radiat"],                     92, "emergency_cardiology",      True,  "Classic STEMI: chest pain radiating to left arm/jaw with sweating"),
    CombinationRule("PULMONARY_EMBOLISM",      ["chest", "legs"],       ["breath", "shortness", "swollen", "leg", "sudden", "cough", "blood"],                 90, "emergency_pulmonology",     True,  "PE pattern: chest pain + leg swelling + shortness of breath"),
    CombinationRule("AORTIC_DISSECTION",       ["chest", "back"],       ["tearing", "ripping", "sudden", "severe", "back", "radiat"],                          95, "emergency_vascular",        True,  "Aortic dissection: sudden tearing chest/back pain"),
    CombinationRule("SUBARACHNOID_HEMORRHAGE", ["head"],                ["worst", "sudden", "thunderclap", "never", "severe", "vomit", "stiff"],               93, "emergency_neurology",       True,  "SAH: sudden onset worst headache of life"),
    CombinationRule("STROKE_FAST",             ["head", "arms"],        ["weak", "numb", "speech", "face", "droop", "sudden", "arm", "vision"],                95, "emergency_neurology",       True,  "Stroke: FAST — facial drooping, arm weakness, speech difficulty"),
    CombinationRule("MENINGITIS",              ["head"],                ["fever", "stiff", "neck", "light", "photophobia", "rash", "vomit"],                   93, "emergency_neurology",       True,  "Meningitis: severe headache + fever + neck stiffness + photophobia"),
    CombinationRule("APPENDICITIS",            ["abdomen"],             ["right", "lower", "rebound", "fever", "nausea", "migrat", "umbili"],                  82, "emergency_surgery",         True,  "Appendicitis: periumbilical → RLQ pain + fever + nausea"),
    CombinationRule("ECTOPIC_PREGNANCY",       ["pelvis", "abdomen"],   ["period", "pregnant", "shoulder", "missed", "bleeding", "sudden"],                   94, "emergency_gynecology",      True,  "Ectopic pregnancy: missed period + pelvic pain + shoulder tip pain"),
    CombinationRule("TESTICULAR_TORSION",      ["pelvis"],              ["testicle", "testicular", "scrotal", "sudden", "nausea", "severe"],                   92, "emergency_urology",         True,  "Testicular torsion: sudden severe testicular pain — 6h window"),
    CombinationRule("EPIGLOTTITIS",            ["throat"],              ["drool", "muffled", "stridor", "breath", "swallow", "fever", "sitting"],              95, "emergency_ent",             True,  "Epiglottitis: drooling + muffled voice + stridor — airway emergency"),
    CombinationRule("MENINGOCOCCAL_RASH",      ["skin", "head"],        ["rash", "fever", "petechial", "purpur", "spot", "blanch"],                            96, "emergency",                 True,  "Meningococcal septicemia: non-blanching petechial rash + fever"),
    CombinationRule("CAUDA_EQUINA",            ["back", "legs"],        ["bladder", "bowel", "weak", "numb", "saddle", "both", "bilateral"],                   91, "emergency_neurosurgery",    True,  "Cauda equina: back pain + bilateral leg weakness + bladder/bowel dysfunction"),
    CombinationRule("DVT_PE_RISK",             ["legs", "chest"],       ["swollen", "warm", "red", "tender", "breath", "flight", "immobil"],                   78, "vascular_emergency",        False, "DVT with PE risk: leg swelling + chest symptoms + immobility"),
    CombinationRule("CHOLANGITIS",             ["abdomen"],             ["jaundice", "yellow", "fever", "upper", "charcot"],                                   82, "gastroenterology",          True,  "Cholangitis: RUQ pain + jaundice + fever (Charcot triad)"),
    CombinationRule("NECROTIZING_FASCIITIS",   ["skin", "legs", "arms"],["spread", "necros", "black", "severe", "rapid", "gangren", "crepitus"],              95, "emergency_surgery",         True,  "Necrotizing fasciitis: rapidly spreading skin necrosis"),
    CombinationRule("PERITONITIS",             ["abdomen"],             ["rigid", "board", "severe", "generaliz", "rebound", "guard"],                         93, "emergency_surgery",         True,  "Peritonitis: rigid abdomen + generalized severe pain"),
    CombinationRule("ACUTE_GLAUCOMA",          ["eyes", "head"],        ["halo", "halos", "nausea", "vomit", "severe", "sudden", "vision", "blur"],            88, "emergency_ophthalmology",   True,  "Acute angle-closure glaucoma: eye pain + halos + nausea"),
    CombinationRule("GIANT_CELL_ARTERITIS",    ["head"],                ["temple", "temporal", "jaw", "claudic", "vision", "scalp", "tender"],                 80, "rheumatology_emergency",    True,  "Giant cell arteritis: temporal headache + jaw claudication + age>50"),
    CombinationRule("LUNG_CANCER_PATTERN",     ["chest"],               ["cough", "blood", "hemoptysis", "weight", "loss", "hoarse", "weeks"],                 70, "pulmonology_oncology",      False, "Lung cancer: persistent cough + hemoptysis + weight loss"),
    CombinationRule("GI_CANCER_PATTERN",       ["abdomen"],             ["weight", "loss", "blood", "stool", "appetite", "satiety", "change"],                 65, "gastroenterology_oncology", False, "GI malignancy: weight loss + rectal bleeding + appetite change"),
    CombinationRule("OVARIAN_CANCER_PATTERN",  ["pelvis", "abdomen"],   ["bloat", "weight", "loss", "satiety", "mass", "ascites", "distend"],                  65, "gynecology_oncology",       False, "Ovarian cancer: bloating + early satiety + pelvic mass"),
]


def _keyword_match(keyword: str, text: str) -> bool:
    """
    Regex word boundary ile keyword arar.
    'arm' → 'warm' veya 'charm' içinde eşleşmez.
    """
    return bool(re.search(rf"\b{re.escape(keyword)}\b", text))


def check_combinations(
    regions: List[str],
    message: str,
    gender: str,
) -> Tuple[Optional[CombinationRule], float]:
    """
    Mesaj ve bölgelere göre kombinasyon kurallarını kontrol eder.
    En yüksek effective score'u döndürür.
    """
    message_lower = message.lower()
    best_rule: Optional[CombinationRule] = None
    best_score: float = 0.0

    for rule in COMBINATION_RULES:
        # Cinsiyet filtresi
        if rule.name == "ECTOPIC_PREGNANCY" and gender != "female":
            continue
        if rule.name == "TESTICULAR_TORSION" and gender != "male":
            continue

        # Bölge eşleşmesi
        if not any(r in regions for r in rule.regions):
            continue

        # Keyword eşleşmesi — regex word boundary
        keyword_hits = sum(
            1 for kw in rule.keywords
            if _keyword_match(kw, message_lower)
        )
        if keyword_hits == 0:
            continue

        keyword_ratio = keyword_hits / len(rule.keywords)
        effective_score = rule.min_score * (0.7 + 0.3 * keyword_ratio)

        if effective_score > best_score:
            best_score = effective_score
            best_rule = rule

    return best_rule, best_score


# ─────────────────────────────────────────────
# ANA FUZZY ENGINE
# ─────────────────────────────────────────────

class BiowireFuzzyEngine:
    def __init__(self):
        self._build_control_system()

    def _build_control_system(self):
        """
        Mamdani tipi fuzzy inference sistemi.
        urgency_ctrl statik — her istekte paylaşılır.
        ControlSystemSimulation ise her istekte ayrı oluşturulur.
        """
        severity = ctrl.Antecedent(np.arange(0, 11, 0.5), 'severity')
        duration = ctrl.Antecedent(np.arange(0, 11, 0.5), 'duration')
        count    = ctrl.Antecedent(np.arange(0, 11, 0.5), 'count')
        urgency  = ctrl.Consequent(np.arange(0, 101, 1),  'urgency')

        # Severity MFs
        severity['minimal']  = fuzz.trapmf(severity.universe, [0,   0,   1.5, 3  ])
        severity['mild']     = fuzz.trimf( severity.universe, [2,   3.5, 5        ])
        severity['moderate'] = fuzz.trimf( severity.universe, [4,   5.5, 7        ])
        severity['severe']   = fuzz.trimf( severity.universe, [6,   7.5, 9        ])
        severity['critical'] = fuzz.trapmf(severity.universe, [8,   9,   10,  10  ])

        # Duration MFs (normalize 0-10)
        duration['acute']    = fuzz.trapmf(duration.universe, [0,   0,   1.5, 3  ])
        duration['subacute'] = fuzz.trimf( duration.universe, [2,   4,   6        ])
        duration['chronic']  = fuzz.trapmf(duration.universe, [5,   7,   10,  10  ])

        # Count MFs
        count['single']   = fuzz.trapmf(count.universe, [0, 0, 2, 3])
        count['multiple'] = fuzz.trimf( count.universe, [2, 4, 6    ])
        count['many']     = fuzz.trapmf(count.universe, [5, 7, 10, 10])

        # Urgency output MFs
        urgency['low']      = fuzz.trapmf(urgency.universe, [0,  0,  20, 39 ])
        urgency['medium']   = fuzz.trimf( urgency.universe, [30, 50, 70     ])
        urgency['high']     = fuzz.trimf( urgency.universe, [60, 75, 88     ])
        urgency['critical'] = fuzz.trapmf(urgency.universe, [82, 92, 100, 100])

        rules = [
            ctrl.Rule(severity['critical'] & duration['acute'],    urgency['critical']),
            ctrl.Rule(severity['critical'] & count['many'],        urgency['critical']),
            ctrl.Rule(severity['critical'],                        urgency['high']),
            ctrl.Rule(severity['severe']   & duration['acute'],    urgency['high']),
            ctrl.Rule(severity['severe']   & count['many'],        urgency['high']),
            ctrl.Rule(severity['severe']   & duration['subacute'], urgency['high']),
            ctrl.Rule(severity['severe']   & duration['chronic'],  urgency['medium']),
            ctrl.Rule(severity['moderate'] & duration['acute'],    urgency['medium']),
            ctrl.Rule(severity['moderate'] & count['many'],        urgency['medium']),
            ctrl.Rule(severity['moderate'] & duration['subacute'], urgency['medium']),
            ctrl.Rule(severity['moderate'] & duration['chronic'],  urgency['low']),
            ctrl.Rule(severity['mild']     & duration['acute'],    urgency['low']),
            ctrl.Rule(severity['mild']     & count['many'],        urgency['medium']),
            ctrl.Rule(severity['mild']     & duration['chronic'],  urgency['low']),
            ctrl.Rule(severity['minimal'],                         urgency['low']),
        ]

        self.urgency_ctrl = ctrl.ControlSystem(rules)

    def _normalize_duration(self, duration_days: int) -> float:
        if duration_days == 0:   return 0.5
        if duration_days <= 1:   return 1.5
        if duration_days <= 3:   return 3.0
        if duration_days <= 7:   return 5.0
        if duration_days <= 14:  return 7.0
        if duration_days <= 30:  return 8.5
        return 10.0

    def _normalize_count(self, count: int) -> float:
        return min(count * 1.5, 10.0)

    def _base_inference(
        self,
        severity: float,
        duration_days: int,
        symptom_count: int,
    ) -> float:
        """
        Her istek için yeni ControlSystemSimulation oluşturur.
        Bu sayede concurrent isteklerde state sızıntısı olmaz.
        """
        try:
            sim = ctrl.ControlSystemSimulation(self.urgency_ctrl)
            sim.input['severity'] = min(severity, 10.0)
            sim.input['duration'] = self._normalize_duration(duration_days)
            sim.input['count']    = self._normalize_count(symptom_count)
            sim.compute()
            return float(sim.output['urgency'])
        except Exception:
            # Fallback — basit ağırlıklı hesaplama
            return min(severity * 8.0 + symptom_count * 2.0, 100.0)

    def evaluate(
        self,
        severity: float,
        duration_days: int,
        symptoms: List[str],
        regions: List[str],
        gender: str = "other",
        message: str = "",
    ) -> FuzzyResult:

        symptom_count = len(symptoms)

        # Katman 1 — Temel Fuzzy
        base_score = self._base_inference(severity, duration_days, symptom_count)

        # Katman 2 — Bölge Ağırlığı
        if regions:
            primary_region = max(regions, key=lambda r: REGION_WEIGHTS.get(r, 1.0))
            max_weight     = REGION_WEIGHTS.get(primary_region, 1.0)
        else:
            primary_region = "general"
            max_weight     = 1.0

        weighted_score = min(base_score * max_weight, 100.0)

        # Katman 3 — Cinsiyet Faktörü
        gender_factors   = [get_gender_factor(r, gender) for r in regions] if regions else [1.0]
        max_gender_factor = max(gender_factors)
        gendered_score   = min(weighted_score * max_gender_factor, 100.0)

        # Katman 4 — Duration Paradoksu
        duration_score, cancer_warning = apply_duration_paradox(
            gendered_score, primary_region, duration_days, severity
        )

        # Katman 5 — Kombinasyon Kuralları
        combo_rule, combo_score = check_combinations(regions, message, gender)

        final_score = max(duration_score, combo_score) if combo_rule is not None else duration_score
        final_score = round(min(final_score, 100.0), 1)

        # Uzman belirleme
        if combo_rule is not None:
            specialist  = combo_rule.specialist
            red_flag    = combo_rule.red_flag
            red_flag_reason: Optional[str] = combo_rule.description if combo_rule.red_flag else None
        else:
            specialist  = self._determine_specialist(regions, gender)
            red_flag    = final_score >= 90
            red_flag_reason = (
                "Urgency score ≥90 — immediate emergency evaluation required"
                if red_flag else None
            )

        secondary_specialist = self._determine_secondary_specialist(regions, specialist)
        urgency_level        = self._score_to_level(final_score)

        cancer_warning_flag: bool         = cancer_warning is not None
        combination_triggered: bool       = combo_rule is not None
        combination_name: Optional[str]   = combo_rule.name if combo_rule is not None else None

        calibration_qs = get_calibration_questions(regions)

        explanation = self._build_explanation(
            base_score, weighted_score, gendered_score,
            duration_score, final_score,
            primary_region, max_weight, max_gender_factor,
            combo_rule, urgency_level,
        )

        return FuzzyResult(
            urgency_score         = final_score,
            urgency_level         = urgency_level,
            specialist            = specialist,
            secondary_specialist  = secondary_specialist,
            red_flag              = red_flag,
            red_flag_reason       = red_flag_reason,
            cancer_warning        = cancer_warning_flag,
            cancer_warning_reason = cancer_warning,
            combination_triggered = combination_triggered,
            combination_name      = combination_name,
            calibration_questions = calibration_qs,
            explanation           = explanation,
        )

    def _score_to_level(self, score: float) -> UrgencyLevel:
        if score >= 90: return UrgencyLevel.CRITICAL
        if score >= 70: return UrgencyLevel.HIGH
        if score >= 40: return UrgencyLevel.MEDIUM
        return UrgencyLevel.LOW

    def _determine_specialist(self, regions: List[str], gender: str) -> str:
        if not regions:
            return "general_practitioner"
        primary = max(regions, key=lambda r: REGION_WEIGHTS.get(r, 1.0))
        if primary == "pelvis":
            return "gynecologist" if gender == "female" else "urologist"
        return REGION_SPECIALISTS.get(primary, "general_practitioner")

    def _determine_secondary_specialist(
        self, regions: List[str], primary_specialist: str
    ) -> Optional[str]:
        if len(regions) < 2:
            return None
        sorted_regions = sorted(regions, key=lambda r: REGION_WEIGHTS.get(r, 1.0), reverse=True)
        secondary_region = sorted_regions[1]
        secondary = REGION_SPECIALISTS.get(secondary_region, "general_practitioner")
        return secondary if secondary != primary_specialist else None

    def _build_explanation(
        self,
        base: float, weighted: float, gendered: float,
        duration_adj: float, final: float,
        region: str, weight: float, gender_f: float,
        combo_rule: Optional[CombinationRule],
        level: UrgencyLevel,
    ) -> str:
        parts = [
            f"Base fuzzy score: {base:.1f}",
            f"After region weight ({region}, ×{weight}): {weighted:.1f}",
            f"After gender factor (×{gender_f}): {gendered:.1f}",
            f"After duration adjustment: {duration_adj:.1f}",
        ]
        if combo_rule is not None:
            parts.append(
                f"Combination rule triggered: {combo_rule.name} "
                f"→ minimum {combo_rule.min_score}"
            )
        parts.append(f"Final score: {final} ({level.value})")
        return " | ".join(parts)


# ─────────────────────────────────────────────
# SINGLETON
# ─────────────────────────────────────────────

fuzzy_engine = BiowireFuzzyEngine()


# ─────────────────────────────────────────────
# LEGACY COMPATIBILITY
# ─────────────────────────────────────────────

def get_specialist_recommendation(symptoms: List[str]) -> str:
    text = " ".join(symptoms).lower()
    keyword_map: Dict[str, List[str]] = {
        "cardiologist":       ["chest", "heart", "cardiac", "palpitation"],
        "neurologist":        ["head", "headache", "migraine", "dizzy"],
        "gastroenterologist": ["stomach", "abdomen", "nausea", "vomit"],
        "urologist":          ["urinary", "kidney", "bladder", "testicular"],
        "pulmonologist":      ["cough", "breath", "lung"],
        "dermatologist":      ["skin", "rash", "itch"],
        "orthopedist":        ["joint", "bone", "back"],
        "ophthalmologist":    ["eye", "vision", "sight"],
        "ent_specialist":     ["ear", "throat", "nose"],
    }
    for specialist, keywords in keyword_map.items():
        if any(_keyword_match(kw, text) for kw in keywords):
            return specialist
    return "general_practitioner"