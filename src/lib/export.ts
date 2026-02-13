import { Product } from '@/hooks/useProducts';

/**
 * Convert products array to CSV string
 */
export function productsToCSV(products: Product[]): string {
  const headers = [
    'Product Name',
    'Product Type',
    'Fill Weight/Unit',
    'Fill Unit',
    'Units per Batch',
    'Selling Pack Size',
    'Materials Cost/Unit ($)',
    'Packaging Cost/Unit ($)',
    'Labor Cost/Unit ($)',
    'Shipping Cost/Unit ($)',
    'Total COGS/Unit ($)',
    'Wholesale Markup (%)',
    'Retail Markup (%)',
    'Wholesale Price ($)',
    'Retail Price ($)',
    'Labor Rate/Hour ($)',
    'Labor Hours/Batch',
    'Shipping Overhead/Batch ($)',
    'Created At',
    'Updated At',
  ];

  const rows = products.map((product) => [
    escapeCSVField(product.name),
    product.product_type,
    product.fill_weight_per_unit,
    product.fill_unit,
    product.units_per_batch,
    product.selling_pack_size || 1,
    product.materials_cost_per_unit.toFixed(4),
    product.packaging_cost_per_unit.toFixed(4),
    product.labor_cost_per_unit.toFixed(4),
    product.shipping_cost_per_unit.toFixed(4),
    product.total_cogs_per_unit.toFixed(2),
    product.wholesale_markup,
    product.retail_markup,
    product.wholesale_price.toFixed(2),
    product.retail_price.toFixed(2),
    product.labor_rate_per_hour,
    product.labor_hours_per_batch,
    product.shipping_overhead_per_batch,
    new Date(product.created_at).toLocaleDateString(),
    new Date(product.updated_at).toLocaleDateString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map((row) => row.join(',')),
  ].join('\n');

  return csvContent;
}

/**
 * Escape special characters in CSV fields
 */
function escapeCSVField(field: string): string {
  if (field.includes(',') || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }
  return field;
}

/**
 * Download a string as a file
 */
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  URL.revokeObjectURL(url);
}

/**
 * Export products to CSV and trigger download
 */
export function exportProductsToCSV(products: Product[]): void {
  const csvContent = productsToCSV(products);
  const date = new Date().toISOString().split('T')[0];
  const filename = `products-export-${date}.csv`;
  downloadCSV(csvContent, filename);
}
