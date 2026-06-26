const MEDICAL_SPECIALITIES = [
  { text: "Cardiology - Treats heart and blood vessel problems, chest pain, high blood pressure." },
  { text: "Dermatology - Treats skin, hair, and nail problems, rashes, acne, skin cancer." },
  { text: "Neurology - Treats brain, spinal cord, and nerve issues, headaches, seizures, stroke." },
  { text: "Pediatrics - General medical care for children and infants." },
  { text: "Orthopedics - Treats bone, joint, muscle, ligament, and tendon injuries or conditions." },
  { text: "Psychiatry - Treats mental health conditions, depression, anxiety, behavioral issues." },
  { text: "Gastroenterology - Treats digestive system issues, stomach, intestines, liver." },
  { text: "Ophthalmology - Treats eye and vision problems, glaucoma, cataracts." },
  { text: "ENT (Otolaryngology) - Treats ear, nose, and throat conditions." },
  { text: "Urology - Treats urinary tract issues and male reproductive system." },
  { text: "Gynecology - Treats female reproductive health, menstruation, menopause." },
  { text: "Endocrinology - Treats hormone imbalances, diabetes, thyroid issues." },
  { text: "Pulmonology - Treats lung and respiratory tract issues, asthma, COPD." },
  { text: "Rheumatology - Treats autoimmune diseases, arthritis, joint pain." },
  { text: "Oncology - Diagnosis and treatment of cancer." },
  { text: "Nephrology - Treats kidney problems." },
  { text: "Hematology - Treats blood disorders, anemia, clotting issues." },
  { text: "General Physician - Primary care, general health, routine checkups, mild illnesses." }
];

exports.recommendSpecialist = async (req, res) => {
  try {
    const { symptoms } = req.body;
    
    if (!symptoms) {
      return res.status(400).json({ error: 'Symptoms description is required.' });
    }

    const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
    if (!OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set in environment variables.');
      return res.status(500).json({ error: 'AI service configuration error.' });
    }

    const response = await fetch("https://openrouter.ai/api/v1/rerank", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:5173", // Optional
        "X-OpenRouter-Title": "MediBook Health", // Optional
      },
      body: JSON.stringify({
        model: "nvidia/llama-nemotron-rerank-vl-1b-v2:free",
        query: `The patient is experiencing the following symptoms: ${symptoms}. Which medical specialist should they see?`,
        documents: MEDICAL_SPECIALITIES,
        top_n: 3
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenRouter API Error:', errorData);
      return res.status(response.status).json({ error: 'Failed to fetch recommendation from AI service.' });
    }

    const data = await response.json();
    
    // Extract the speciality name from the top results (e.g., "Cardiology - ... " -> "Cardiology")
    const recommendations = data.results.map(result => {
      const sourceText = result.document.text;
      const specialityName = sourceText.split(' - ')[0];
      return {
        speciality: specialityName,
        score: result.relevance_score,
        reasoning: sourceText.split(' - ')[1]
      };
    });

    res.json({ success: true, recommendations });
  } catch (err) {
    console.error('Error in recommendSpecialist:', err);
    res.status(500).json({ error: 'Internal server error during AI recommendation.' });
  }
};
