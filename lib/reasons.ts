// The four "who do you need tonight?" reasons, each anchored to a real
// London spot the camera flies to when its chip is tapped. `area` feeds the
// hero eyebrow ("Save me a seat — Wimbledon"); `name` is the caption under
// the chips ("Your pin's at Centre Court, Wimbledon."). The French chip
// additionally swaps the hero vocab into French (lang: "fr").
export type Reason = {
  id: "tennis" | "study" | "dinner" | "french";
  chip: string;
  reply: string;
  lang?: "fr";
  place: {
    name: string;
    area: string;
    center: [number, number];
    zoom: number;
  };
};

export const REASONS: readonly Reason[] = [
  {
    id: "tennis",
    chip: "A tennis partner",
    reply: "I’ll bring rackets 🎾 6 min",
    place: {
      name: "Centre Court, Wimbledon",
      area: "Wimbledon",
      center: [-0.2143, 51.4339],
      zoom: 15,
    },
  },
  {
    id: "study",
    chip: "A study buddy",
    reply: "Laptop’s in my bag 📚 5 min",
    place: {
      name: "the British Library",
      area: "King’s Cross",
      center: [-0.1276, 51.53],
      zoom: 15.5,
    },
  },
  {
    id: "dinner",
    chip: "A new face for dinner",
    reply: "Save me a seat 🍷 4 min",
    place: {
      name: "Padella, Borough Market",
      area: "Borough Market",
      center: [-0.0907, 51.5053],
      zoom: 15.7,
    },
  },
  {
    id: "french",
    chip: "A native French speaker",
    reply: "J’arrive ! 🇫🇷 5 min",
    lang: "fr",
    place: {
      name: "Colbert, Sloane Square",
      area: "Chelsea",
      center: [-0.1564, 51.4924],
      zoom: 15.7,
    },
  },
];
