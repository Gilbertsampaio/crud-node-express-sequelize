export function formatarData(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function limitarTexto(texto, maxLength = 50, considerarExtensao = false) {
  if (!texto) return "";
  if (texto.length <= maxLength) return texto;

  if (considerarExtensao) {
    const ext = texto.includes(".") ? texto.slice(texto.lastIndexOf(".")) : "";
    return texto.slice(0, maxLength - 3 - ext.length) + "..." + ext;
  }

  return texto.slice(0, maxLength - 3) + "...";
}