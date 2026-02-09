import React, { useState, useRef, useEffect } from 'react';
import { ChevronRightIcon } from './icons';

interface Option {
    value: string;
    label: string;
}

interface MultiSelectProps {
    label: string;
    options: Option[];
    selected: string[];
    onChange: (selected: string[]) => void;
}

const MultiSelect: React.FC<MultiSelectProps> = ({ label, options, selected, onChange }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (value: string) => {
        const newSelected = selected.includes(value)
            ? selected.filter(v => v !== value)
            : [...selected, value];
        onChange(newSelected);
    };

    return (
        <div className="relative" ref={containerRef}>
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                {label}
            </label>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full p-3 bg-white border rounded-xl font-bold text-left flex justify-between items-center transition-all ${isOpen ? 'border-indigo-500 ring-2 ring-indigo-500/20' : 'border-slate-200 hover:border-indigo-300'
                    }`}
            >
                <span className={`truncate ${selected.length === 0 ? 'text-slate-400' : 'text-slate-700'}`}>
                    {selected.length === 0
                        ? 'Pilih...'
                        : `${selected.length} Terpilih`}
                </span>
                <ChevronRightIcon className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-90' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-slate-100 p-2 max-h-60 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                    {options.length === 0 ? (
                        <p className="text-sm text-slate-400 p-2 text-center">Tidak ada data</p>
                    ) : (
                        <div className="space-y-1">
                            {options.map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => toggleOption(option.value)}
                                    className={`w-full flex items-center gap-3 p-2 rounded-lg text-sm font-bold transition-colors ${selected.includes(option.value)
                                            ? 'bg-indigo-50 text-indigo-700'
                                            : 'text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${selected.includes(option.value)
                                            ? 'bg-indigo-600 border-indigo-600'
                                            : 'border-slate-300 bg-white'
                                        }`}>
                                        {selected.includes(option.value) && (
                                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MultiSelect;
