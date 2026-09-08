import { Badge } from "@/components/ui/badge";
import { getIssuer, type IssuerId } from "@/lib/organizer";

const issuerVariant: Record<IssuerId, "outline" | "secondary"> = {
  effix: "outline",
  "feria-effix": "secondary",
};

export function IssuerBadge({
  issuerId,
}: {
  issuerId: string | null | undefined;
}) {
  const issuer = getIssuer(issuerId);
  return <Badge variant={issuerVariant[issuer.id]}>{issuer.label}</Badge>;
}
