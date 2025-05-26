import { useState } from "react";
import { Routes, Route, BrowserRouter } from "react-router";
import { MainLayout } from "./MainLayout";
import { AllImages } from "./images/AllImages";
import { UploadPage } from "./UploadPage";
import { LoginPage } from "./LoginPage";
import { ImageDetails } from "./images/ImageDetails";
import { useParams } from "react-router";
import { fetchDataFromServer } from "../src/MockAppData";
import type { IImageData } from "../src/MockAppData.ts";

function ImageDetailsWrapper({ imageData }: { imageData: IImageData[] }) {
  const { imageId } = useParams();
  return <ImageDetails imageId={imageId ?? "0"} imageData={imageData} />;
}

function App() {
  const [imageData, _setImageData] = useState(fetchDataFromServer);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<AllImages imageData={imageData} />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route
            path="/images/:imageId"
            element={<ImageDetailsWrapper imageData={imageData} />}
          />
          <Route path="/login" element={<LoginPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
