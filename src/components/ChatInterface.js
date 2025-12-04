export default function ChatInterface({ query, onQueryChange, onQuerySubmit, loading }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && !loading) {
      onQuerySubmit(query);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <textarea
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Что умеешь?"
        disabled={loading}
        style={{
          width: '100%',
          minHeight: 100,
          padding: 12,
          borderRadius: 8,
          background: '#11162a',
          color: '#f8fafc',
          border: '1px solid #334155',
          fontFamily: 'inherit',
          fontSize: 14,
          resize: 'vertical'
        }}
      />
      <button
        type="submit"
        disabled={loading || !query.trim()}
        style={{
          marginTop: 12,
          padding: '10px 24px',
          background: loading || !query.trim() ? '#475569' : '#6366f1',
          color: 'white',
          border: 'none',
          borderRadius: 8,
          cursor: loading || !query.trim() ? 'not-allowed' : 'pointer',
          fontWeight: 600,
          fontSize: 14,
          transition: 'background 0.2s'
        }}
      >
        {loading ? 'Обработка...' : 'Отправить запрос'}
      </button>
    </form>
  );
}

