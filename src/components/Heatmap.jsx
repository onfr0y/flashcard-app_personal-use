import React from 'react';
import { useStore } from '../hooks/useStore';
import { subDays, format, isSameDay, eachDayOfInterval, startOfYear, endOfYear } from 'date-fns';
import clsx from 'clsx';

const Heatmap = () => {
    const studyLog = useStore((state) => state.studyLog);

    // Generate last 365 days for the heatmap
    const today = new Date();
    const days = eachDayOfInterval({
        start: subDays(today, 364),
        end: today
    });

    const getIntensity = (date) => {
        const log = studyLog.find(l => isSameDay(new Date(l.date), date));
        if (!log) return 0;
        if (log.count > 20) return 4;
        if (log.count > 10) return 3;
        if (log.count > 5) return 2;
        return 1;
    };

    const intensityColors = {
        0: 'bg-gray-200',
        1: 'bg-green-200',
        2: 'bg-green-300',
        3: 'bg-green-400',
        4: 'bg-green-500',
    };

    return (
        <div className="glass-panel p-6 overflow-x-auto">
            <div className="flex gap-1 min-w-max">
                {/* Simplified rendering: just a grid of boxes for now. 
            In a real app, we'd group by weeks. */}
                <div className="grid grid-rows-7 grid-flow-col gap-1">
                    {days.map((day) => {
                        const intensity = getIntensity(day);
                        return (
                            <div
                                key={day.toISOString()}
                                title={`${format(day, 'MMM d, yyyy')}: ${studyLog.find(l => isSameDay(new Date(l.date), day))?.count || 0} reviews`}
                                className={clsx(
                                    "w-3 h-3 rounded-sm transition-colors",
                                    intensityColors[intensity]
                                )}
                            />
                        );
                    })}
                </div>
            </div>
            <div className="mt-4 flex items-center justify-end gap-2 text-xs text-gray-400">
                <span>Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-200" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-300" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span>More</span>
            </div>
        </div>
    );
};

export default Heatmap;
