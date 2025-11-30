import React from 'react';
import Heatmap from './Heatmap';
import { useStore } from '../hooks/useStore';
import ScrambledText from './ScrambledText';

const Stats = () => {
    const { studyLog } = useStore();

    return (
        <div className="max-w-4xl mx-auto w-full">
            <div className="flex justify-center mb-8">
                <ScrambledText
                    radius={100}
                    duration={1.2}
                    speed={0.5}
                    scrambleChars="!<>-_\\/[]{}—=+*^?#________"
                    className="text-white text-6xl font-extrabold text-center"
                >
                    Statistics
                </ScrambledText>
            </div>

            <div className="glass-panel p-8">
                <h3 className="text-2xl font-semibold mb-6 text-gray-800">Study Heatmap</h3>
                <div className="bg-gray-900 rounded-xl p-6 shadow-inner">
                    <Heatmap data={studyLog} />
                </div>
            </div>
        </div>
    );
};

export default Stats;
