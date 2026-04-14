from groq import Groq
from django.conf import settings

client = Groq(api_key=settings.GROQ_API_KEY)

def generate_solution(title, description, category):
    prompt = f"""
You are a practical assistant helping users resolve household issues on their own before calling a technician.

Complaint Details:
Title: {title}
Description: {description}
Category: {category}

Goal:
Help the user try simple checks and fixes first so the issue can be resolved without professional help if possible.

Instructions:
- Provide 4 to 5 short, clear, and actionable steps.
- Focus only on basic checks, safe actions, and simple fixes.
- Do NOT suggest a technician unless absolutely necessary (only as the final step).
- Use simple language that anyone can understand.
- Do NOT repeat the complaint.

STRICT OUTPUT FORMAT (VERY IMPORTANT):
- Return ONLY a valid JSON array.
- Each item must be a single step as a string.
- Do NOT include numbering, bullets, or extra text.
- Do NOT include explanations outside the JSON.
- Do NOT wrap the JSON in markdown (no ```).

Example Output:
[
  "Check if the device is properly plugged into the power source",
  "Ensure the power switch is turned on",
  "Clean any visible dust or blockage carefully",
  "Try restarting the device after a few minutes",
  "If the issue still continues, consider contacting support"
]
"""
    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        messages=[
            {"role": "user", "content": prompt}
        ],
        temperature=0.5,
        max_tokens=200
    )
    return response.choices[0].message.content.strip()