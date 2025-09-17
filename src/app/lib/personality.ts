export async function loadDefaultPersonality(): Promise<string> {
  try {
    const res = await fetch("/personalities/default.md");
    if (!res.ok) {
      console.error("Failed to load default personality", res.status);
      return "";
    }
    return await res.text();
  } catch (err) {
    console.error("Error loading default personality:", err);
    return "";
  }
}
