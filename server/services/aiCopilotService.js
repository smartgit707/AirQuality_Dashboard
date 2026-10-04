const { fetchAndStoreCityTelemetry } = require('../controllers/airQualityController');
const { supportedCityNames, getCityConfig } = require('../config/cities');

/**
 * EcoSense AI Environmental Copilot Service
 * Provides grounded conversational intelligence using real-time sensor telemetry.
 * Supports Google Gemini API integration with a sophisticated built-in fallback engine.
 */

/**
 * Health & AQI classification helper
 */
function evaluateAirQuality(aqi, pm25) {
  const val = Number(aqi) || 0;
  if (val <= 50) {
    return {
      category: 'Good',
      color: '#10b981',
      outdoorSafety: 'Safe for all outdoor activities including intense cardio.',
      maskRecommendation: 'No mask necessary.',
      indoorGuidance: 'Natural ventilation is encouraged. Keep windows open.'
    };
  }
  if (val <= 100) {
    return {
      category: 'Moderate',
      color: '#fbbf24',
      outdoorSafety: 'Acceptable for most individuals. Unusually sensitive people should consider shorter workouts.',
      maskRecommendation: 'Optional; advisable for prolonged roadside exposure.',
      indoorGuidance: 'Standard ventilation is adequate.'
    };
  }
  if (val <= 150) {
    return {
      category: 'Unhealthy for Sensitive Groups',
      color: '#f97316',
      outdoorSafety: 'Children, elderly, and people with respiratory conditions (asthma) should reduce strenuous outdoor exertion.',
      maskRecommendation: 'N95 or equivalent recommended during prolonged outdoor periods.',
      indoorGuidance: 'Keep windows closed during peak morning/evening hours; run HEPA air filtration if available.'
    };
  }
  if (val <= 200) {
    return {
      category: 'Unhealthy',
      color: '#ef4444',
      outdoorSafety: 'Everyone may begin to experience health effects. Avoid prolonged aerobic running or cycling outdoors.',
      maskRecommendation: 'N95 mask strongly advised outdoors.',
      indoorGuidance: 'Seal windows and doors; run indoor air purifiers on high.'
    };
  }
  return {
    category: 'Hazardous',
    color: '#881337',
    outdoorSafety: 'Serious health alert: avoid all outdoor physical activity.',
    maskRecommendation: 'Strict N95/FFP2 mask required if going outside is unavoidable.',
    indoorGuidance: 'Remain indoors in a clean-air shelter with active HEPA air purification.'
  };
}

/**
 * Call Google Gemini 1.5 API if key is present
 */
