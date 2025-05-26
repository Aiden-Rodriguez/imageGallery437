import { ImageGrid } from "./ImageGrid.tsx";
import type { IImageData } from "../MockAppData.ts";

interface AllImagesProps {
  imageData: IImageData[];
}

export function AllImages({ imageData }: AllImagesProps) {
  return (
    <div>
      <h2>All Images</h2>
      <ImageGrid images={imageData} />
    </div>
  );
}
