export async function loader({ request }: { request: Request }) {
    const url: URL = new URL(request.url)
    const searchParams: (string | null) = url.searchParams.get('message')
    return searchParams
}