import type { IApiImageData } from "../../../backend/src/common/ApiImageData.ts";
import { ImageNameEditor } from "./ImageNameEditor.tsx";

interface IImageDetailsProps {
  imageId: string;
  imageData: IApiImageData[];
  isError: boolean;
  isFetching: boolean;
  onNameChange: (imageId: string, newName: string) => void;
  token: string;
}

export function ImageDetails({
  imageId,
  imageData,
  isError,
  isFetching,
  onNameChange,
  token,
}: IImageDetailsProps) {
  if (isError) {
    return <p style={{ color: "red" }}>Failed to fetch images.</p>;
  }

  if (isFetching) {
    return <p>Loading image...</p>;
  }

  const image = imageData.find((img) => img.id === imageId);

  if (!image) {
    return (
      <div>
        <h2>Image not found</h2>
      </div>
    );
  }

  return (
    <div>
      <h2>{image.name}</h2>
      <p>By {image.author.username}</p>
      <ImageNameEditor
        initialValue={image.name}
        imageId={imageId}
        onNameChange={onNameChange}
        token={token}
      />
      <img className="ImageDetails-img" src={image.src} alt={image.name} />
    </div>
  );
}