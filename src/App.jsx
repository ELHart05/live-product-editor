import { useState } from "react";
import { fabric } from "fabric";
import { FabricJSCanvas, useFabricJSEditor } from "fabricjs-react";
import { addImage, onAddCircle, onAddRectangle, onAddText, onDeleteAll, onDeleteSelected, onFillObject } from "./components/fabricHooks";

import { BsCircle, BsChatLeftText, BsFillImageFill } from 'react-icons/bs'
import { BiRectangle } from 'react-icons/bi'
import { RxReset } from 'react-icons/rx'
import { RiDeleteBin5Line } from 'react-icons/ri'
import { MdAdd, MdOutlineColorLens } from 'react-icons/md'
import { GoDesktopDownload } from 'react-icons/go'
import { ColorPicker, useColor } from "react-color-palette";
import { FcEditImage } from 'react-icons/fc'
import "react-color-palette/lib/css/styles.css";

export default function App() {
  const [backgroundImage] = useState(null); // eslint-disable-line no-use-before-define
  const [objectImage, setObjectImage] = useState(null);
  const [text, setText] = useState("");
  const [showTextField, setShowTextField] = useState(false)
  const [showUploadField, setShowUploadField] = useState(false)
  const [showPallate, setShowPallate] = useState(false)


  const [color, setColor] = useColor("hex", "#d946ef");

  const { editor, onReady } = useFabricJSEditor();

  const _onReady = (canvas) => {
    fabric.Image.fromURL(backgroundImage, (img) => {
      canvas.set("backgroundColor", '#fafaf9');
      canvas.renderAll();
      onReady(canvas);
    });
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

  return (
    <div className="relative">
      <div className="w-fit mx-auto h-screen flex items-center justify-center flex-col">
        <div className="flex justify-center items-center text-white text-2xl uppercase font-thin text-center pb-2 tracking-widest gap-x-3">
          <h1><FcEditImage /></h1>
          <h1>DeepLive: Edit your products!</h1>
        </div>
        <div className="flex justify-start items-start">
          <div className="flex flex-col gap-y-3 text-3xl p-3">
            <button
              className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
              onClick={() => onAddCircle(editor)}>
              <BsCircle />
            </button>
            <button
              className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
              onClick={() =>
                onAddRectangle(editor)}>
              <BiRectangle />
            </button>

            {/* add text  */}
            <div className="relative">
              <button
                onClick={() => setShowTextField(!showTextField && true)}
                className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
              >
                <BsChatLeftText />
              </button>
              {showTextField &&
                <fieldset className="absolute z-10 top-0 -right-[15rem] flex justify-start items-center gap-x-1">
                  <input
                    className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500  p-1.5 "
                    name={`text`}
                    type={`text`}
                    value={text}
                    onChange={(event) => setText(event.target.value)}
                  />
                  <button
                    className="border border-zinc-200 rounded-full p-2 w-fit hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                    onClick={() => onAddText(editor, text, setText, setShowTextField)}>
                    <MdAdd />
                  </button>
                </fieldset>
              }
            </div>

            {/*  fill object color  */}
            <div className="relative">
              <button
                className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                onClick={() => setShowPallate(prev => !prev)}>
                <MdOutlineColorLens style={{ fill: `${color.hex}` }} />
              </button>
              {showPallate &&
                <div className="absolute top-0 -right-[33.5rem] z-10 flex justify-start items-start gap-x-2">
                  <ColorPicker width={456} height={228} color={color} onChange={setColor} hideHSV dark />
                  <button
                    className="border border-zinc-200 rounded-full p-2 w-fit hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                    onClick={() => onFillObject(editor, color)}>
                    <MdAdd />
                  </button>
                </div>}
            </div>

            {/* add image  */}
            <div className="relative">
              <button
                className="bg-white/10 text-white  rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                onClick={() => setShowUploadField(prev => !prev)}>
                <BsFillImageFill />
              </button>
              {showUploadField &&
                <fieldset className="absolute z-10 top-0 -right-[21rem] flex justify-start items-center gap-x-1">
                  <input
                    className="text-sm text-slate-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-violet-50 file:text-violet-700
                  hover:file:bg-violet-100"
                    type="file"
                    onChange={(event) => { if (event.target.files) setObjectImage(event.target.files[0]) }}
                  />
                  <button
                    className="border border-zinc-200 rounded-full p-2 w-fit hover:bg-cyan-50 hover:text-cyan-500 hover:border-cyan-500 transition-all"
                    onClick={() => addImage(fabric, editor, objectImage, setShowUploadField)}>
                    <MdAdd />
                  </button>
                </fieldset>
              }
            </div>

            {/* revert changes */}
            <button
              className="bg-white/10 text-white rounded-lg p-2 w-fit hover:bg-cyan-500/10 hover:text-cyan-500 hover:border-cyan-500 transition-all"
              onClick={() => onDeleteAll(editor, setText)}>
              <RxReset />
            </button>

            {/* Delete selected  */}
            <button
              className="bg-white/10  text-red-500 rounded-lg p-2 w-fit hover:bg-red-500/10 hover:text-red-500 hover:border-red-500 transition-all"
              onClick={() => onDeleteSelected(editor)}>
              <RiDeleteBin5Line />
            </button>
            {/* download  */}
            <button
              className="bg-white/10 rounded-lg p-2 w-fit text-green-500 hover:bg-green-500/10 hover:text-green-500 hover:green-cyan-500 transition-all"
              onClick={download}
            >
              <GoDesktopDownload />
            </button>
          </div>
          <div className=" border border-zinc-200 rounded-lg">
            <FabricJSCanvas className="h-[calc(100vh-80px)] w-[90vw]" onReady={_onReady} />
          </div>
        </div>
      </div>
    </div>
  );
}
