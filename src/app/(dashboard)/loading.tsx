export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto px-2 py-4 flex flex-col gap-4">
      <div className="skeleton h-8 w-48" />
      <div className="skeleton h-4 w-24" />
      <div className="flex flex-col gap-2 mt-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="skeleton h-16 w-full rounded-xl" />
        ))}
      </div>
    </div>
  );
}
