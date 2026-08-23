export default function Loading() {
  return (
    <main aria-busy="true" aria-label="Loading catalogue">
      <div className="loading-grid">
        <div className="loading-grid__title" />
        <div className="loading-grid__cards">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="loading-grid__card" key={index} />
          ))}
        </div>
      </div>
    </main>
  );
}
