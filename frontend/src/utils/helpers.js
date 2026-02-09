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

export function toLocalISOString(date = new Date()) {
    const pad = n => String(n).padStart(2, "0");

    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

export function formatarDataPersonalizada(dataISO) {
  const data = new Date(dataISO);
  const agora = new Date();

  const mesmoDia = data.toDateString() === agora.toDateString();

  const ontem = new Date(agora);
  ontem.setDate(agora.getDate() - 1);

  const mesmoOntem = data.toDateString() === ontem.toDateString();

  const hora = data.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (mesmoDia) {
    return `Hoje às ${hora}`;
  }

  if (mesmoOntem) {
    return `Ontem às ${hora}`;
  }

  const dia = String(data.getDate()).padStart(2, "0");
  const mes = data.toLocaleString("pt-BR", { month: "long" });
  const ano = data.getFullYear();

  return `${dia} de ${mes} de ${ano}, ${hora}`;
}

export function getTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}