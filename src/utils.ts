export const formatTimeAgo = (timestamp: number): string => {
  const now = new Date();
  const secondsPast = (now.getTime() - new Date(timestamp).getTime()) / 1000;

  if (secondsPast < 60) {
    const seconds = Math.round(secondsPast);
    return seconds <= 1 ? '1s ago' : `${seconds}s ago`;
  }
  if (secondsPast < 3600) {
    const minutes = Math.round(secondsPast / 60);
    return minutes <= 1 ? '1m ago' : `${minutes}m ago`;
  }
  if (secondsPast <= 86400) {
    const hours = Math.round(secondsPast / 3600);
    return hours <= 1 ? '1h ago' : `${hours}h ago`;
  }
  
  const days = Math.round(secondsPast / 86400);
  if (days <= 7) {
    return days <= 1 ? '1d ago' : `${days}d ago`;
  }
  
  return new Date(timestamp).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
