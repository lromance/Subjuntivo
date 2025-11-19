import React from 'react';

interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent' | 'outline';
  className?: string;
  disabled?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  onClick, 
  children, 
  variant = 'primary', 
  className = '', 
  disabled = false,
  fullWidth = false
}) => {
  const baseStyles = "py-3 px-6 rounded-xl font-bold transition-all duration-200 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-md";
  
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-teal-500 text-white hover:bg-teal-600 focus:ring-teal-400",
    accent: "bg-amber-400 text-indigo-900 hover:bg-amber-500 focus:ring-amber-400",
    outline: "border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
  };

  const widthClass = fullWidth ? "w-full" : "";
  const disabledClass = disabled ? "opacity-50 cursor-not-allowed pointer-events-none" : "";

  return (
    <button 
      onClick={onClick} 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${disabledClass} ${className}`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};