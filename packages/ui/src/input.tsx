"use client"

interface InputProps {
    type: string;
    className?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value?: string;
    placeholder: string;
}

export const Input = ({ type, className, value, onChange, placeholder }: InputProps) => {
    return (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={`p-2 border border-slate-800 text-gray-800 rounded-lg ${className}`} />
    )
}