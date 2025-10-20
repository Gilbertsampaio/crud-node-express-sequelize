export function formatarData(date) {
  return new Date(date).toLocaleDateString('pt-BR');
}

export function formatarHoraMinuto(date) {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
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

export function formatarDataPersonalizada(dataISO) {
  const data = new Date(dataISO);
  const agora = new Date();

  // Ajuste de fuso (opcional: BR -3h)
  const offset = data.getTimezoneOffset() / 60;
  data.setHours(data.getHours() - offset);

  const mesmoDia = data.toDateString() === agora.toDateString();

  // Criar data de ontem
  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);

  const mesmoOntem = data.toDateString() === ontem.toDateString();

  // Formatar hora
  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (mesmoDia) {
    return `Hoje às ${hora}`;
  } else if (mesmoOntem) {
    return `Ontem às ${hora}`;
  } else {
    const dia = data.getDate();
    const mes = data.toLocaleString("pt-BR", { month: "short" });
    return `${dia} de ${mes} às ${hora}`;
  }
}

export function getTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getUTCHours().toString().padStart(2, '0');
  const minutes = date.getUTCMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}