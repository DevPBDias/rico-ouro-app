interface HeaderProps {
  showAvatar?: boolean;
}

export function Header({ showAvatar = true }: HeaderProps) {
  return (
    <header className="bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-orange-500 tracking-wide">
          OURO
          <br />
          RICO
        </h1>
        {showAvatar && (
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
          </div>
        )}
      </div>
    </header>
  );
}