async function callGeminiApi(apiKey, userMessage, cityTelemetry, comparisonTelemetry, userContext) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

  const telemetryContext = `
CURRENT REAL-TIME ENVIRONMENTAL GROUND TRUTH:
- Primary Target City: ${cityTelemetry.city} (${cityTelemetry.state || 'India'})
- Air Quality Index (AQI): ${cityTelemetry.aqi}
- Particulate Matter (PM2.5): ${cityTelemetry.pm25} µg/m³
- Coarse Particulates (PM10): ${cityTelemetry.pm10} µg/m³
- Nitrogen Dioxide (NO2): ${cityTelemetry.no2} µg/m³
- Sulfur Dioxide (SO2): ${cityTelemetry.so2} µg/m³
- Carbon Monoxide (CO): ${cityTelemetry.co} mg/m³
- Ozone (O3): ${cityTelemetry.o3} µg/m³
- Ambient Temperature: ${cityTelemetry.temperature}°C
- Relative Humidity: ${cityTelemetry.humidity}%
- Wind Velocity: ${cityTelemetry.windSpeed || cityTelemetry.wind_speed} km/h
- Atmospheric Pressure: ${cityTelemetry.pressure} hPa
${comparisonTelemetry ? `
COMPARISON CITY DATA (${comparisonTelemetry.city}):
- AQI: ${comparisonTelemetry.aqi} | PM2.5: ${comparisonTelemetry.pm25} µg/m³ | Temp: ${comparisonTelemetry.temperature}°C | Humidity: ${comparisonTelemetry.humidity}%
` : ''}
${userContext ? `
USER PROFILE:
- Name: ${userContext.name || 'Citizen Observer'}
- Role: ${userContext.role || 'USER'}
- Personal Alert Threshold: ${userContext.aqiThreshold || 100} AQI
` : ''}
`;

  const systemInstruction = `
You are the EcoSense Environmental Copilot, an expert AI atmospheric scientist and public health advisor for the EcoSense Environmental Intelligence platform.
Your objective is to provide concise, scientifically accurate, and actionable environmental advice grounded STRICTLY in the real-time sensor data provided.

Guidelines:
1. Ground your answer in the current real-time telemetry numbers (quote AQI, PM2.5, temperature, etc. explicitly).
2. Format your response cleanly using concise bullet points, bold highlights, and markdown emojis.
3. Be friendly, protective, and practical (e.g. recommend specific times of day, mask types, ventilation tips).
4. If asked about sports/jogging/cycling, give concrete time windows (e.g., afternoon vs morning inversion).
5. Keep responses between 120 and 260 words for quick reading on mobile or web dashboards.
6. Provide exactly 3 short follow-up suggested questions at the very end formatted as:
[SUGGESTIONS]
1. <Follow-up question 1>
2. <Follow-up question 2>
3. <Follow-up question 3>
`;

  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [
          { text: `${systemInstruction}\n\n${telemetryContext}\n\nUSER QUESTION: ${userMessage}` }
        ]
      }
    ],
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 600
    }
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API returned ${response.status}: ${errText}`);
  }

  const data = await response.json();
  const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  // Extract suggestions if present
  let reply = rawText;
  let suggestions = [];
  if (rawText.includes('[SUGGESTIONS]')) {
    const parts = rawText.split('[SUGGESTIONS]');
    reply = parts[0].trim();
    const suggestionsBlock = parts[1] || '';
    suggestions = suggestionsBlock
      .split('\n')
      .map(s => s.replace(/^\d+\.\s*/, '').replace(/^-\s*/, '').trim())
      .filter(s => s.length > 5)
      .slice(0, 3);
  }

  return { reply, suggestions };
}

/**
 * Built-in EcoSense Environmental Reasoning Engine (Fallback)
 * Generates rich, context-aware answers without requiring third-party API keys.
 */
function generateContextualHeuristicReply(message, cityTelemetry, comparisonTelemetry, userContext) {
  const query = (message || '').toLowerCase();
  const cityName = cityTelemetry.city;
  const aqi = Number(cityTelemetry.aqi) || 75;
  const pm25 = Number(cityTelemetry.pm25) || 30;
  const pm10 = Number(cityTelemetry.pm10) || 55;
  const no2 = Number(cityTelemetry.no2) || 22;
  const temp = Number(cityTelemetry.temperature) || 27;
  const hum = Number(cityTelemetry.humidity) || 60;
  const wind = Number(cityTelemetry.windSpeed || cityTelemetry.wind_speed) || 10;
  const health = evaluateAirQuality(aqi, pm25);

  let reply = '';
  let suggestions = [];

  // 1. OUTDOOR EXERCISE / RUNNING / JOGGING / CYCLING
  if (query.includes('jog') || query.includes('run') || query.includes('exercise') || query.includes('workout') || query.includes('walk') || query.includes('cycling') || query.includes('sport')) {
    if (aqi <= 50) {
      reply = `### 🏃 Outdoor Activity Advisory for ${cityName}\n\n` +
        `**Optimal Conditions Confirmed!** The air quality in **${cityName}** is currently **${health.category}** with an AQI of **${aqi}** and fine particulate matter (PM2.5) at **${pm25} µg/m³**.\n\n` +
        `* **Activity Status**: All outdoor sports, high-intensity running, and cycling are completely safe.\n` +
        `* **Best Window**: Anytime today, particularly during early morning or sunset when temperatures are around **${temp}°C**.\n` +
        `* **Hydration**: Ambient humidity is **${hum}%**, so maintain regular fluid intake.`;
    } else if (aqi <= 100) {
      reply = `### 🏃 Outdoor Activity Advisory for ${cityName}\n\n` +
        `The air in **${cityName}** is currently **${health.category}** with an AQI of **${aqi}** (PM2.5: **${pm25} µg/m³**).\n\n` +
        `* **General Public**: Light-to-moderate outdoor jogging, walking, or recreational sports are safe.\n` +
        `* **High-Intensity Exertion**: If you are planning an intensive cardio session (e.g. 10km+ run), consider avoiding arterial highway corridors with high diesel traffic where localized NO2 (${no2} µg/m³) spikes occur.\n` +
        `* **Recommended Timing**: Mid-day to early evening when solar heating increases atmospheric mixing layer height.`;
    } else {
      reply = `### ⚠️ Outdoor Activity Advisory for ${cityName}\n\n` +
        `**Caution Advised.** Air quality in **${cityName}** is currently **${health.category}** with an elevated AQI of **${aqi}** and PM2.5 concentration of **${pm25} µg/m³** (WHO safe benchmark: 15 µg/m³ 24h mean).\n\n` +
        `* **Cardio Recommendation**: Shift high-intensity cardio (sprinting, distance running) **indoors** to prevent deep pulmonary deposition of fine particles.\n` +
        `* **Low-Impact Activities**: If you must exercise outdoors, keep exertion light, avoid peak commute hours, and consider wearing an **N95 respirator**.\n` +
        `* **Sensitive Individuals**: People with asthma or cardiovascular conditions should avoid outdoor exertion today.`;
    }

    suggestions = [
      `What mask should I wear in ${cityName}?`,
      `Compare air in ${cityName} with Chennai`,
      `When will ${cityName}'s air improve today?`
    ];
  }

  // 2. MASKS & RESPIRATORY PROTECTION
  else if (query.includes('mask') || query.includes('n95') || query.includes('respirator') || query.includes('protect')) {
    if (aqi <= 70) {
      reply = `### 😷 Mask & Protection Advisory for ${cityName}\n\n` +
        `With an AQI of **${aqi}** (**${health.category}**) and PM2.5 at **${pm25} µg/m³**, a protective mask is **not generally required** for everyday movement.\n\n` +
        `* **Everyday Citizens**: Breathe naturally in outdoor spaces.\n` +
        `* **Exceptions**: If you are spending hours directly beside heavy traffic intersections or active construction zones (PM10: ${pm10} µg/m³), a standard surgical or N95 mask can reduce coarse dust intake.`;
    } else {
      reply = `### 😷 Mask Recommendation for ${cityName}\n\n` +
        `Due to elevated particulate loading in **${cityName}** (AQI: **${aqi}**, PM2.5: **${pm25} µg/m³**), respiratory protection is recommended.\n\n` +
        `* **Recommended Mask**: Use a well-fitted **N95 or FFP2 respirator**. Cloth and simple surgical masks do not filter sub-micron PM2.5 particles effectively.\n` +
        `* **Commuters**: Two-wheeler riders and pedestrians should wear their respirator whenever traveling along congested roadways.\n` +
        `* **Indoor Spaces**: Ensure windows remain shut during heavy morning smog; run an air purifier with a genuine HEPA H13 filter.`;
    }

    suggestions = [
      `Is it safe for children outdoors in ${cityName}?`,
      `Explain why PM2.5 is at ${pm25} µg/m³`,
      `How does ${cityName} compare to Delhi?`
    ];
  }

  // 3. COMPARISON BETWEEN CITIES
  else if (query.includes('compare') || query.includes('cleaner') || query.includes('worse') || query.includes('versus') || query.includes('vs')) {
    if (comparisonTelemetry) {
      const city1 = cityTelemetry.city;
      const city2 = comparisonTelemetry.city;
      const cleaner = cityTelemetry.aqi < comparisonTelemetry.aqi ? city1 : city2;
      const worse = cleaner === city1 ? city2 : city1;
      const diff = Math.abs(cityTelemetry.aqi - comparisonTelemetry.aqi);

      reply = `### ⚖️ Real-Time Telemetry Comparison: ${city1} vs ${city2}\n\n` +
        `Currently, **${cleaner}** enjoys significantly cleaner atmospheric conditions than **${worse}** by a margin of **${diff} AQI points**.\n\n` +
        `| Metric | ${city1} | ${city2} | Difference |\n` +
        `| :--- | :--- | :--- | :--- |\n` +
        `| **AQI** | **${cityTelemetry.aqi}** | **${comparisonTelemetry.aqi}** | Δ ${diff} |\n` +
        `| **PM2.5** | ${cityTelemetry.pm25} µg/m³ | ${comparisonTelemetry.pm25} µg/m³ | ${Math.abs(cityTelemetry.pm25 - comparisonTelemetry.pm25).toFixed(1)} µg/m³ |\n` +
        `| **Temperature** | ${cityTelemetry.temperature}°C | ${comparisonTelemetry.temperature}°C | - |\n` +
        `| **Wind Speed** | ${cityTelemetry.windSpeed || cityTelemetry.wind_speed} km/h | ${comparisonTelemetry.windSpeed || comparisonTelemetry.wind_speed} km/h | - |\n\n` +
        `* **Environmental Driver**: ${cleaner} benefits from ${cleaner === 'Chennai' || cleaner === 'Mumbai' ? 'coastal sea breezes aiding ventilation' : 'higher planetary boundary layer mixing'}, while ${worse} experiences ${worse === 'Delhi' ? 'thermal inversion and dense regional combustion trap' : 'higher localized vehicular emissions'}.`;
    } else {
      reply = `### ⚖️ Urban Air Quality Context\n\n` +
        `In **${cityName}**, the current reading is **${aqi} AQI** (**${health.category}**).\n\n` +
        `Across our network:\n` +
        `* **Coastal Metros** (Chennai, Mumbai) typically maintain lower AQI (60–85) due to continuous sea-breeze dispersion.\n` +
        `* **Plateau Cities** (Hyderabad, Bengaluru) balance moderate AQI (70–95) with elevation-based ventilation.\n` +
        `* **Northern Indo-Gangetic Plains** (Delhi) frequently face elevated particulate concentrations (180–240+ AQI) due to geographical topography and seasonal inversion.\n\n` +
        `*Would you like me to compare ${cityName} against a specific city like Delhi or Chennai?*`;
    }

    suggestions = [
      `Compare ${cityName} vs Delhi`,
      `Compare ${cityName} vs Bengaluru`,
      `Safe outdoor running times today`
    ];
  }

  // 4. SENSITIVE GROUPS / ASTHMA / CHILDREN / ELDERLY
  else if (query.includes('child') || query.includes('kid') || query.includes('asthma') || query.includes('elder') || query.includes('pregnant') || query.includes('baby')) {
    reply = `### 👶 Advisory for Sensitive Demographics in ${cityName}\n\n` +
      `For children, senior citizens, and people with respiratory or cardiovascular sensitivities, current conditions in **${cityName}** (AQI: **${aqi}**, PM2.5: **${pm25} µg/m³**) require measured precautions:\n\n` +
      `* **School Recess & Play**: ${aqi > 100 ? 'Limit prolonged intense athletic matches outdoors; prefer indoor play areas.' : 'Normal outdoor play is permissible.'}\n` +
      `* **Asthma Management**: Keep fast-acting rescue inhalers immediately accessible. Particulate matter acts as a physical irritant triggers airway inflammation.\n` +
      `* **Home Clean Room**: Ensure at least one room (such as the bedroom) has closed windows and an active HEPA air purifier.\n` +
      `* **Ventilation Timing**: Air out rooms around noon to 3:00 PM when wind velocity (${wind} km/h) is highest and surface pollutants are dispersed.`;

    suggestions = [
      `Best indoor air purification tips`,
      `Does humidity affect my breathing in ${cityName}?`,
      `Compare ${cityName} with Bengaluru`
    ];
  }

  // 5. POLLUTANT EXPLANATIONS (PM2.5, NO2, O3, CO)
  else if (query.includes('pm2.5') || query.includes('pm25') || query.includes('pm10') || query.includes('no2') || query.includes('ozone') || query.includes('pollutant') || query.includes('why')) {
    reply = `### 🔬 Atmospheric Pollutant Breakdown for ${cityName}\n\n` +
      `Here is what our sensor array is detecting in **${cityName}** right now:\n\n` +
      `* **PM2.5 (${pm25} µg/m³)**: Microscopic particulate matter smaller than 2.5 microns (1/30th the diameter of human hair). These bypass upper airway filters and penetrate deep into pulmonary alveoli. Primary sources: combustion exhausts, tailpipe emissions, biomass burning.\n` +
      `* **PM10 (${pm10} µg/m³)**: Coarser dust particles from road re-suspension and construction sites.\n` +
      `* **NO2 (${no2} µg/m³)**: Nitrogen Dioxide emitted from vehicle internal combustion engines and power generation.\n` +
      `* **Wind Dispersion**: Current wind speed is **${wind} km/h**. ${wind < 8 ? 'Low wind velocity is allowing pollutants to stagnate near surface level.' : 'Moderate wind velocity is actively helping dilute atmospheric concentrations.'}`;

    suggestions = [
      `Is it safe to exercise right now in ${cityName}?`,
      `Compare ${cityName} with Delhi`,
      `What are the health risks of PM2.5?`
    ];
  }

  // 6. DEFAULT / GENERAL GREETING / AIR SUMMARY
  else {
    reply = `### 🌿 EcoSense Live Intelligence Briefing for ${cityName}\n\n` +
      `Hello! Here is the latest atmospheric overview for **${cityName}**:\n\n` +
      `* **Composite AQI**: **${aqi}** &mdash; <span style="color:${health.color};font-weight:700">${health.category}</span>\n` +
      `* **Fine Particles (PM2.5)**: **${pm25} µg/m³**\n` +
      `* **Micro-Climate**: **${temp}°C**, **${hum}% Relative Humidity**, Wind: **${wind} km/h**\n` +
      `* **Summary**: ${health.outdoorSafety} ${health.maskRecommendation}\n\n` +
      `Feel free to ask me anything about workout timing, mask requirements, city comparisons, or respiratory precautions!`;

    suggestions = [
      `Can I go for a jog in ${cityName} right now?`,
      `Do I need an N95 mask in ${cityName}?`,
      `Compare ${cityName} vs Chennai`
    ];
  }

  return { reply, suggestions };
}

