import { Outlet } from 'react-router-dom'

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-[hsl(var(--secondary))] flex flex-col">
      <header className="bg-[hsl(var(--card))] border-b px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-lg font-bold text-[hsl(var(--foreground))]">Feria Effix</h1>
          <p className="text-xs text-[hsl(var(--muted-foreground))]">Firma electrónica de contratos</p>
        </div>
      </header>

      <main className="flex-1 py-8 px-4">
        <div className="max-w-3xl mx-auto">
          <Outlet />
        </div>
      </main>

      <footer className="bg-[hsl(var(--card))] border-t px-6 py-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-xs text-[hsl(var(--muted-foreground))]">
            Firma electrónica válida conforme a la Ley 527 de 1999 y el Decreto 2364 de 2012 de Colombia
          </p>
        </div>
      </footer>
    </div>
  )
}
