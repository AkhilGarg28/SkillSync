const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function getLocalTimeInfo(date, timeZone = 'UTC') {
  try {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timeZone || 'UTC',
      weekday: 'long',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    const parts = formatter.formatToParts(date);
    const partMap = {};
    parts.forEach((p) => {
      partMap[p.type] = p.value;
    });

    let hourStr = partMap.hour === '24' ? '00' : partMap.hour;
    const dayOfWeek = partMap.weekday;
    const dateStr = `${partMap.year}-${partMap.month}-${partMap.day}`;
    const timeStr = `${hourStr}:${partMap.minute}`;

    return { dayOfWeek, dateStr, timeStr };
  } catch (err) {
    const dayOfWeek = DAYS[date.getUTCDay()];
    const dateStr = date.toISOString().split('T')[0];
    const hours = String(date.getUTCHours()).padStart(2, '0');
    const minutes = String(date.getUTCMinutes()).padStart(2, '0');
    const timeStr = `${hours}:${minutes}`;
    return { dayOfWeek, dateStr, timeStr };
  }
}

function isUserAvailable(proposedDate, userAvailability, durationMinutes = 60) {
  if (!userAvailability) {
    return { isAvailable: false, reason: 'User availability data missing' };
  }

  const { timezone, weeklySlots = [], blackoutDates = [] } = userAvailability;
  const proposedEndDate = new Date(proposedDate.getTime() + durationMinutes * 60 * 1000);

  const startInfo = getLocalTimeInfo(proposedDate, timezone);
  const endInfo = getLocalTimeInfo(proposedEndDate, timezone);

  if (blackoutDates.includes(startInfo.dateStr) || blackoutDates.includes(endInfo.dateStr)) {
    return {
      isAvailable: false,
      reason: `Proposed date (${startInfo.dateStr}) falls on user blackout date`,
    };
  }

  const matchingSlots = weeklySlots.filter(
    (slot) => slot.dayOfWeek && slot.dayOfWeek.toLowerCase() === startInfo.dayOfWeek.toLowerCase()
  );

  if (matchingSlots.length === 0) {
    return {
      isAvailable: false,
      reason: `User is not available on ${startInfo.dayOfWeek}s`,
    };
  }

  const isWithinSlot = matchingSlots.some((slot) => {
    const isStartValid = startInfo.timeStr >= slot.startTime;
    const isEndValid = endInfo.timeStr <= slot.endTime;
    return isStartValid && isEndValid;
  });

  if (!isWithinSlot) {
    return {
      isAvailable: false,
      reason: `Proposed time (${startInfo.timeStr}-${endInfo.timeStr}) is outside user's weekly available hours`,
    };
  }

  return { isAvailable: true };
}

function validateMutualAvailability(proposedTime, user1Availability, user2Availability, durationMinutes = 60) {
  const proposedDate = new Date(proposedTime);
  if (isNaN(proposedDate.getTime())) {
    return { isValid: false, reason: 'Invalid proposed time format' };
  }

  const user1Check = isUserAvailable(proposedDate, user1Availability, durationMinutes);
  if (!user1Check.isAvailable) {
    return { isValid: false, reason: `User 1 unavailable: ${user1Check.reason}` };
  }

  const user2Check = isUserAvailable(proposedDate, user2Availability, durationMinutes);
  if (!user2Check.isAvailable) {
    return { isValid: false, reason: `User 2 unavailable: ${user2Check.reason}` };
  }

  return { isValid: true };
}

function findOverlappingSlots(user1Availability, user2Availability) {
  if (!user1Availability?.weeklySlots || !user2Availability?.weeklySlots) {
    return [];
  }

  const overlaps = [];

  DAYS.forEach((day) => {
    const u1Slots = user1Availability.weeklySlots.filter(
      (s) => s.dayOfWeek && s.dayOfWeek.toLowerCase() === day.toLowerCase()
    );
    const u2Slots = user2Availability.weeklySlots.filter(
      (s) => s.dayOfWeek && s.dayOfWeek.toLowerCase() === day.toLowerCase()
    );

    u1Slots.forEach((s1) => {
      u2Slots.forEach((s2) => {
        const overlapStart = s1.startTime > s2.startTime ? s1.startTime : s2.startTime;
        const overlapEnd = s1.endTime < s2.endTime ? s1.endTime : s2.endTime;

        if (overlapStart < overlapEnd) {
          overlaps.push({
            dayOfWeek: day,
            startTime: overlapStart,
            endTime: overlapEnd,
          });
        }
      });
    });
  });

  return overlaps;
}

module.exports = {
  validateMutualAvailability,
  isUserAvailable,
  findOverlappingSlots,
  getLocalTimeInfo,
};
