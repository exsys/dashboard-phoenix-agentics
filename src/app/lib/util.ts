export function capitalizeFirstLetter(word: string | undefined): string {
    if (!word) return "";
    return word.charAt(0).toUpperCase() + word.slice(1);
}