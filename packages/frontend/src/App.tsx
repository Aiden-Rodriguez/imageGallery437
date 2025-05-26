import { useState, useEffect } from "react";
import { Routes, Route, BrowserRouter } from "react-router";
import { MainLayout } from "./MainLayout";
import { AllImages } from "./images/AllImages";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { ImageDetails } from "./images/ImageDetails";
import { useParams } from "react-router";
import type { IApiImageData } from "../../backend/src/common/ApiImageData.ts";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";


interface ImageDetailsWrapperProps {
  imageData: IApiImageData[];
  isError: boolean;
  isFetching: boolean;
  onNameChange: (imageId: string, newName: string) => void;
}

function ImageDetailsWrapper({
  imageData,
  isError,
  isFetching,
  onNameChange,
}: ImageDetailsWrapperProps) {
  const { imageId } = useParams();

  return (
    <ImageDetails
      imageId={imageId ?? "0"}
      imageData={imageData}
      isError={isError}
      isFetching={isFetching}
      onNameChange={onNameChange}
    />
  );
}

function App() {

  const [imageData, setImages] = useState<IApiImageData[]>([]);
  const [isError, setIsError] = useState(false);
  const [isFetching, setIsFetching] = useState(true);

  useEffect(() => {
    async function fetchImages() {
      try {
        const response = await fetch("/api/images");

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error("Error fetching images:", error);
        setIsError(true);
      } finally {
        setIsFetching(false);
      }
    }

    fetchImages();
  }, []);

  const handleNameChange = (imageId: string, newName: string) => {
    setImages(prevImages =>
      prevImages.map(image =>
        image.id === imageId ? { ...image, name: newName } : image
      )
    );
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path={ValidRoutes.HOME} element={<AllImages imageData={imageData} isError={isError} isFetching={isFetching}/>} />
          <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
          <Route
            path={ValidRoutes.IMAGES}
            element={<ImageDetailsWrapper imageData={imageData} isError={isError} isFetching={isFetching} onNameChange={handleNameChange}/>}
          />
          <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
