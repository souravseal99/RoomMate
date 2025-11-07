export function getStatusBadge(quantity: number, lowThreshold: number) {
  if (quantity === 0) {
    return <span className="px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">Out of Stock</span>;
  }
  if (quantity <= lowThreshold) {
    return <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">Low Stock</span>;
  }
  if (quantity <= lowThreshold * 1.5) {
    return <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Buy Soon</span>;
  }
  return <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">In Stock</span>;
}