import { useState } from "react";

interface INameEditorProps {
    initialValue: string;
    imageId: string;
    onNameChange: (imageId: string, newName: string) => void;
}

export function ImageNameEditor({ initialValue, imageId, onNameChange }: INameEditorProps) {
    const [isEditingName, setIsEditingName] = useState(false);
    const [input, setInput] = useState(initialValue);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmitPressed() {
        setIsSubmitting(true);
        setError(null);

        try {
            const response = await fetch("/api/images");
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            onNameChange(imageId, input);
            setIsEditingName(false);
        } catch (error) {
            setError("Failed to update image name. Please try again.");
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
                        onChange={e => setInput(e.target.value)}
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