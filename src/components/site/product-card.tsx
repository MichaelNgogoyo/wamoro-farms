import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { brand, type ProductCardData } from "@/lib/content";

export function ProductCard({ product }: { product: ProductCardData }) {
  const message = encodeURIComponent(`Hello Wamoro Farms, I would like to enquire about ${product.name}${product.ageLabel ? ` (${product.ageLabel})` : ""}.`);
  const stockLabels: Record<ProductCardData["stockStatus"], string> = {
    IN_STOCK: "Available",
    LOW_STOCK: "Limited stock",
    OUT_OF_STOCK: "Out of stock",
    SEASONAL: "Seasonal",
  };
  return (
    <article className="product-card">
      <div className="product-image-wrap">
        <Image src={product.image} alt={product.imageAlt} fill sizes="(max-width: 680px) 100vw, (max-width: 1000px) 50vw, 33vw" />
        <span className={`stock-pill stock-${product.stockStatus.toLowerCase()}`}>{stockLabels[product.stockStatus]}</span>
      </div>
      <div className="product-body">
        <div className="product-meta"><span>{product.category}</span><span>{product.ageLabel}</span></div>
        <h3>{product.name}</h3>
        <p>{product.description}</p>
        <div className="product-card-bottom">
          <strong>{product.priceKes > 0 ? `KSh ${product.priceKes.toLocaleString("en-KE")}` : "Enquire for price"}</strong>
          <a className="text-link" href={`https://wa.me/${brand.whatsapp.replace(/\D/g, "")}?text=${message}`} target="_blank" rel="noreferrer">
            Ask about this <ArrowUpRight size={15} />
          </a>
        </div>
      </div>
    </article>
  );
}
