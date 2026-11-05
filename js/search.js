document.addEventListener("DOMContentLoaded", async () => {
  const user = await requireUser();
  if (!user) return;
  const results = document.getElementById("results");
  const status = document.getElementById("status");
  const search = document.getElementById("search-input");
  const type = document.getElementById("type-filter");
  let documents = [];

  function render() {
    const term = search.value.trim().toLowerCase();
    const selectedType = type.value;
    const matches = documents.filter(doc => {
      const text = [doc.display_name, doc.description, doc.author_name, ...(doc.tags || [])].join(" ").toLowerCase();
      return (!term || text.includes(term)) && (!selectedType || doc.file_type === selectedType);
    });
    results.replaceChildren();
    status.textContent = `${matches.length} resource(s) found`;
    for (const doc of matches) {
      const card = document.createElement("article");
      card.className = "library-file-card";
      const title = document.createElement("h3"); title.textContent = doc.display_name;
      const details = document.createElement("p");
      details.textContent = `${doc.file_type.toUpperCase()} · Author: ${doc.author_name} · ${(doc.file_size / 1048576).toFixed(2)} MB`;
      const description = document.createElement("p"); description.textContent = doc.description || "No description supplied.";
      const tags = document.createElement("p"); tags.className = "library-tags";
      tags.textContent = (doc.tags || []).map(tag => `#${tag}`).join(" ");
      const download = document.createElement("button"); download.textContent = "Download resource";
      download.addEventListener("click", async () => {
        download.disabled = true;
        try {
          const { data, error } = await supabaseClient.storage.from("library-files").createSignedUrl(doc.storage_path, 60);
          if (error) throw error;
          const link = document.createElement("a");
          link.href = data.signedUrl;
          link.download = doc.original_filename;
          link.target = "_blank";
          link.rel = "noopener";
          link.click();
        } catch (err) {
          status.textContent = `Download error: ${err.message}`;
        } finally { download.disabled = false; }
      });
      card.append(title, details, description, tags, download);
      results.append(card);
    }
  }

  try {
    const { data, error } = await supabaseClient.from("documents")
      .select("id,display_name,description,author_name,tags,original_filename,file_type,storage_path,file_size,created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    documents = data || [];
    render();
  } catch (err) {
    status.textContent = `Could not load archive: ${err.message}`;
  }
  search.addEventListener("input", render);
  type.addEventListener("change", render);
});
