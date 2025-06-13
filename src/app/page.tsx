export default function HomePage() {
  const currentPath = "C:...."; //

  return (
    <main>
      <h1>Env UI</h1>
      <pre>{JSON.stringify(currentPath, null, 2)}</pre>
    </main>
  );
}
