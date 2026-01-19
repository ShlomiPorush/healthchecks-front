// Convert cron expressions to human-readable format
export function cronToHuman(cronExpression) {
    if (!cronExpression) return null;

    const parts = cronExpression.trim().split(/\s+/);
    if (parts.length < 5) return cronExpression;

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    // Helper to format time
    const formatTime = (h, m) => {
        const hh = h.padStart(2, '0');
        const mm = m.padStart(2, '0');
        return `${hh}:${mm}`;
    };

    // Day of week names
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayNamesShort = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Month names
    const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    try {
        // Every minute
        if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return 'Every minute';
        }

        // Every X minutes
        if (minute.startsWith('*/') && hour === '*') {
            const interval = minute.slice(2);
            return `Every ${interval} minutes`;
        }

        // Every hour at specific minute
        if (minute !== '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return `Every hour at :${minute.padStart(2, '0')}`;
        }

        // Every X hours
        if (hour.startsWith('*/')) {
            const interval = hour.slice(2);
            return `Every ${interval} hours`;
        }

        // Specific time every day
        if (minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
            return `Daily at ${formatTime(hour, minute)}`;
        }

        // Specific day of week
        if (minute !== '*' && hour !== '*' && dayOfMonth === '*' && month === '*' && dayOfWeek !== '*') {
            const days = dayOfWeek.split(',').map(d => {
                const dayNum = parseInt(d);
                if (d === 'SUN' || dayNum === 0) return 'Sun';
                if (d === 'MON' || dayNum === 1) return 'Mon';
                if (d === 'TUE' || dayNum === 2) return 'Tue';
                if (d === 'WED' || dayNum === 3) return 'Wed';
                if (d === 'THU' || dayNum === 4) return 'Thu';
                if (d === 'FRI' || dayNum === 5) return 'Fri';
                if (d === 'SAT' || dayNum === 6) return 'Sat';
                return d;
            }).join(', ');
            return `${days} at ${formatTime(hour, minute)}`;
        }

        // Specific day of month
        if (minute !== '*' && hour !== '*' && dayOfMonth !== '*' && month === '*' && dayOfWeek === '*') {
            const day = parseInt(dayOfMonth);
            const suffix = day === 1 ? 'st' : day === 2 ? 'nd' : day === 3 ? 'rd' : 'th';
            return `${day}${suffix} of month at ${formatTime(hour, minute)}`;
        }

        // Fallback: return simplified version
        let result = '';

        if (dayOfWeek !== '*') {
            const days = dayOfWeek.split(',').map(d => {
                if (d === 'SUN' || d === '0') return 'Sun';
                if (d === 'MON' || d === '1') return 'Mon';
                if (d === 'TUE' || d === '2') return 'Tue';
                if (d === 'WED' || d === '3') return 'Wed';
                if (d === 'THU' || d === '4') return 'Thu';
                if (d === 'FRI' || d === '5') return 'Fri';
                if (d === 'SAT' || d === '6') return 'Sat';
                return d;
            }).join(', ');
            result = days;
        } else if (dayOfMonth !== '*') {
            result = `Day ${dayOfMonth}`;
        } else {
            result = 'Daily';
        }

        if (hour !== '*' && minute !== '*') {
            result += ` at ${formatTime(hour, minute)}`;
        }

        return result || cronExpression;

    } catch (e) {
        return cronExpression;
    }
}
