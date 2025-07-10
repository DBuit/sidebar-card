/**
 * Convert a Duration hh:mm:ss format to seconds
 * @param duration hh:mm:ss formated duration
 * @returns duration in seconds
 */
 export default function durationToSeconds(duration: string): number {
  const parts = duration.split(":").map(Number);
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
}
