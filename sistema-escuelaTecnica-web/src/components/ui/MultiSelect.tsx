import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check, X } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Option {
    value: string | number;
    label: string;
}

interface MultiSelectProps {
    options: Option[];
    value?: (string | number)[];
    onChange: (value: (string | number)[]) => void;
    placeholder?: string;
    className?: string;
    isLoading?: boolean;
}

export const MultiSelect: React.FC<MultiSelectProps> = ({
    options,
    value = [],
    onChange,
    placeholder = 'Seleccionar...',
    className,
    isLoading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Handle outside click to close dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const displayedOptions = options.filter(opt => 
        opt.label.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelect = (optionValue: string | number) => {
        const newValue = value.includes(optionValue)
            ? value.filter(v => v !== optionValue)
            : [...value, optionValue];
        onChange(newValue);
    };

    const removeValue = (e: React.MouseEvent, optionValue: string | number) => {
        e.stopPropagation();
        onChange(value.filter(v => v !== optionValue));
    };

    const selectedOptions = options.filter(opt => value.includes(opt.value));

    // Determine what to show in the input text area
    // If we have selected items, we show them as badges.
    // If not, we show the placeholder.
    // If open, we might want to focus the search input inside the dropdown, OR have the main box be the search.
    // For this design, let's keep search inside the dropdown to avoid layout shifts of badges.

    return (
        <div className="relative font-sans text-left" ref={containerRef}>
            <div
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        setTimeout(() => inputRef.current?.focus(), 50);
                    }
                }}
                className={twMerge(
                    "w-full bg-white border border-gray-300 rounded-lg px-3 py-2 min-h-[42px] flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent",
                    className
                )}
            >
                <div className="flex flex-wrap gap-2 flex-1">
                    {selectedOptions.length > 0 ? (
                        selectedOptions.map(opt => (
                            <span 
                                key={opt.value} 
                                className="bg-[#eff6ff] text-[#004694] text-xs font-semibold px-2 py-1 rounded border border-blue-200 flex items-center gap-1 shadow-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                {opt.label}
                                <button 
                                    type="button"
                                    onClick={(e) => removeValue(e, opt.value)} 
                                    className="hover:bg-blue-200 text-blue-600 rounded-full p-0.5 transition-colors focus:outline-none"
                                >
                                    <X size={12} strokeWidth={3} />
                                </button>
                            </span>
                        ))
                    ) : (
                        <span className="text-gray-500 text-sm">{placeholder}</span>
                    )}
                </div>
                <div className="flex items-center gap-2 border-l border-gray-200 pl-2 ml-1">
                    {value.length > 0 && (
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange([]);
                            }}
                            className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                            title="Limpiar selección"
                        >
                            <X size={14} />
                        </button>
                    )}
                    <ChevronDown size={18} className={clsx("text-gray-400 transition-transform duration-200", isOpen && "rotate-180")} />
                </div>
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 top-full left-0">
                    <div className="p-2 border-b border-gray-100 bg-gray-50/50">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-white border border-gray-200 rounded-md py-2 pl-9 pr-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                                placeholder="Buscar aula..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400 text-sm flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                                Cargando...
                            </div>
                        ) : displayedOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-500 text-sm italic">
                                "{searchTerm}" no encontrado
                            </div>
                        ) : (
                            <ul className="py-1">
                                {displayedOptions.map((option) => {
                                    const isSelected = value.includes(option.value);
                                    return (
                                        <li
                                            key={option.value}
                                            onClick={() => handleSelect(option.value)}
                                            className={clsx(
                                                "px-4 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors group",
                                                isSelected ? "bg-blue-50 text-[#004694] font-medium" : "text-gray-700 hover:bg-gray-50"
                                            )}
                                        >
                                            <span>{option.label}</span>
                                            {isSelected && (
                                                <Check size={16} className="text-[#004694]" strokeWidth={2.5} />
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </div>
                    <div className="p-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400 text-center">
                        {value.length} seleccionados
                    </div>
                </div>
            )}
        </div>
    );
};