/**
 * Main Copilot Entry Point
 */
async function processCopilotQuery({ message, city = 'Hyderabad', userContext = null }) {
  // 1. Fetch live or latest telemetry for primary city
  const primaryResult = await fetchAndStoreCityTelemetry(city);
  const primaryTelemetry = primaryResult?.record || {
    city,
    aqi: 88,
    pm25: 35,
    pm10: 60,
    no2: 24,
    so2: 8,
    co: 0.8,
    o3: 32,
    temperature: 28,
    humidity: 58,
    windSpeed: 10,
    pressure: 1010
  };

  // 2. Check if query asks to compare with another city
  let comparisonTelemetry = null;
  const msgLower = (message || '').toLowerCase();
  for (const cName of supportedCityNames) {
    if (cName.toLowerCase() !== city.toLowerCase() && msgLower.includes(cName.toLowerCase())) {
      try {
        const compResult = await fetchAndStoreCityTelemetry(cName);
        comparisonTelemetry = compResult?.record || null;
      } catch (e) {
        console.warn(`Could not load comparison city ${cName}:`, e.message);
      }
      break;
    }
  }

  // 3. Attempt Gemini API if key is present
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey && apiKey.trim().length > 10) {
    try {
      const geminiResult = await callGeminiApi(apiKey.trim(), message, primaryTelemetry, comparisonTelemetry, userContext);
      return {
        success: true,
        source: 'Google Gemini 1.5 Grounded Intelligence',
        reply: geminiResult.reply,
        suggestions: geminiResult.suggestions.length > 0 ? geminiResult.suggestions : [
          `Safe outdoor running times in ${city}?`,
          `Mask advice for ${city}`,
          `Compare ${city} with Delhi`
        ],
        city: primaryTelemetry.city,
        aqi: primaryTelemetry.aqi,
        timestamp: new Date().toISOString()
      };
    } catch (apiErr) {
      console.warn('[Copilot] Gemini API call failed, gracefully using built-in reasoning engine:', apiErr.message);
    }
  }

  // 4. Fallback to EcoSense Environmental Reasoning Engine
  const localResult = generateContextualHeuristicReply(message, primaryTelemetry, comparisonTelemetry, userContext);
  return {
    success: true,
    source: 'EcoSense Grounded Heuristic Engine',
    reply: localResult.reply,
    suggestions: localResult.suggestions,
    city: primaryTelemetry.city,
    aqi: primaryTelemetry.aqi,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  processCopilotQuery,
  evaluateAirQuality
};
