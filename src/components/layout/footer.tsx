export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-zinc-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-4 text-sm text-zinc-500">
        <span>&copy; {new Date().getFullYear()} Mini Mall</span>
        <span>微型电商演示项目</span>
      </div>
    </footer>
  );
}
