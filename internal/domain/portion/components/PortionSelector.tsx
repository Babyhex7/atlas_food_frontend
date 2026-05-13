import type { AsServedImage } from "../types/portion";

export function PortionSelector({ images = [] }: { images?: AsServedImage[] }) {
  return (
    <section>
      <h2>Choose portion</h2>
      <ul>{images.map((image) => <li key={image.id}>{image.label} - {image.weight_gram}g</li>)}</ul>
    </section>
  );
}
