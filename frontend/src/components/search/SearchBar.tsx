import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, AlertCircle } from 'lucide-react';

export const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isError, setIsError] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();

    if (trimmed.length < 2) {
      setIsError(true);
      setTimeout(() => setIsError(false), 1500); // 1.5초 후 에러 테두리 복구
      return;
    }

    setIsError(false);
    navigate(`/search?q=${encodeURIComponent(trimmed)}`);
  };

  return (
    <form
      onSubmit={handleSearch}
      className={`relative flex items-center h-10 w-44 sm:w-60 md:w-72 rounded-xl border transition-all duration-300 backdrop-blur-md overflow-hidden ${
        isError
          ? 'border-red-500 bg-red-500/5 text-red-400 animate-wiggle shadow-lg shadow-red-950/20'
          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 focus-within:border-violet-500 focus-within:bg-zinc-900/80 focus-within:text-zinc-100 focus-within:shadow-lg focus-within:shadow-violet-950/10'
      }`}
    >
      <input
        type="text"
        placeholder={isError ? '2글자 이상 입력해주세요' : '통합 검색...'}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          if (e.target.value.trim().length >= 2) {
            setIsError(false);
          }
        }}
        className="w-full h-full bg-transparent border-none outline-none px-3.5 text-xs font-medium placeholder-zinc-500 focus:placeholder-zinc-400 focus:ring-0"
      />
      
      <button
        type="submit"
        className={`h-full px-3.5 flex items-center justify-center border-l transition-colors ${
          isError
            ? 'border-red-500/20 text-red-400 hover:bg-red-500/10'
            : 'border-zinc-800/80 hover:bg-white/5 text-zinc-400 hover:text-zinc-100'
        }`}
        title="검색"
      >
        {isError ? (
          <AlertCircle className="w-4 h-4 text-red-400" />
        ) : (
          <Search className="w-4 h-4 transition-transform duration-300 group-focus-within:scale-110" />
        )}
      </button>
    </form>
  );
};
export default SearchBar;
