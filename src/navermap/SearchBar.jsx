import { useState } from 'react';

const SearchBar = ({ onSearch, onCurrentLocation, locationLoading = false, onAutoSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm.trim());
    }
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCurrentLocation = () => {
    if (onCurrentLocation) {
      onCurrentLocation();
    }
    // 현재 위치 확인 후 자동으로 상담센터 검색 실행
    if (onAutoSearch) {
      onAutoSearch();
    }
  };

  return (
    <div className="w-full space-y-3">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          placeholder="매장, 지역 검색"
          className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent"
          style={{ 
            borderColor: '#CEF4E7',
            backgroundColor: '#F9FAF9',
            color: '#111827'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#30E8AB';
            e.target.style.ringColor = '#30E8AB';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#CEF4E7';
          }}
        />
        <button
          type="submit"
          className="px-6 py-2 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors"
          style={{ 
            backgroundColor: 'rgb(39, 192, 141)'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = 'rgb(35, 173, 127)';
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'rgb(39, 192, 141)';
          }}
        >
          검색
        </button>
      </form>
      
      <button
        onClick={handleCurrentLocation}
        disabled={locationLoading}
        className={`w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2 ${
          locationLoading 
            ? 'cursor-not-allowed' 
            : ''
        }`}
        style={{
          backgroundColor: locationLoading ? '#CEF4E7' : 'rgb(39, 192, 141)',
          color: locationLoading ? '#111827' : 'white'
        }}
        onMouseEnter={(e) => {
          if (!locationLoading) {
            e.target.style.backgroundColor = 'rgb(35, 173, 127)';
          }
        }}
        onMouseLeave={(e) => {
          if (!locationLoading) {
            e.target.style.backgroundColor = 'rgb(39, 192, 141)';
          }
        }}
      >
        {locationLoading ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            위치 찾는 중...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            내 위치 찾기
          </>
        )}
      </button>
    </div>
  );
};

export default SearchBar;
