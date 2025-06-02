import { useState, useEffect, useRef } from "react";
import { Routes, Route, BrowserRouter } from "react-router";
import { MainLayout } from "./MainLayout";
import { AllImages } from "./images/AllImages";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { ImageDetails } from "./images/ImageDetails";
import { useParams } from "react-router";
import type { IApiImageData } from "../../backend/src/common/ApiImageData.ts";
import { ValidRoutes } from "../../backend/src/shared/ValidRoutes.ts";
import { ImageSearchForm } from "./images/ImageSearchForm.tsx";

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
  const [originalImages, setOriginalImages] = useState<IApiImageData[]>([]);
  const [isError, setIsError] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [searchString, setSearchString] = useState("");
  const requestNumberRef = useRef(0);

  const fetchImages = async (search: string, currentRequestNumber: number) => {
    try {
      setIsFetching(true);
      const response = await fetch(
        `/api/images?substring=${encodeURIComponent(search)}`,
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (requestNumberRef.current === currentRequestNumber) {
        setImages(data);
        if (search === "") {
          setOriginalImages(data);
        }
        setIsError(false);
      }
    } catch (error) {
      console.error("Error fetching images:", error);
      if (requestNumberRef.current === currentRequestNumber) {
        setIsError(true);
      }
    } finally {
      if (requestNumberRef.current === currentRequestNumber) {
        setIsFetching(false);
      }
    }
  };

  useEffect(() => {
    const currentRequestNumber = requestNumberRef.current + 1;
    requestNumberRef.current = currentRequestNumber;
    fetchImages("", currentRequestNumber);
  }, []);

  const handleNameChange = (imageId: string, newName: string) => {
    setImages((prevImages) =>
      prevImages.map((image) =>
        image.id === imageId ? { ...image, name: newName } : image,
      ),
    );
    setOriginalImages((prevImages) =>
      prevImages.map((image) =>
        image.id === imageId ? { ...image, name: newName } : image,
      ),
    );
  };

  const handleImageSearch = () => {
    const currentRequestNumber = requestNumberRef.current + 1;
    requestNumberRef.current = currentRequestNumber;
    if (searchString.trim() === "") {
      if (requestNumberRef.current === currentRequestNumber) {
        setImages(originalImages);
        setIsError(false);
        setIsFetching(false);
      }
    } else {
      fetchImages(searchString, currentRequestNumber);
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route
            path={ValidRoutes.HOME}
            element={
              <AllImages
                imageData={imageData}
                isError={isError}
                isFetching={isFetching}
                searchPanel={
                  <ImageSearchForm
                    searchString={searchString}
                    onSearchStringChange={setSearchString}
                    onSearchRequested={handleImageSearch}
                  />
                }
              />
            }
          />
          <Route path={ValidRoutes.UPLOAD} element={<UploadPage />} />
          <Route
            path={`${ValidRoutes.IMAGES}`}
            element={
              <ImageDetailsWrapper
                imageData={imageData}
                isError={isError}
                isFetching={isFetching}
                onNameChange={handleNameChange}
              />
            }
          />
          <Route path={ValidRoutes.LOGIN} element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
