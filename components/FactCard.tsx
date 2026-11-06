import Link from "next/link";
import Image from "next/image";
import { categoryOf } from "@/lib/categories";
import { pad } from "@/lib/util";
import type { Fact } from "@/lib/facts";

export default function FactCard({ fact, priority }: { fact: Fact; priority?: boolean }) {
  return (
    <Link href={`/facts/${fact.slug}`} className="fcard">
      <div className="img">
        <span className="route num">{pad(fact.number)}</span>
        <Image
          src={fact.thumbnail}
          alt={`Fact card: ${fact.title}`}
          fill
          sizes="(min-width: 860px) 260px, 50vw"
          style={{ objectFit: "cover" }}
          priority={priority}
        />
      </div>
      <h3>{fact.title}</h3>
      <div className="cat">{categoryOf(fact.category).label}</div>
    </Link>
  );
}
