import React from 'react';
import { motion } from 'framer-motion';
import { format, subDays, eachDayOfInterval, isSameDay } from 'date-fns';

const Heatmap = ({ data = [] }) => {
    const today = new Date();
    const startDate = subDays(today, 364); // Last year

    const dates = eachDayOfInterval({
        start: startDate,
        end: today
    });

    const getColor = (count) => {
        if (count === 0) return 'bg-white/10';
        if (count <= 2) return 'bg-green-900/40 border-green-800/50';
        if (count <= 5) return 'bg-green-700/60 border-green-600/50';
        if (count <= 10) return 'bg-green-500/80 border-green-400/50';
        return 'bg-green-400 border-green-300';
    };

    return (
        <div className="w-full overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                <div className="flex gap-1 mb-2 text-xs text-white/40">
                    <span>Less</span>
                    <div className="flex gap-1">
                        <div className="w-3 h-3 rounded-sm bg-white/10" />
                        <div className="w-3 h-3 rounded-sm bg-green-900/40" />
                        <div className="w-3 h-3 rounded-sm bg-green-700/60" />
                        <div className="w-3 h-3 rounded-sm bg-green-500/80" />
                        <div className="w-3 h-3 rounded-sm bg-green-400" />
                    </div>
                    <span>More</span>
                </div>

                <div className="flex flex-wrap gap-1 h-32 flex-col content-start">
                    {dates.map((date) => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const log = data.find(d => d.date === dateStr);
                        const count = log ? log.count : 0;

                        return (
                            <motion.div
                                key={dateStr}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className={`w-3 h-3 rounded-sm border border-transparent ${getColor(count)} transition-colors hover:border-white/50 relative group`}
                            >
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 backdrop-blur-sm">
                                    {count} reviews on {format(date, 'MMM d, yyyy')}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Heatmap;
