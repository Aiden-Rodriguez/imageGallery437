export function UploadPage() {
  return (
    <div>
      <h2>Upload</h2>
      <form>
        <div>
          <label>Choose image to upload: </label>
          <input name="image" type="file" accept=".png,.jpg,.jpeg" required />
        </div>
        <div>
          <label>
            <span>Image title: </span>
            <input name="name" required />
          </label>
        </div>

        <div>
          {" "}
          {/* Preview img element */}
          <img
            style={{ width: "20em", maxWidth: "100%" }}
            src={"GIVE ME A DATA URL"}
            alt=""
          />
        </div>

        <input type="submit" value="Confirm upload" />
      </form>
    </div>
  );
}
