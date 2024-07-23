export default function Page() {
  return (
    <div className="prose prose-sm prose-invert max-w-none">
      <h1 className="text-xl font-bold">Client Context</h1>

      <ul>
        <li>
          This example uses context to share state between Client Components
          that cross the Server/Client Component boundary.
        </li>
        <li>
          Try incrementing the counter and navigating between pages. Note how
          the counter state is shared across the app even though they are inside
          different layouts and pages that are Server Components.
        </li>
      </ul>

      <div className="flex gap-2"></div>
    </div>
  );
}
