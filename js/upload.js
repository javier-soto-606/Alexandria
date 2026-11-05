document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireUser();
  if (!user) return;
  const form = document.getElementById("upload-form");
  const fileInput = document.getElementById("file");
  const review = document.getElementById("review");
  const message = document.getElementById("message");
  const say = text => { message.textContent = text; };

  document.getElementById("review-button").addEventListener("click", () => {
    const file = fileInput.files[0];
    const name = document.getElementById("name").value.trim();
    const author = document.getElementById("author").value.trim();
    if (!file || !name || !author) return say("Choose a file and provide its resource name and author.");
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "zip"].includes(ext)) return say("Only PDF and ZIP files are accepted.");
    const tags = document.getElementById("tags").value.split(",").map(x => x.trim()).filter(Boolean);
    document.getElementById("review-details").textContent =
      `File: ${file.name}\\nResource name: ${name}\\nAuthor: ${author}\\nDescription: ${document.getElementById("description").value.trim() || "—"}\\nTags: ${tags.join(", ") || "—"}\\nSize: ${(file.size / 1048576).toFixed(2)} MB`;
    review.hidden = false;
    say("Review the information, then confirm to upload.");
  });

  document.getElementById("edit-button").addEventListener("click", () => { review.hidden = true; });
  form.addEventListener("submit", async event => {
    event.preventDefault();
    const file = fileInput.files[0];
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!["pdf", "zip"].includes(ext)) return say("Only PDF and ZIP files are accepted.");
    const storagePath = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const submit = form.querySelector('button[type="submit"]');
    submit.disabled = true;
    say("Uploading resource…");
    try {
      const { error: uploadError } = await supabaseClient.storage.from("library-files").upload(storagePath, file, {
        contentType: ext === "pdf" ? "application/pdf" : "application/zip",
        upsert: false
      });
      if (uploadError) throw uploadError;
      const { error: insertError } = await supabaseClient.from("documents").insert({
        owner_id: user.id,
        display_name: document.getElementById("name").value.trim(),
        description: document.getElementById("description").value.trim(),
        author_name: document.getElementById("author").value.trim(),
        tags: [...new Set(document.getElementById("tags").value.split(",").map(x => x.trim()).filter(Boolean))],
        original_filename: file.name,
        file_type: ext,
        storage_path: storagePath,
        file_size: file.size
      });
      if (insertError) {
        await supabaseClient.storage.from("library-files").remove([storagePath]);
        throw insertError;
      }
      form.reset();
      review.hidden = true;
      say("Resource uploaded successfully and added to Alexandria.");
    } catch (err) {
      say(`Upload failed: ${err.message}`);
    } finally {
      submit.disabled = false;
    }
  });
});
