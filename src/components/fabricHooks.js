export const onAddCircle = (editor) => {
  editor?.addCircle();
};
export const onAddRectangle = (editor) => {
  editor?.addRectangle();
};

export const onAddText = (
  fabric,
  editor,
  text,
  setText,
  confs,
  activeTextObject,
  setActiveTextObject
) => {
  if (!editor || !text) return;

  if (activeTextObject) {
    activeTextObject.set({
      ...confs,
      text,
    });
    editor.canvas.renderAll();
    setActiveTextObject(null);
  } else {
    const toAddText = new fabric.Text(text, { ...confs });
    editor.canvas.add(toAddText);
  }

  setText('');
};

export const onDeleteAll = (editor, setText) => {
  editor?.deleteAll();
  setText("");
};
export const onDeleteSelected = (editor) => {
  editor?.deleteSelected();
};

export const onSelectAll = (editor, fabric) => {
  editor?.canvas.discardActiveObject();
  const sel = new fabric.ActiveSelection(
    editor.canvas.getObjects(),
    { canvas: editor.canvas }
  );
  editor?.canvas.setActiveObject(sel);
  editor?.canvas.requestRenderAll();
}

export const onFillObject = (editor, color) => {
  editor?.setFillColor(color?.hex)
}

export const onBackgroundChange = (canvas, backgroundImage, setShowBGField) => {
    // const getImageURL = URL.createObjectURL(backgroundImage);
    canvas?.setBackgroundColor("#f0f0f0", canvas.renderAll(canvas));
    setShowBGField(prev => !prev)
}

export const addImage = (fabric, editor, imageURL) => {
  if (imageURL) {
    fabric.Image.fromURL(imageURL, function (oImg) {
      oImg.set({
        scaleX: 0.2,
        scaleY: 0.2
      });
      editor?.canvas.add(oImg);
    });
  }
};
