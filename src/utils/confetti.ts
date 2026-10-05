import confetti from 'canvas-confetti';

export function triggerCompletionConfetti() {
  try {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
      colors: ['#22c55e', '#1877F2', '#0A66C2', '#25D366', '#E60023'],
      disableForReducedMotion: true,
    });
  } catch (e) {
    // Graceful fallback if confetti fails or is blocked
  }
}
