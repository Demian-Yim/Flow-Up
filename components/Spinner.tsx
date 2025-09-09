
import React from 'react';

const Spinner: React.FC = () => {
    return (
        <div className="flex justify-center items-center my-4">
            <div className="w-10 h-10 border-4 border-slate-600 border-t-brand-indigo rounded-full animate-spin"></div>
        </div>
    );
};

export default Spinner;
