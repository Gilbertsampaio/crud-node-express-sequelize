import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import MediaFilledRefreshed from "./icons/MediaFilledRefreshed";
import VideoCallRefreshed from "./icons/VideoCallRefreshed";
import DocumentFilledRefreshed from "./icons/DocumentFilledRefreshed";
import CameraFilledRefreshed from "./icons/CameraFilledRefreshed";
import HeadphonesFilled from "./icons/HeadphonesFilled";
import PlusRoundedIcon from "./icons/PlusRoundedIcon";
import CloseRoundedIcon from "./icons/CloseRoundedIcon";
import SendFilledIcon from "./icons/SendFilledIcon";
import PreviewGenericIcon from "./icons/PreviewGenericIcon";
import CalendarFilledRefreshed from "./icons/CalendarFilledRefreshed";
import StickerCreateFilledRefreshed from "./icons/StickerCreateFilledRefreshed";
import api from "../../api/api";
import PollRefreshed from "./icons/PollRefreshed";
import AlertModal from "./AlertModal";
import EmojiDropdown from "./EmojiDropdown";
import useAuth from "../../context/useAuth";

// import api from '../../api/api';
import "./ChatAttachment.css";

export default function ChatAttachment({ chatId, isOpenAttachment, onToggleAttachment, previewFile, setPreviewFile, resetRef, openEvento, idEvento, setIdEvento, setOpenEvento, openEnquete, setOpenEnquete, idEnquete, setIdEnquete }) {
  const wrapperRef = useRef(null);
  const fileInputRef = useRef(null);
  // const [previewFile, setPreviewFile] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL_BACKEND || "http://localhost:3000";
  const [alertMessage, setAlertMessage] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const textareaRefs = useRef({});
  const [inputs, setInputs] = useState({});
  const [emojiStates, setEmojiStates] = useState({});

  const [showCamera, setShowCamera] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const inputRefs = useRef({});
  const [optionsCount, setOptionsCount] = useState(3);
  const [isChecked, setIsChecked] = useState(false);
  const { user } = useAuth();

  const [error, setError] = useState("");
  const [participantes, setParticipantes] = useState([]);
  const [titulo, setTitulo] = useState("");
  const [descricao, setDescricao] = useState("");
  const [dataEvento, setDataEvento] = useState("");
  const [horaEvento, setHoraEvento] = useState("");
  const [dataEventoFinal, setDataEventoFinal] = useState("");
  const [horaEventoFinal, setHoraEventoFinal] = useState("");
  const [local, setLocal] = useState("");
  const [showDataFinal, setShowDataFinal] = useState(false);

  const [pergunta, setPergunta] = useState("");
  const [respostas, setRespostas] = useState([]);
  const [respostaTexts, setRespostaTexts] = useState([]);

  const handleChange = () => {
    setIsChecked((prev) => !prev);
  };

  const handleOptionChange = (e, index) => {
    const inputValue = e.target.value;

    if (idEnquete) {
      setRespostaTexts(prev => {
        const updated = [...prev];
        updated[index - 2] = inputValue;
        return updated;
      });
    } else {
      const valueTrimmed = inputValue.trim();

      // Atualiza o ref manualmente (se precisar)
      if (inputRefs.current[index]) {
        inputRefs.current[index].value = inputValue;
      }

      // Atualiza o texto do input no estado para controlar o valor
      setRespostaTexts(prev => {
        const updated = [...prev];
        updated[index - 2] = inputValue;
        return updated;
      });

      // Se o usuário preencheu o último input, adiciona mais um
      if (index === optionsCount && valueTrimmed !== "") {
        setOptionsCount(prev => prev + 1);
      }

      // Se apagou o conteúdo do penúltimo e o último está vazio, remove o último
      if (index === optionsCount - 1 && valueTrimmed === "") {
        setOptionsCount(prev => (prev > 3 ? prev - 1 : prev));
      }
    }
  };

  useEffect(() => {
    if (!idEnquete) {
      setRespostaTexts(prev => {
        const neededLength = optionsCount - 1;
        if (prev.length < neededLength) {
          return [...prev, ...Array(neededLength - prev.length).fill('')];
        } else if (prev.length > neededLength) {
          return prev.slice(0, neededLength);
        }
        return prev;
      });
    }
  }, [optionsCount, idEnquete]);

  useEffect(() => {
    if (idEnquete && respostas.length > 0) {
      setRespostaTexts(respostas);
      setOptionsCount(respostas.length + 1); // Para que tenha um input extra para nova resposta
    }
  }, [idEnquete, respostas]);

  const initCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Erro ao acessar câmera:", err);
      setAlertMessage("Não foi possível acessar a câmera. Verifique as permissões.");
      setShowAlert(true);
      setShowCamera(false);
    }
  }, []);

  const capturePhoto = () => {
    const canvas = document.createElement("canvas");
    const video = videoRef.current;
    if (!video) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(blob => {
      const file = new File([blob], "foto_camera.jpg", { type: "image/jpeg" });
      file.previewUrl = URL.createObjectURL(file);
      setPreviewFile(file);
      stopCamera();
      setShowCamera(false);
    }, "image/jpeg", 0.9);
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    setStream(null);
  };

  const cameraModal = showCamera && (
    <div className="camera-modal">
      <div className="camera-content">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          style={{ width: "100%", borderRadius: "8px" }}
        />
        <div className="camera-actions">
          <button className="btn-cancel" onClick={() => { stopCamera(); setShowCamera(false); }}>
            Cancelar
          </button>
          <button className="btn-capture" onClick={capturePhoto}>
            Tirar Foto
          </button>
        </div>
      </div>
    </div>
  );

  const resetarInput = React.useCallback(() => {
    // setSelectedOption(null);
    setPreviewFile(null);
    setInputs(prev => ({ ...prev, [chatId]: "" }));
    if (fileInputRef.current) fileInputRef.current.value = null;

  }, [setPreviewFile, setInputs, chatId]);

  const closeEdit = React.useCallback(() => {
    setTitulo("");
    setDescricao("");
    setDataEvento("");
    setHoraEvento("");
    setDataEventoFinal("");
    setHoraEventoFinal("");
    setLocal("");
    setOpenEvento(false);
    setIdEvento(null);
    setIsChecked(false);
    setPergunta("");
    setRespostas([]);
    setRespostaTexts([]);
    setIdEnquete(null);
    setShowDataFinal(false);
  }, [setTitulo, setDescricao, setDataEvento, setHoraEvento, setDataEventoFinal, setHoraEventoFinal, setLocal, setIdEvento, setOpenEvento, setPergunta, setRespostas, setIdEnquete, setRespostaTexts, setShowDataFinal]);

  const chamaFuncao = useCallback(async (optionLabel) => {
    setSelectedOption(optionLabel);

    if (optionLabel === "camera") {
      setShowCamera(true);
      setTimeout(initCamera, 100);
      return;
    }

    if (optionLabel === "enquete" || optionLabel === "figurinha") {
      setPreviewFile(true);
      onToggleAttachment(false);
      return;
    }

    if (fileInputRef.current) {
      switch (optionLabel) {
        case "image":
          fileInputRef.current.accept = "image/*";
          break;
        case "video":
          fileInputRef.current.accept = "video/*";
          break;
        case "file":
          fileInputRef.current.accept = "*/*";
          break;
        case "audio":
          fileInputRef.current.accept = "audio/*";
          break;
        default:
          fileInputRef.current.accept = "*/*";
          break;
      }

      fileInputRef.current.click();
    }

    setTimeout(() => {
      onToggleAttachment(false);
    }, 500);

  }, [
    fileInputRef,
    initCamera,
    onToggleAttachment,
    setPreviewFile,
    setSelectedOption,
    setShowCamera
  ]);

  const chamaFuncaoEnquete = useCallback(async () => {

    setSelectedOption("enquete");

    if (idEnquete) {
      try {
        const res = await api.get(`/messages/enquete/${idEnquete}`);
        const eventoDados = res.data;
        setPergunta(eventoDados.metadata?.pergunta);
        setRespostas(eventoDados.metadata?.respostas);
        setIsChecked(eventoDados.metadata?.multiplos);
      } catch {
        setError("Erro ao buscar dados da enquete.");
      }
    }

    setPreviewFile(true);
    onToggleAttachment(false);
    setOpenEnquete(false);

  }, [
    onToggleAttachment,
    setPreviewFile,
    setSelectedOption,
    setOpenEnquete,
    setPergunta,
    setRespostas,
    setIsChecked,
    idEnquete
  ]);

  const chamaFuncaoEvento = useCallback(async () => {
    setSelectedOption("evento");

    if (idEvento) {
      try {
        const res = await api.get(`/messages/evento/${idEvento}`);
        const eventoDados = res.data;
        setTitulo(eventoDados.metadata?.titulo);
        setDescricao(eventoDados.metadata?.descricao);
        setDataEvento(eventoDados.metadata?.dataInicio);
        setHoraEvento(eventoDados.metadata?.horaInicio);
        setDataEventoFinal(eventoDados.metadata?.dataFim);
        setHoraEventoFinal(eventoDados.metadata?.horaFim);
        setLocal(eventoDados.metadata?.local);
        setIsChecked(eventoDados.metadata?.link);
        setShowDataFinal(eventoDados.metadata?.dataFim ? true : false)
      } catch {
        setError("Erro ao buscar dados do evento.");
      }
    }

    setPreviewFile(true);
    onToggleAttachment(false);
    setOpenEvento(false);
  }, [
    idEvento,
    onToggleAttachment,
    setDescricao,
    setTitulo,
    setDataEvento,
    setHoraEvento,
    setDataEventoFinal,
    setHoraEventoFinal,
    setLocal,
    setIsChecked,
    setPreviewFile,
    setSelectedOption,
    setError,
    setOpenEvento
  ]);

  useEffect(() => {
    if (respostas.length > 0) {
      setRespostaTexts(respostas.map(r => r.text || ""));
    }
  }, [respostas]);

  useEffect(() => {
    if (openEvento && idEvento) {
      chamaFuncaoEvento();
    }
  }, [openEvento, idEvento, chamaFuncaoEvento, setOpenEvento]);

  useEffect(() => {
    if (openEnquete && idEnquete) {
      chamaFuncaoEnquete();
    }
  }, [openEnquete, idEnquete, chamaFuncaoEnquete, setOpenEnquete]);

  useEffect(() => {
    if (resetRef && resetRef.current) {
      resetRef.current = resetarInput
      resetRef.current();
    }
  }, [resetRef, resetarInput]);

  useEffect(() => {
    if (previewFile) {
      // espera o portal renderizar
      requestAnimationFrame(() => {
        const textarea = textareaRefs.current[chatId];
        if (textarea) textarea.focus();
      });
    }
  }, [previewFile, chatId]);

  useEffect(() => {
    if (!isOpenAttachment) return;

    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        onToggleAttachment(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpenAttachment, onToggleAttachment]);

  const options = [
    {
      label: "Documento",
      icon: DocumentFilledRefreshed,
      color: "#7F66FF",
      onClick: () => chamaFuncao("file"),
    },
    {
      label: "Fotos",
      icon: MediaFilledRefreshed,
      color: "#007BFC",
      onClick: () => chamaFuncao("image"),
    },
    {
      label: "Vídeos",
      icon: VideoCallRefreshed,
      color: "#ffcc00",
      onClick: () => chamaFuncao("video"),
    },
    {
      label: "Câmera",
      icon: CameraFilledRefreshed,
      color: "#FF2E74",
      onClick: () => chamaFuncao("camera"),
    },
    {
      label: "Áudio",
      icon: HeadphonesFilled,
      color: "#FA6533",
      onClick: () => chamaFuncao("audio"),
    },
    {
      label: "Enquete",
      icon: PollRefreshed,
      color: "#FFB938",
      onClick: () => chamaFuncaoEnquete(),
    },
    {
      label: "Evento",
      icon: CalendarFilledRefreshed,
      color: "#FF2E74",
      onClick: () => chamaFuncaoEvento(),
    },
    {
      label: "Nova figurinha",
      icon: StickerCreateFilledRefreshed,
      color: "#06CF9C",
      onClick: () => chamaFuncao("figurinha"),
    },
  ];

  const handleFileChange = (e) => {
    onToggleAttachment(false);

    const file = e.target.files[0];
    if (!file) return;

    // validações
    const maxSizeMB = 10; // limite de 10MB
    if (file.size > maxSizeMB * 1024 * 1024) {
      setAlertMessage(`Arquivo muito grande! Máx: ${maxSizeMB}MB`);
      setShowAlert(true)
      return;
    }

    // const allowedTypes = ["image/", "application/pdf", "audio/", "video/"];
    // if (!allowedTypes.some((t) => file.type.startsWith(t))) {
    //   setAlertMessage("Tipo de arquivo não permitido!");
    //   setShowAlert(true)
    //   return;
    // }

    // cria previewUrl para qualquer tipo que terá preview
    if (
      file.type.startsWith("image/") ||
      file.type.startsWith("video/") ||
      file.type.startsWith("audio/") || // ✅ novo
      file.type === "application/pdf"
    ) {
      file.previewUrl = URL.createObjectURL(file);
    }

    setPreviewFile(file);
  };

  const handleSendFile = async () => {

    if (!previewFile) return;

    if (selectedOption === 'enquete') {

      const pergunta = inputRefs.current[1]?.value || "";
      const respostas = Object.keys(inputRefs.current)
        .map(k => parseInt(k))
        .filter(k => k > 1) // pega só os inputs de respostas
        .map((k, i) => ({
          index: i + 1,
          text: inputRefs.current[k]?.value?.trim() || ""
        }))
        .filter(r => r.text !== "");

      if (!pergunta) {
        setAlertMessage("A pergunta não pode estar vazia!");
        setShowAlert(true);
        return;
      }

      const message = {
        id: idEnquete,
        type: selectedOption,
        content: '[enquete]',
        metadata: {
          multiplos: isChecked,
          pergunta: pergunta,
          respostas: respostas
        }
      };

      onToggleAttachment(false, message);
      resetarInput();
      closeEdit();
      setOptionsCount(3);

    } else if (selectedOption === 'evento') {

      const nome = inputRefs.current[1]?.value || "";
      const descricao = inputRefs.current[2]?.value || "";
      const dataInicio = inputRefs.current[3]?.value || "";
      const horaInicio = inputRefs.current[4]?.value || "";
      const dataFim = showDataFinal ? (inputRefs.current[5]?.value || "") : "";
      const horaFim = showDataFinal ? (inputRefs.current[6]?.value || "") : "";
      const local = inputRefs.current[7]?.value || "";

      if (!nome) {
        setAlertMessage("O nome do evento não pode estar vazio!");
        setShowAlert(true);
        return;
      }

      if (!dataInicio || !horaInicio) {
        setAlertMessage("A data e hora de início deve ser informada!");
        setShowAlert(true);
        return;
      }

      const message = {
        id: idEvento,
        type: selectedOption,
        content: '[evento]',
        metadata: {
          titulo: nome,
          descricao: descricao,
          dataInicio: dataInicio,
          horaInicio: horaInicio,
          dataFim: dataFim,
          horaFim: horaFim,
          local: local,
          link: isChecked,
          exibeDataFinal: showDataFinal,
          criador: {
            id: user.id,
            nome: user.name,
            imagem: user.image
          },
          participantes: [
            {
              id: user.id,
              nome: user.name,
              imagem: user.image,
              opcao: "vou"
            }
          ]
        }
      };

      onToggleAttachment(false, message);
      resetarInput();
      closeEdit();
      setOptionsCount(3);

    } else {
      const formData = new FormData();
      const text = inputs[chatId];
      formData.append("file", previewFile);

      try {
        const res = await fetch(`${API_URL}/api/uploads/message`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();

        const message = {
          type: selectedOption,
          metadata: {
            fileName: data.fileName,
            fileSize: data.fileSize
          },
        };

        if (text && text.trim() !== "") {
          message.content = text.trim();
        } else {
          message.content = "[uploaded file]"
        }

        onToggleAttachment(false, message);
      } catch (err) {
        console.error("Erro no upload:", err);
      } finally {
        if (previewFile?.previewUrl) {
          URL.revokeObjectURL(previewFile.previewUrl);
        }
        resetarInput();
      }
    }
  };

  function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";
  }

  const handleEmojiSelect = (chatId, emoji, numberOption) => {
    const inputEl = inputRefs.current[numberOption];
    if (!inputEl) return;

    const start = inputEl.selectionStart || 0;
    const end = inputEl.selectionEnd || 0;

    // Valor antes da alteração: podemos pegar do estado ou do input
    let currentValue = inputEl.value;

    // Computa novo valor inserindo emoji
    const newValue = currentValue.slice(0, start) + emoji + currentValue.slice(end);

    // Agora, atualize o estado correspondente, de forma genérica:
    switch (numberOption) {
      case 1:
        // se for o campo título / pergunta ou descrição
        if (selectedOption === "evento") {
          setTitulo(newValue);
        } else if (selectedOption === "enquete") {
          setPergunta(newValue);
        }
        break;
      case 2:
        if (selectedOption === "evento") {
          setDescricao(newValue);
        } else if (selectedOption === "enquete") {
          setRespostaTexts(prev => {
            const updated = [...prev];
            updated[0] = newValue;
            return updated;
          });
        }
        break;
      default:
        if (numberOption >= 2 && selectedOption === "enquete") {
          setRespostaTexts(prev => {
            const updated = [...prev];
            updated[numberOption - 2] = newValue;
            return updated;
          });
        }
        break;
    }

    // Reposiciona cursor no input
    requestAnimationFrame(() => {
      inputEl.setSelectionRange(start + emoji.length, start + emoji.length);
      inputEl.focus();
    });
  };

  const toggleEmoji = (id, open) => {
    setEmojiStates(() => {
      if (!open) return {};
      return { [id]: { open: true } };
    });
  };

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toTimeString().slice(0, 5); // HH:MM
  };

  useEffect(() => {
    if (showDataFinal) {
      setDataEventoFinal(getTodayDate());
      setHoraEventoFinal(getCurrentTime());
    } else {
      setDataEventoFinal("");
      setHoraEventoFinal("");
    }
  }, [showDataFinal]);

  const previewModal = previewFile && (
    <div className="preview-modal">
      <div className={`preview-content ${!previewFile?.type?.startsWith("image/") && "video"} ${selectedOption === "enquete" && "enquete"} ${selectedOption === "evento" && "evento"}`}>

        {(selectedOption === "image" || selectedOption === "camera") && (
          <img
            src={previewFile.previewUrl}
            alt={previewFile.name}
            style={{ maxWidth: "100%", marginBottom: 0 }}
          />
        )}

        {selectedOption === "video" && (
          <video
            controls
            // autoPlay
            src={previewFile.previewUrl} // agora previewUrl existe para vídeo
            alt={previewFile.name}
            style={{ maxWidth: "100%", marginBottom: 0 }}
          />
        )}

        {selectedOption === "audio" && (
          <audio
            controls
            src={previewFile.previewUrl}
            style={{ width: "75%", marginBottom: 10, position: "relative", top: "25%", }}
          />
        )}

        {selectedOption === "file" && (
          <div className="container-file-preview">
            <div style={{ marginBottom: 20 }}>
              <PreviewGenericIcon />
            </div>
            <div style={{
              marginBottom: 10,
              marginTop: 10,
              fontSize: "1.5rem",
              color: "#aebac1"
            }}>Prévia indisponível</div>
            <div style={{ fontSize: "1rem", color: "rgb(174, 186, 193)" }}>
              {previewFile && `${formatFileSize(previewFile.size)} - ${previewFile.name.split('.').pop().toUpperCase()}`}
            </div>
          </div>
        )}

        {selectedOption === "enquete" && (
          <div className="container-file-preview enquete">
            <div style={{
              marginBottom: 20,
              marginTop: 20,
              fontSize: "1.5rem",
              color: "#aebac1"
            }}>{idEnquete ? 'Editar' : 'Criar'} enquete</div>
            <div style={{ fontSize: "1rem", color: "rgb(174, 186, 193)", width: "90%", }}>
              <div className="input-group position-relative">
                <label>Pergunta</label>
                <input
                  ref={el => (inputRefs.current[1] = el)}
                  type="text"
                  placeholder="Faça uma pergunta"
                  autoFocus
                  value={pergunta}
                  onChange={(e) => setPergunta(e.target.value)}
                />
                <span className="options-footer-emoji-preview enquete">
                  <EmojiDropdown
                    icon={true}
                    chatIdEmoji={chatId}
                    isOpenEmoji={emojiStates[1]?.open || false}
                    onToggleEmoji={(open) => toggleEmoji(1, open)}
                    onSelectEmoji={handleEmojiSelect}
                    numberOption={1}
                  />
                </span>
              </div>

              <div className="input-group mt-3">
                <label>Opções</label>
              </div>

              {[...Array(optionsCount - 1)].map((_, i) => {
                const index = i + 2;

                return (
                  <div key={index} className="input-group mt-1">
                    <input
                      ref={el => (inputRefs.current[index] = el)}
                      type="text"
                      placeholder="Adicionar texto"
                      value={respostaTexts[index - 2] || ""}
                      onChange={(e) => handleOptionChange(e, index)}
                    />
                    <span className="options-footer-emoji-preview enquete">
                      <EmojiDropdown
                        icon={true}
                        chatIdEmoji={chatId}
                        isOpenEmoji={emojiStates[index]?.open || false}
                        onToggleEmoji={(open) => toggleEmoji(index, open)}
                        onSelectEmoji={handleEmojiSelect}
                        numberOption={index}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="containerCheck">
              <label style={{ fontWeight: "normal", }}>Permitir várias respostas</label>
              <div
                className={`containerDivCheck ${isChecked ? "checked" : ""}`}

              >
                <div className="first"></div>
                <div className="last"></div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        {selectedOption === "evento" && (
          <div className="container-file-preview enquete">
            <div style={{
              marginBottom: 20,
              marginTop: 20,
              fontSize: "1.5rem",
              color: "#aebac1"
            }}>{idEvento ? 'Editar' : 'Criar'} evento</div>
            <div style={{ fontSize: "1rem", color: "rgb(174, 186, 193)", width: "90%", }}>
              <div className="input-group position-relative">
                <input
                  ref={el => (inputRefs.current[1] = el)}
                  type="text"
                  placeholder="Nome do evento"
                  autoFocus
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                />
                <span className="options-footer-emoji-preview enquete" style={{ top: "-5px" }}>
                  <EmojiDropdown
                    icon={true}
                    chatIdEmoji={chatId}
                    isOpenEmoji={emojiStates[1]?.open || false}
                    onToggleEmoji={(open) => toggleEmoji(1, open)}
                    onSelectEmoji={handleEmojiSelect}
                    numberOption={1}
                  />
                </span>
              </div>

              <div className="input-group position-relative">
                <textarea
                  ref={el => (inputRefs.current[2] = el)}
                  placeholder="Descrição (opcinal)"
                  rows="5"
                  className="evento"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
                <span className="options-footer-emoji-preview evento">
                  <EmojiDropdown
                    icon={true}
                    chatIdEmoji={chatId}
                    isOpenEmoji={emojiStates[2]?.open || false}
                    onToggleEmoji={(open) => toggleEmoji(2, open)}
                    onSelectEmoji={handleEmojiSelect}
                    numberOption={2}
                  />
                </span>
              </div>

              <div className="input-group position-relative">
                <label>Data e hora de início</label>
                <div className="containerEvento">
                  <div>
                    <input
                      ref={el => (inputRefs.current[3] = el)}
                      type="date"
                      value={dataEvento}
                      onChange={(e) => setDataEvento(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      ref={el => (inputRefs.current[4] = el)}
                      type="time"
                      value={horaEvento}
                      onChange={(e) => setHoraEvento(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className={`input-group position-relative dataEvento ${!showDataFinal && 'hide'}`}>
                <label>Data e hora de término</label>
                <div className="containerEvento">
                  <div>
                    <input
                      ref={el => (inputRefs.current[5] = el)}
                      type="date"
                      value={dataEventoFinal}
                      onChange={(e) => setDataEventoFinal(e.target.value)}
                    />
                  </div>
                  <div>
                    <input
                      ref={el => (inputRefs.current[6] = el)}
                      type="time"
                      value={horaEventoFinal}
                      onChange={(e) => setHoraEventoFinal(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="input-group mt-1" onClick={() => setShowDataFinal(prev => !prev)}>
                <label style={{ fontWeight: "normal", display: "flex", justifyContent: "start", alignItems: "center", gap: 10, cursor: "pointer", }}>
                  <div className={`iconShowData ${showDataFinal ? "active" : ""}`}>
                    <PlusRoundedIcon size={24} color="#0A0A0A" />
                    <CloseRoundedIcon size={24} color="#0A0A0A" />
                  </div>
                  <div>
                    {!showDataFinal ? 'Adicionar hora de término' : 'Remover hora de término'}
                  </div>
                </label>
              </div>

              <div className="input-group position-relative mt-3">
                <input
                  ref={el => (inputRefs.current[7] = el)}
                  type="text"
                  placeholder="Local (opcional)"
                  value={local}
                  onChange={(e) => setLocal(e.target.value)}
                />
              </div>

            </div>
            <div className="containerCheck">
              <label style={{ fontWeight: "normal", }}>Link de ligação do WhatsApp</label>
              <div
                className={`containerDivCheck ${isChecked ? "checked" : ""}`}

              >
                <div className="first"></div>
                <div className="last"></div>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        )}

        <div className="preview-actions">
          <button
            type="button"
            className={`options-footer options-file`}
            onClick={() => {
              resetarInput();
              closeEdit();
            }}
          >
            <div className="icon-container">
              <CloseRoundedIcon size={24} color="#0A0A0A" />
            </div>
          </button>
          {(selectedOption !== "enquete" && selectedOption !== "evento") && (
            <>
              <textarea
                ref={el => (textareaRefs.current[chatId] = el)}
                placeholder="Digite sua mensagem..."
                className="chat-message-preview"
                value={inputs[chatId] || ""}
                onChange={e => setInputs(prev => ({ ...prev, [chatId]: e.target.value }))}
              />
              <span className="options-footer-emoji-preview">
                <EmojiDropdown
                  icon={false}
                  chatIdEmoji={chatId}
                  isOpenEmoji={emojiStates[0]?.open || false}
                  onToggleEmoji={(open) => toggleEmoji(0, open)}
                  onSelectEmoji={handleEmojiSelect}
                  numberOption={0}
                />
              </span>
            </>
          )}
          <span
            className="options-footer options-send"
            onClick={handleSendFile}
          >
            <SendFilledIcon size={24} color="#ffffff" />
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="chat-attachment" ref={wrapperRef}>
      {!previewFile ? (
        <button
          type="button"
          aria-expanded={isOpenAttachment}
          className={`options-footer options-file ${isOpenAttachment ? "active" : ""}`}
          onClick={() => onToggleAttachment(!isOpenAttachment)}
        >
          <div className="icon-container">
            <PlusRoundedIcon size={24} color="#0A0A0A" />
            <CloseRoundedIcon size={24} color="#0A0A0A" />
          </div>
        </button>
      ) : (
        <button
          type="button"
          aria-expanded={isOpenAttachment}
          className={`options-footer options-file ${isOpenAttachment ? "active" : ""}`}
          disabled
        >
          <div className="icon-container">
            <PlusRoundedIcon size={24} color="#d5d5d5" />
          </div>
        </button>
      )}

      <div className={`attachment-dropdown ${isOpenAttachment ? "open" : "closed"}`}>
        {options.map((opt, index) => {
          const Icon = opt.icon;
          return (
            <div
              key={index}
              className="attachment-option"
              onClick={opt.onClick || (() => onToggleAttachment(false))}
            >
              <Icon size={26} color={opt.color} />
              <span>{opt.label}</span>
            </div>
          );
        })}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <AlertModal
        show={showAlert}
        title="Atenção"
        message={alertMessage}
        onClose={() => setShowAlert(false)}
      />

      {/* Renderiza preview no body */}
      {/* {previewFile && createPortal(previewModal, document.querySelector(".div-preview"))} */}
      {/* {previewFile && createPortal(previewModal, document.querySelector(`.chat-window[data-chat-id="${chatId}"] .div-preview`))} */}
      {previewFile && (() => {
        const container = document.querySelector(`.chat-window[data-chat-id="chat-${chatId}"] .div-preview`);
        if (container) return createPortal(previewModal, container);
        return null;
      })()}

      {showCamera && createPortal(cameraModal, document.body)}

    </div>
  );
}
