import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Mic } from 'lucide-react';
import { getAQIStatus } from '../data/mockData';

export default function AudioBriefingButton({ city, aqi, temperature, pm25 }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      setIsSupported(true);
    }
  }, []);

  const handleToggleSpeech = () => {
    if (!isSupported) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const statusObj = getAQIStatus(aqi);
    const speechText = `EcoSense Environmental Dispatch for ${city}. The Air Quality Index is currently ${aqi}, classified as ${statusObj.label}. Ambient temperature is ${Math.round(temperature)} degrees Celsius, with PM 2.5 concentration at ${Math.round(pm25)} micrograms per cubic meter. Recommendation: ${statusObj.healthAdvice}. Thank you for using EcoSense.`;

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.cancel(); // Stop any pending utterances
    window.speechSynthesis.speak(utterance);
  };

  if (!isSupported) return null;

  return (
    <button
      onClick={handleToggleSpeech}
      type="button"
      className="audio-briefing-btn"
      title={isSpeaking ? "Click to stop voice briefing" : "Listen to EcoSense voice dispatch"}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 14px',
        borderRadius: '9999px',
        background: isSpeaking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(56, 189, 248, 0.15)',
        border: `1px solid ${isSpeaking ? 'rgba(239, 68, 68, 0.4)' : 'rgba(56, 189, 248, 0.35)'}`,
        color: isSpeaking ? '#ef4444' : '#38bdf8',
        fontSize: '0.82rem',
        fontWeight: 700,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: isSpeaking ? '0 0 15px rgba(239, 68, 68, 0.3)' : 'none'
      }}
    >
      {isSpeaking ? (
        <>
          <VolumeX size={15} />
          <span>Stop Briefing</span>
          <span className="voice-wave-dot" />
        </>
      ) : (
        <>
          <Volume2 size={15} />
          <span>Voice Dispatch</span>
        </>
      )}
    </button>
  );
}
