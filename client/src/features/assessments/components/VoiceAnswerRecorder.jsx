import { useState, useRef, useEffect } from 'react';
import { transcribeAssessmentVoiceApi } from '../api/assessmentApi.js';

export const VoiceAnswerRecorder = ({ language = 'Tamil' }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSupported, setIsSupported] = useState(true);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);

  useEffect(() => {
    // Check if browser supports MediaRecorder
    if (
      typeof window === 'undefined' ||
      !window.navigator?.mediaDevices?.getUserMedia ||
      typeof window.MediaRecorder === 'undefined'
    ) {
      setIsSupported(false);
    }
  }, []);

  const startRecording = async () => {
    setErrorMessage('');
    setTranscript('');
    audioChunksRef.current = [];

    if (!isSupported) {
      setErrorMessage('Audio recording is not supported in this browser. Please use text input instead.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all audio tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await handleTranscription(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Microphone access was denied. You can enable microphone permissions in your browser or type the response directly.');
      } else {
        setErrorMessage(`Microphone error: ${err.message || 'Unable to access microphone'}. You can continue without recording.`);
      }
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleTranscription = async (audioBlob) => {
    setIsTranscribing(true);
    setErrorMessage('');

    try {
      const res = await transcribeAssessmentVoiceApi(audioBlob, language || 'Tamil');
      if (res?.data?.transcript) {
        setTranscript(res.data.transcript);
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Speech-to-text service is temporarily unavailable. You can continue with manual assessment entry.'
      );
    } finally {
      setIsTranscribing(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="card" style={{ marginTop: '1rem' }}>
      <h3 className="card-title">🎙️ Verbal Fluency Voice Transcriber (Sarvam AI)</h3>
      <p style={{ fontSize: '0.85rem', color: '#64748b', margin: '0 0 1rem 0' }}>
        Record student spoken answers in <strong>{language}</strong> to assist with verbal fluency evaluation.
      </p>

      {!isSupported && (
        <div className="alert alert-info">
          <span>ℹ️</span>
          <span>Audio recording is not supported in this browser. You can enter evaluation scores manually.</span>
        </div>
      )}

      {errorMessage && (
        <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
          <span>⚠️</span>
          <span>{errorMessage}</span>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        {!isRecording ? (
          <button
            type="button"
            className="btn btn-primary"
            onClick={startRecording}
            disabled={!isSupported || isTranscribing}
          >
            <span>🎙️</span>
            <span>Start Recording</span>
          </button>
        ) : (
          <button
            type="button"
            className="btn"
            style={{ backgroundColor: '#dc2626', color: '#ffffff' }}
            onClick={stopRecording}
          >
            <span>⏹️</span>
            <span>Stop Recording ({formatTimer(recordingSeconds)})</span>
          </button>
        )}

        {isRecording && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#dc2626', fontWeight: 600, fontSize: '0.875rem' }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#dc2626', animation: 'pulse 1.5s infinite' }}></span>
            Recording live audio...
          </span>
        )}

        {isTranscribing && (
          <span style={{ color: '#2563eb', fontWeight: 600, fontSize: '0.875rem' }}>
            Transcribing speech with Sarvam AI...
          </span>
        )}
      </div>

      {transcript && (
        <div style={{ marginTop: '1.25rem', padding: '1rem', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase' }}>
              Recognized Voice Transcript ({language})
            </span>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => navigator.clipboard?.writeText(transcript)}
            >
              Copy Transcript
            </button>
          </div>
          <p style={{ margin: 0, fontSize: '1rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.6 }}>
            "{transcript}"
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceAnswerRecorder;
