import PortfolioForm from "./components/PortfolioForm"
import DebugPanel from "./components/DebugPanel"

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <DebugPanel />
        <PortfolioForm />
      </div>
    </div>
  )
}
