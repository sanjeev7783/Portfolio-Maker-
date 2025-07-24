import Portfolio from "../../components/Portfolio"

interface PageProps {
  params: Promise<{
    userId: string
  }>
}

export default async function PortfolioPage({ params }: PageProps) {
  const { userId } = await params
  return <Portfolio userId={userId} />
}
