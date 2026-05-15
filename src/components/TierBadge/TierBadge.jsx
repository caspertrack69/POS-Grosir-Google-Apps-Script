import Badge from "../ui/badge";

const tierLabel = {
  1: { text: "Pembeli Umum", variant: "default" },
  2: { text: "Mitra Perak", variant: "info" },
  3: { text: "Mitra Emas", variant: "warning" },
  4: { text: "Mitra Platinum", variant: "success" },
};

function TierBadge({ level }) {
  const config = tierLabel[level] || { text: `Level ${level || 1}`, variant: "default" };
  return <Badge variant={config.variant}>{config.text}</Badge>;
}

export default TierBadge;
