import { useEffect, useRef, useState } from "react";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { addImage, onAddCircle, onAddRectangle, onAddText, onDeleteAll, onDeleteSelected, onFillObject, onSelectAll } from "./components/fabricHooks";
import { BsCircle, BsChatLeftText, BsFillImageFill, BsPencilFill, BsVectorPen } from 'react-icons/bs'
import { BiRectangle } from 'react-icons/bi'
import { RxArrowDown, RxArrowUp } from 'react-icons/rx'
import { FaBackspace } from "react-icons/fa";
import { RiDeleteBin5Line } from 'react-icons/ri'
import { MdOutlineColorLens } from 'react-icons/md'
import { GoDesktopDownload } from 'react-icons/go'
import { useDisclosure } from "@mantine/hooks";
import { Input, Modal } from "@mantine/core";
import { useModalStyles } from "./theme/modal";
import { useFont } from "./components/fontContext";
import { removeRulerOnMoveMarker, RULER_LINES } from "./ruler";
import ColorPicker from 'react-pick-color';
import TextPanel from "./components/TextPanel";

export default function App() {
  const [backgroundImage] = useState(null);
  const [objectImage, setObjectImage] = useState(null);
  const [text, setText] = useState("");
	const [currentSelectedElements, setCurrentSelectedElements] = useState(null);

  const [color, setColor] = useState('#d946ef');
  const [isEditorReady, setIsEditorReady] = useState(false);
  const containerRef = useRef(null);
  const { editor, onReady } = useFabricJSEditor();
  const {
    fontName, setFontName,
    isBold, isItalic, setIsBold, setIsItalic,
    setIsUnderline, setFontWeight,
    isUnderline, fontWeight, selectedFontColor, setSelectedFontColor
  } = useFont();
  const resizeCanvas = () => {
    if (editor && containerRef.current) {
      const container = containerRef.current;
      const width = container.clientWidth;
      const height = window.innerHeight - 80; //min-h-[calc(100vh-80px)]
      editor.canvas.setWidth(width);
      editor.canvas.setHeight(height);
      editor.canvas.renderAll();
    }
  };
  useEffect(() => {
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas(); // initial call
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [editor]);
  
  //TODO: Implement undo/redo functionality
  // const [history, setHistory] = useState({
  //   undo: [],
  //   redo: [],
  // });
  // function saveToUndoHistory() {
  //   setHistory(prev => ({
  //     undo: [...prev.undo, editor?.canvas.toJSON()],
  //     redo: [], // Clear redo when new change is made
  //   }));
  // }
  // function undo() {
  //   setHistory(prev => {
  //     if (prev.undo.length === 0) return prev;
  //     const newRedo = [editor?.canvas.toJSON(), ...prev.redo];
  //     const lastState = prev.undo[prev.undo.length - 1];
  
  //     editor?.canvas.loadFromJSON(lastState, () => {
  //       editor?.canvas.renderAll();
  //     });
  
  //     return {
  //       undo: prev.undo.slice(0, -1),
  //       redo: newRedo,
  //     };
  //   });
  // }
  // function redo() {
  //   setHistory(prev => {
  //     if (prev.redo.length === 0) return prev;
  //     const nextState = prev.redo[0];
  
  //     editor?.canvas.loadFromJSON(nextState, () => {
  //       editor?.canvas.renderAll();
  //     });
  
  //     return {
  //       undo: [...prev.undo, editor?.canvas.toJSON()],
  //       redo: prev.redo.slice(1),
  //     };
  //   });
  // }
  const [activeTextObject, setActiveTextObject] = useState(null);
  const _onReady = (canvas) => {
    fabric.Image.fromURL(backgroundImage, (img) => {
      canvas.set("backgroundColor", '#fafaf9');
      canvas.on('selection:created', function (event) {
        setCurrentSelectedElements(event.selected);
      });
      canvas.on('selection:updated', function (event) {
        event?.deselected
          ?.filter(item => Object.values(RULER_LINES).includes(item.data?.type))
          .forEach(item => {
            item.set({ stroke: '#D92D20', fill: '#D92D20' });
          });
        removeRulerOnMoveMarker(canvas);
        setCurrentSelectedElements(arr => {
          if (!arr) {
            return null;
          }
  
          if (event?.e?.shiftKey) {
            if (event.selected && event.selected.length > 0) {
              return [...arr, ...event.selected];
            }
  
            if (event.deselected && event.deselected.length > 0) {
              return arr.filter(item => !event.deselected?.includes(item));
            }
          }
          return event.selected;
        });
      });
      canvas.on('selection:cleared', () => {
        setCurrentSelectedElements([]);
      });
      canvas.on('mouse:dblclick', function (e) {
        const target = e.target;
        if (target && target.type === 'text') {
          setSelectedModal('editText');
          openModal();
          setText(target.text);
          setActiveTextObject(target);
        }
      });
      //TODO: Implement undo/redo functionality
      // canvas.on('object:modified', saveToUndoHistory);
      // canvas.on('object:added', saveToUndoHistory);
      // canvas.on('object:removed', saveToUndoHistory);
      canvas.renderAll();
      onReady(canvas);
      setIsEditorReady(true);
    });
  };
  function bringForward() {
    currentSelectedElements.forEach(obj => {
      editor?.canvas.bringForward(obj);
    });
    editor?.canvas.requestRenderAll();
  }
  function sendBackward() {
    currentSelectedElements.forEach(obj => {
      editor?.canvas.sendBackwards(obj);
    });
    editor?.canvas.requestRenderAll();
  }

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Delete" && !!editor && !!editor?.canvas) {
        onDeleteSelected(editor);
      }
      if (
        (event.key.toLowerCase() == "a") &&
        event.ctrlKey &&
        !!editor &&
        !!editor?.canvas
      ) {
        event.preventDefault();
        onSelectAll(editor, fabric);
      }
      // if (event.key === "z" && event.ctrlKey) {
      //   event.preventDefault();
      //   undo();
      // }
      // if (event.key === "y" && event.ctrlKey) {
      //   event.preventDefault();
      //   redo();
      // }
    };
    if (!isEditorReady) return;
    if (!editor) return;
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEditorReady, editor]);

  const [drawing, setDrawing] = useState(false);
  const toggleDrawingMode = (_e, persist = false) => {
    if (!editor) return;
    const canvas = editor.canvas;
    if (persist) {
      if (drawing) {
        canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
        canvas.freeDrawingBrush.color = color?.hex ?? color;
        canvas.freeDrawingBrush.width = 2;
      }
      return;
    }
    if (!drawing) {
      canvas.isDrawingMode = true;
      canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
      canvas.freeDrawingBrush.color = color?.hex ?? color;
      canvas.freeDrawingBrush.width = 2;
    } else {
      canvas.isDrawingMode = false;
    }

    setDrawing(!drawing);
  };

  const [lineMaking, setLineMaking] = useState(false);
  function toggleLineMode(_e, persist = false) {
    if (!editor) return;

    const canvas = editor.canvas;

    if (!persist) {
      if (!drawing) {
        canvas.isDrawingMode = false;
        setDrawing(false);
      }
  
      if (lineMaking) {
        setLineMaking(false);
        canvas.off("mouse:down");
        canvas.off("mouse:move");
        canvas.off("mouse:up");
        return;
      }
    }

    setLineMaking(true);
    let tempLine = null;

    const onMouseDown = (opt) => {
      const pointer = canvas.getPointer(opt.e);
      const points = [pointer.x, pointer.y, pointer.x, pointer.y];
      tempLine = new fabric.Line(points, {
        strokeWidth: 2,
        stroke: color?.hex ?? color,
        originX: "center",
        originY: "center",
        selectable: false,
        evented: false,
      });
      canvas.add(tempLine);
    };

    const onMouseMove = (opt) => {
      if (!tempLine) return;
      const pointer = canvas.getPointer(opt.e);
      tempLine.set({ x2: pointer.x, y2: pointer.y });
      canvas.renderAll();
    };

    const onMouseUp = () => {
      tempLine = null;
    };

    canvas.on("mouse:down", onMouseDown);
    canvas.on("mouse:move", onMouseMove);
    canvas.on("mouse:up", onMouseUp);
  }

  const [loadingRemoveBg, setLoadingRemoveBg] = useState(false);
  const handleRemoveBackground = async () => {
    if (!objectImage?.file) {
      return;
    }
    setLoadingRemoveBg(true);

    const apiKey = import.meta.env.VITE_APP_BG_KEY;
    const apiUrl = "https://api.remove.bg/v1.0/removebg";

    const formData = new FormData();
    formData.append("image_file", objectImage?.file, `uploader-${Math.floor(Math.random() * 1000)}.png`);
    formData.append("size", 'auto');

    try {
      const res = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'X-Api-Key': apiKey
          },
          body: formData
      });

      const data = await res.blob();
      const imageUrl = URL.createObjectURL(data);
      setObjectImage((prev) => ({
        ...prev,
        url: imageUrl,
        file: data
      }));
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingRemoveBg(false);
    }
  };
  function download() {
    if (editor) {
      const canvas = editor?.canvas;
      if (canvas) {
        const dataURL = canvas.toDataURL({
          format: "png",
          multiplier: 2, 
        });

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "canvas.png";

        link.click();
      }
    }
  }

  const [selectedModal, setSelectedModal] = useState(null);
  const { classes: modalClasses } = useModalStyles();
  const [isModalOpen, { open: openModal, close: closeModal }] = useDisclosure();
  useEffect(() => {
    if (drawing) {
      toggleDrawingMode();
    }
    if (lineMaking) {
      toggleLineMode();
    }
  }, [isModalOpen]);

  function initFontSetup() {
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setFontWeight("regular");
    setSelectedFontColor("#000000");
    setFontName("");
  }

  const modalOptions = {
    uploadImage: {
      title: "Upload Image",
      description: "Upload an image to the canvas.",
      children: (
        <fieldset className="flex flex-col justify-start items-center gap-x-1 w-full">
          <input
            className="text-sm text-slate-500 w-full
          file:mr-4 file:py-2 file:px-4
          file:rounded-full file:border-0
          file:text-sm file:font-semibold
          file:bg-violet-50 file:text-violet-700
          hover:file:bg-violet-100"
            type="file"
            onChange={(event) => { if (event.target.files) {
              const imgURL = URL.createObjectURL(event.target.files[0]);
              setObjectImage({
                url: imgURL,
                file: event.target.files[0]
              });
            }}}
          />
          {!!objectImage?.url && (
            <>
              <img src={objectImage.url} alt="Uploaded" className="block my-4 max-h-[500px]" />
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  className={`border border-zinc-200 rounded-full px-6 py-2 w-fit ${loadingRemoveBg ? 'opacity-80' : 'hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-500'} transition-all`}
                  onClick={() => {
                    addImage(fabric, editor, objectImage.url);
                    setObjectImage(null);
                    closeModal();
                  }}
                  disabled={loadingRemoveBg}
                >
                  Upload!
                </button>
                <button
                  className={`border border-zinc-200 rounded-full px-6 py-2 w-fit ${loadingRemoveBg ? 'opacity-80' : 'hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-500'} transition-all`}
                  onClick={() => {
                    handleRemoveBackground();
                  }}
                  disabled={loadingRemoveBg}
                >
                  {loadingRemoveBg ? (
                    <span className="animate-spin">Loading...</span>
                  ) : (
                    <>Remove Background</>
                  )}
                </button>
              </div>
            </>
          )}
        </fieldset>
      ),
    },
    editText: {
      title: "Add Text",
      description: "Edit the text on the canvas.",
      children: (
        <fieldset className='flex w-full justify-start items-center gap-x-1 flex-col'>
          <Input
            className='bg-gray-50 w-full text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 mb-5'
            name='text'
            type='text'
            value={text}
            onChange={(event) => setText(event.target.value)}
          />
          <TextPanel
            canvas={editor?.canvas}
            currentSelectedElements={currentSelectedElements}
            text={text}
          />
          <div>
            <button
              className={`mt-5 block border border-zinc-200 rounded-full px-6 py-2 w-fit ${!!text ? 'hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-500' : 'opacity-60'} transition-all`}
              onClick={() => {
                onAddText(fabric, editor, text, setText, {
                  fontFamily: fontName,
                  fontStyle: isItalic ? "italic" : "normal",
                  fill: selectedFontColor,
                  fontWeight: isBold ? "bold" : fontWeight === "regular" ? "normal" : fontWeight,
                  underline: isUnderline,
                }, activeTextObject, setActiveTextObject);
                initFontSetup();
                closeModal();
              }}
              disabled={!text}
            >
              {!!activeTextObject ? "Update Text" : "Add Text"}
            </button>
          </div>
        </fieldset>
      ),
    },
    fillObject: {
      title: "Fill Object",
      description: "Fill the selected object with a color.",
      children: (
        <fieldset className="flex flex-col justify-start items-center gap-x-1 w-full">
          <ColorPicker
            className="!w-full"
            color={color?.hex ?? color}
            onChange={(c) => setColor(c)}
          />
          <button
            className="border border-zinc-200 rounded-full px-8 mt-4 py-2 w-fit hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-500 transition-all"
            onClick={(e) => {
              onFillObject(editor, color);
              if (drawing) {
                toggleDrawingMode(e, true);
              }
              if (lineMaking) {
                toggleLineMode(e, true);
              }
              closeModal();
            }}
          >
            Fill!
          </button>
        </fieldset>
      ),
    },
  };

  return (
    <>
      <div className="relative">
        <div className="w-full mx-auto min-h-screen flex items-center justify-center flex-col md:pr-3">
          <div className="flex justify-start w-full max-md:px-4 md:justify-center items-center text-white text-xl md:text-2xl uppercase font-thin md·text-center max-md:pt-4 md:py-3 tracking-widest gap-x-3">
            <h1 className="font-bold">✏️ DeepLive: Edit your products!</h1>
          </div>
          <div className="flex justify-start items-start w-full max-md:flex-col overflow-hidden">
            <div className="flex gap-3 text-3xl p-3 flex-row flex-wrap md:flex-col">
              <button
                title="Add circle"
                className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                onClick={() => onAddCircle(editor)}>
                <BsCircle />
              </button>

              <button
                title="Add rectangle"
                className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                onClick={() =>
                  onAddRectangle(editor)}>
                <BiRectangle />
              </button>

              {/* add text  */}
              <div className="relative">
                <button
                  title="Add text"
                  onClick={() => {
                    setSelectedModal("editText");
                    openModal();
                  }}
                  className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                >
                  <BsChatLeftText />
                </button>
              </div>

              {/* pencil brush */}
              <div className="relative">
                <button
                  title="Pencil"
                  onClick={toggleDrawingMode}
                  className={`bg-white/10 text-white rounded-lg p-2 w-fit transition-all ${
                    drawing
                      ? "!bg-cyan-500/10 !text-cyan-500"
                      : "hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500"
                  }`}
                >
                  <BsPencilFill />
                </button>
              </div>

              {/* line shaper */}
              <div className="relative">
                <button
                  title="Line shaper"
                  onClick={toggleLineMode}
                  className={`bg-white/10 text-white rounded-lg p-2 w-fit transition-all ${
                    lineMaking
                      ? "!bg-cyan-500/10 !text-cyan-500"
                      : "hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500"
                  }`}
                >
                  <BsVectorPen />
                </button>
              </div>

              {/*  fill object color  */}
              <div className="relative">
                <button
                  title="Fill object"
                  className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                  onClick={() => {
                    setSelectedModal("fillObject");
                    openModal();
                  }}>
                  <MdOutlineColorLens style={{ fill: `${color.hex}` }} />
                </button>
              </div>

              {/* add image  */}
              <div className="relative">
                <button
                  title="Upload Image"
                  className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                  onClick={() => {
                    setSelectedModal("uploadImage");
                    openModal();
                  }}>
                  <BsFillImageFill />
                </button>
              </div>

              {!!currentSelectedElements?.length &&
              <>
                {/* layout up changes */}
                <button
                  title="Bring forward"
                  className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                  onClick={() => bringForward()}>
                  <RxArrowUp />
                </button>
                {/* layout down changes */}
                <button
                  title="Send backward"
                  className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                  onClick={() => sendBackward()}>
                  <RxArrowDown />
                </button>
              </>
              }

              {/* revert changes */}
              <button
                title="Delete all"
                className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                onClick={() => onDeleteAll(editor, setText)}>
                <FaBackspace />
              </button>

              {/* {
                history?.undo?.length > 0 && (
                <button
                  className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                  onClick={() => undo()}>
                  <IoReturnDownBackOutline />
                </button>
                )
              }
              {
                history?.redo?.length > 0 && (
                <button
                  className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                  onClick={() => redo()}>
                  <IoReturnDownForward />
                </button>
                )
              } */}

              {/* Delete selected  */}
              <button
                title="Delete selected"
                disabled={!currentSelectedElements?.length}
                className="bg-white/10  text-red-500 rounded-lg p-2 w-fit hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 transition-all"
                onClick={() => onDeleteSelected(editor)}>
                <RiDeleteBin5Line />
              </button>

              {/* download  */}
              <button
                title="Download"
                className="bg-white/10 rounded-lg p-2 w-fit text-green-500 hover:bg-green-500/10 hover:text-green-500 hover:green-cyan-500 transition-all"
                onClick={download}
              >
                <GoDesktopDownload />
              </button>
            </div>
            <div ref={containerRef} className="w-full min-h-[calc(100vh-80px)]">
              <FabricJSCanvas id="canvas-container" className="w-full h-full" onReady={_onReady} />
            </div>
          </div>
        </div>
      </div>
      <Modal
        opened={isModalOpen && !!selectedModal}
        onClose={() => {
          closeModal();
          setObjectImage(null);
          setText("");
          initFontSetup();
        }}
        title={modalOptions[selectedModal]?.title ?? ""}
        centered
        classNames={{
          content: modalClasses?.content,
          title: modalClasses?.title,
        }}
        size={"xl"}
		  >
        {modalOptions[selectedModal]?.children}
      </Modal>
    </>
  );
}
