import { ref } from "vue";

export function useCC() {
  const copiedValue = ref<string | null>(null);

  async function copyValue(value: string | number | null | undefined, label: string) {
    if (value === null || value === undefined || value === "") return;
    const text = String(value);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.opacity = "0";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    copiedValue.value = `${label} copié`;
    window.setTimeout(() => {
      copiedValue.value = null;
    }, 2000);
  }

  return { copiedValue, copyValue };
}