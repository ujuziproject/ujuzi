import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Search, Loader2 } from 'lucide-react';

interface UniversityDropdownProps {
  value: string; // The ID
  onChange: (id: string, name: string) => void;
  className?: string;
}

export function UniversityDropdown({ value, onChange, className }: UniversityDropdownProps) {
  const [universities, setUniversities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  useEffect(() => {
    if (value && universities.length > 0) {
      const u = universities.find(x => x.id === value);
      if (u) setSearchTerm(u.name);
    } else if (!value) {
      setSearchTerm('');
    }
  }, [value, universities]);
  
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchUnis() {
      const { data } = await supabase.from('universities').select('id, name').order('name');
      if (data) setUniversities(data);
      setLoading(false);
    }
    fetchUnis();
  }, []);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        // If they didn't select anything, reset search term to the selected value
        const selected = universities.find(u => u.id === value);
        if (selected && !isOpen) {
          setSearchTerm(selected.name);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [wrapperRef, isOpen, value, universities]);

  const filtered = universities.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className={`relative ${className}`} ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            // Clear selection if they start typing
            if (value) onChange('', e.target.value);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder="Search for your university..."
          className="block w-full px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-accent focus:border-accent text-sm transition-colors"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-surface-alt border border-border rounded-xl shadow-lg max-h-60 overflow-auto">
          {loading ? (
            <div className="p-4 text-center text-slate-500 flex justify-center"><Loader2 className="w-5 h-5 animate-spin" /></div>
          ) : filtered.length > 0 ? (
            <ul className="py-1">
              {filtered.map(u => (
                <li
                  key={u.id}
                  onClick={() => {
                    onChange(u.id, u.name);
                    setSearchTerm(u.name);
                    setIsOpen(false);
                  }}
                  className="px-4 py-2 hover:bg-surface cursor-pointer text-sm font-medium text-ink transition-colors"
                >
                  {u.name}
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-slate-500 text-sm">No universities found.</div>
          )}
        </div>
      )}
    </div>
  );
}
