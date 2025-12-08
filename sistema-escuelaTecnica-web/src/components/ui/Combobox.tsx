import React, { useState, useEffect, useRef } from 'react';
import { Search, ChevronDown, Check } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface Option {
    value: string | number;
    label: string;
}

interface ComboboxProps {
    options: Option[];
    value?: string | number;
    onChange: (value: string | number) => void;
    placeholder?: string;
    className?: string;
    onSearch?: (query: string) => void;
    isLoading?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
    options,
    value,
    onChange,
    placeholder = 'Seleccionar...',
    className,
    onSearch,
    isLoading = false
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const selectedOption = options.find((opt) => opt.value === value);

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

    // Filter options locally if no onSearch prop (client-side filtering)
    // If onSearch is provided, we assume parent handles filtering via API
    const displayedOptions = onSearch 
        ? options 
        : options.filter(opt => opt.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const term = e.target.value;
        setSearchTerm(term);
        if (onSearch) {
            onSearch(term);
        }
    };

    const handleSelect = (optionValue: string | number) => {
        onChange(optionValue);
        setIsOpen(false);
        setSearchTerm(''); // Reset search on select? Or keep it? Let's reset.
    };

    return (
        <div className="relative" ref={containerRef}>
            <div
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen) {
                        setTimeout(() => inputRef.current?.focus(), 100);
                    }
                }}
                className={twMerge(
                    "glass-input w-full flex items-center justify-between cursor-pointer",
                    className
                )}
            >
                <span className={clsx(!selectedOption && "text-gray-400/80")}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <ChevronDown size={18} className="text-gray-400" />
            </div>

            {isOpen && (
                <div className="absolute z-50 mt-2 w-full bg-[#1f2937] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="p-2 border-b border-white/10">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                ref={inputRef}
                                type="text"
                                className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-9 pr-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </div>
                    </div>
                    
                    <div className="max-h-60 overflow-y-auto">
                        {isLoading ? (
                            <div className="p-4 text-center text-gray-400 text-sm">Cargando...</div>
                        ) : displayedOptions.length === 0 ? (
                            <div className="p-4 text-center text-gray-400 text-sm">No se encontraron resultados</div>
                        ) : (
                            <ul className="py-1">
                                {displayedOptions.map((option) => (
                                    <li
                                        key={option.value}
                                        onClick={() => handleSelect(option.value)}
                                        className={clsx(
                                            "px-4 py-2 text-sm cursor-pointer flex items-center justify-between transition-colors",
                                            value === option.value ? "bg-blue-600/20 text-blue-400" : "text-gray-200 hover:bg-white/5"
                                        )}
                                    >
                                        {option.label}
                                        {value === option.value && <Check size={16} />}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
