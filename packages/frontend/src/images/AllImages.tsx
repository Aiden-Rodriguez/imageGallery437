import { ImageGrid } from "./ImageGrid.tsx";
import type { IApiImageData } from "../../../backend/src/common/ApiImageData.ts";

interface AllImagesProps {
  imageData: IApiImageData[];
  isError: boolean;
  isFetching: boolean;
}

export function AllImages({ imageData, isError, isFetching }: AllImagesProps) {
  return (
    <div>
      <h2>All Images</h2>

      {isError && <h3 style={{ color: "red" }}>Failed to fetch images.</h3>}
      {isFetching && <h3>Loading images...</h3>}
      <ImageGrid images={imageData} />
    </div>
  );
}
