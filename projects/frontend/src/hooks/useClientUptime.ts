import { useEffect, useState } from 'react';

const formatUptime = (uptime: number) => {
  const seconds = Math.floor((Date.now() - uptime) / 1000);
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;

  if (hours === 0 && minutes === 0) {
    return `${remainingSeconds}s`;
  }
  if (hours === 0) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  return `${hours}h ${minutes}m ${remainingSeconds}s`;
};

export const useClientUptime = (startTime: number | undefined) => {
  const [uptime, setUptime] = useState<string>('');

  useEffect(() => {
    if (!startTime) return;

    const updateUptime = () => {
      setUptime(formatUptime(startTime));
    };

    updateUptime();
    const intervalId = setInterval(updateUptime, 1000);

    return () => clearInterval(intervalId);
  }, [startTime]);

  return uptime;
};
