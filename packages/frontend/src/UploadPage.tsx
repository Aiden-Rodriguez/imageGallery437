import { useId, useState, useActionState } from "react";

function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.readAsDataURL(file);
    fr.onload = () => resolve(fr.result as string);
    fr.onerror = (err) => reject(err);
  });
}

async function submitUpload(
  _prevState: string | null,
  formData: FormData,
  token: string
): Promise<string | null> {
  try {
    if (!token) {
      return "No authentication token provided. Please provide a token.";
    }

    const response = await fetch("/api/images", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || `Upload failed with status ${response.status}`);
    }

    if (response.status === 201 && response.body === null) {
      return "Image uploaded successfully!";
    }

    const result = await response.json();
    return result.message || "Image uploaded successfully!";
  } catch (err) {
    return err instanceof Error ? err.message : "Upload failed. Try again.";
  }
}

export function UploadPage({
  token,
  refetchImages,
}: {
  token: string;
  refetchImages: () => void;
}) {
  const fileInputId = useId();
  const nameInputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [message, formAction, isPending] = useActionState(
    async (state: string | null, formData: FormData) => {
      const result = await submitUpload(state, formData, token);
      if (result?.includes("successfully")) {
        refetchImages();
      }
      return result;
    },
    null
  );

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      const dataUrl = await readAsDataURL(file);
      setPreviewUrl(dataUrl);
    } else {
      setPreviewUrl(null);
    }
  }

  return (
    <div>
      <h2>Upload</h2>
      <form action={formAction}>
        <div>
          <label htmlFor={fileInputId}>Choose image to upload: </label>
          <input
            id={fileInputId}
            name="image"
            type="file"
            accept=".png,.jpg,.jpeg"
            required
            onChange={handleFileChange}
            disabled={isPending}
          />
        </div>

        <div>
          <label htmlFor={nameInputId}>
            <span>Image title: </span>
          </label>
          <input id={nameInputId} name="name" required disabled={isPending} />
        </div>

        <div>
          <img
            style={{ width: "20em", maxWidth: "100%" }}
            src={previewUrl ?? ""}
            alt={previewUrl ? "Preview of selected file" : ""}
          />
        </div>

        <input type="submit" value="Confirm upload" disabled={isPending} />
      </form>

      <p aria-live="polite" style={{ marginTop: "1em" }}>
        {isPending ? "Uploading..." : message}
      </p>
    </div>
  );
}