import { Metadata, ResolvingMetadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetails } from '@/components/landing/ProductDetails'
import { getProductById } from '@/lib/api/products.service'
import { Product } from '@/types/product'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  // read route params
  const resolvedParams = await params
  const slug = resolvedParams.slug

  try {
    const product = await getProductById(slug)
    if (!product) throw new Error('Product not found in metadata')
    
    // optionally access and extend (rather than replace) parent metadata
    const previousImages = (await parent).openGraph?.images || []

    const title = product.name
    const description = product.description.substring(0, 160)
    const imageUrl = product.images && product.images.length > 0 
      ? product.images[0] 
      : 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1200&q=80'

    return {
      title: title,
      description: description,
      openGraph: {
        title: title,
        description: description,
        images: [
          {
            url: imageUrl,
            width: 800,
            height: 800,
            alt: title,
          },
          ...previousImages,
        ],
      },
    }
  } catch (error) {
    return {
      title: 'Sản phẩm không tìm thấy',
      description: 'Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.',
    }
  }
}

export default async function ProductPage({ params }: Props) {
  const resolvedParams = await params
  let product: Product | null = null

  try {
    product = await getProductById(resolvedParams.slug)
    if (!product) console.error('Product is null for slug:', resolvedParams.slug)
  } catch (error) {
    console.error('Error fetching product in page component:', error)
    notFound()
  }

  if (!product) {
    notFound()
  }

  return (
    <div className="pt-20 pb-16 bg-stone-50 min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-3xl shadow-sm border border-stone-100 overflow-hidden">
          <ProductDetails product={product} />
        </div>
      </div>
    </div>
  )
}
