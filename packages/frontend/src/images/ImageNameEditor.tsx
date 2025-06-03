import { useState } from "react";

interface INameEditorProps {
  initialValue: string;
  imageId: string;
  onNameChange: (imageId: string, newName: string) => void;
  token: string;
}

export function ImageNameEditor({
  initialValue,
  imageId,
  onNameChange,
  token,
}: INameEditorProps) {
  const [isEditingName, setIsEditingName] = useState(false);
  const [input, setInput] = useState(initialValue);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmitPressed() {
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/images/${imageId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: input }),
      });

      if (!response.ok) {
        if (response.status === 403) {
          setError(
            "You are not the original uploader of this image, so you cannot rename it.",
          );
        } else if (response.status === 422) {
          setError("Inputted name must not be more than 100 characters.");
        } else {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return;
      }

      onNameChange(imageId, input);
      setIsEditingName(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("Failed to update image name. Please try again.");
        console.error(error.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isEditingName) {
    return (
      <div style={{ margin: "1em 0" }}>
        <label>
          New Name
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSubmitting}
          />
        </label>
        <button
          disabled={input.length === 0 || isSubmitting}
          onClick={handleSubmitPressed}
        >
          Submit
        </button>
        <button
          onClick={() => {
            setIsEditingName(false);
            setError(null);
            setInput(initialValue);
          }}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        {isSubmitting && <p>Working...</p>}
        {error && <p style={{ color: "red" }}>{error}</p>}
      </div>
    );
  } else {
    return (
      <div style={{ margin: "1em 0" }}>
        <button onClick={() => setIsEditingName(true)}>Edit name</button>
      </div>
    );
  }
}
