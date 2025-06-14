import { fabric } from 'fabric';

export const FABRIC_JSON_ALLOWED_KEYS = [
	'data',
	'selectable',
	'effects',
	'hoverCursor',
	'moveCursor',
	'stroke',
	'strokeWidth',
	'hasControls',
	'hasBorders',
	'lockRotation',
	'lockMovementY',
	'lockScalingX',
	'lockScalingY',
	'lockUniScaling',
	'lockSkewingX',
	'lockSkewingY',
	'lockScalingFlip',
	'properties',
	'fitScale',
	'fillScale',
];

export const generateId = () => {
	return Math.random().toString(36).substring(2, 9);
};

export const getCanvasVisibleTopLeft = (canva) => {
	const canvas = canva;
	const vpt = canvas.viewportTransform;
	const scrollTop = window.scrollY || document.documentElement.scrollTop;
	const scrollLeft = window.scrollX || document.documentElement.scrollLeft;
	const visibleTop = -vpt[5] / vpt[0] + scrollTop / vpt[0];
	const visibleLeft = -vpt[4] / vpt[0] + scrollLeft / vpt[0];
	return { top: visibleTop, left: visibleLeft };
};


export const RULER_COLORS = {
	DARK: {
		BACKGROUND: '#1A1B1E',
		TEXT_STROKE: '#5C5F66',
	},
	LIGHT: {
		BACKGROUND: '#fff',
		TEXT_STROKE: '#98A2B3',
		RULER_BORDER: '#D0D5DD',
	},
	MARKER_LINE: {
		DEFAULT: '#F97066',
		FOCUSED: '#F04438',
	},
};

export const RULER_ELEMENTS = {
	X_RULER_BACKGROUND: 'X_RULER_BACKGROUND',
	Y_RULER_BACKGROUND: 'Y_RULER_BACKGROUND',
	X_RULER_MARKER: 'X_RULER_MARKER',
	Y_RULER_MARKER: 'Y_RULER_MARKER',
	X_RULER_MARKER_TEXT: 'X_RULER_MARKER_TEXT',
	Y_RULER_MARKER_TEXT: 'Y_RULER_MARKER_TEXT',
	X_ON_MOVE_MARKER: 'X_ON_MOVE_MARKER',
	Y_ON_MOVE_MARKER: 'Y_ON_MOVE_MARKER',
	BLOCK: 'BLOCK',
};

export const RULER_LINES = {
	X_RULER_LINE: 'X_RULER_LINE',
	Y_RULER_LINE: 'Y_RULER_LINE',
};

export function getRulerZoomScale(zoom) {
	if (zoom <= 0.02) return 5000;
	if (zoom <= 0.05) return 2500;
	if (zoom <= 0.1) return 1000;
	if (zoom <= 0.2) return 500;
	if (zoom <= 0.5) return 250;
	if (zoom < 1) return 100;
	if (zoom >= 1 && zoom < 2) return 50;
	if (zoom >= 2 && zoom < 5) return 25;
	if (zoom >= 5 && zoom < 10) return 10;
	if (zoom >= 10 && zoom < 15) return 5;
	if (zoom >= 15 && zoom < 20) return 2;
	if (zoom >= 20) return 2;
	return 100;
}

function getAdjustedMarkerTextPosition(num) {
	const sign = Math.sign(num) > 0;
	const digits = Math.floor(Math.log10(Math.abs(num))) + 1;
	if (num === 0 || digits === 1) return 3;
	return sign ? 3 + digits : 5 + digits;
}

// render ruler step lines and markers
export function renderRulerStepMarkers(canva, colorScheme = 'light') {
	canva
		?.getObjects()
		.filter(item =>
			[
				RULER_ELEMENTS.X_RULER_MARKER,
				RULER_ELEMENTS.Y_RULER_MARKER,
				RULER_ELEMENTS.X_RULER_MARKER_TEXT,
				RULER_ELEMENTS.Y_RULER_MARKER_TEXT,
				RULER_ELEMENTS.X_ON_MOVE_MARKER,
				RULER_ELEMENTS.Y_ON_MOVE_MARKER,
			].includes(item.data?.type),
		)
		.forEach(item => {
			canva?.remove(item);
		});
	const { left, top } = getCanvasVisibleTopLeft(canva);
	const zoom = canva?.getZoom();
	const pan = canva?.viewportTransform;
	const interval = getRulerZoomScale(zoom);
	const nearest = Math.round(left / interval) * interval;
	const canvasWidth = canva?.width;
	for (let i = nearest; i < (canvasWidth + -pan[4]) / zoom; i += interval) {
		const line = new fabric.Line([i, 0, i, 5 / zoom], {
			stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.TEXT_STROKE,
			strokeWidth: 1 / zoom,
			left: i,
			selectable: false,
			hoverCursor: 'default',
			top: (-pan[5] + 16) / zoom,
			data: {
				isSaveExclude: true,
				ignoreSnapping: true,
				type: RULER_ELEMENTS.X_RULER_MARKER,
				id: generateId(),
			},
		});
		const text = new fabric.Text(`${i}`, {
			left: i - getAdjustedMarkerTextPosition(i) / zoom,
			top: -pan[5] / zoom,
			fontSize: 10 / zoom,
			strokeWidth: 2 / zoom,
			fill: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.TEXT_STROKE,
			fontFamily: 'Inter',
			selectable: false,
			hoverCursor: 'default',
			data: {
				isSaveExclude: true,
				ignoreSnapping: true,
				type: RULER_ELEMENTS.X_RULER_MARKER_TEXT,
				id: generateId(),
			},
		});

		canva?.add(line, text);
	}
	const nearestTop = Math.round(top / interval) * interval;
	const canvasHeight = canva?.height;
	for (let i = nearestTop; i < (canvasHeight + -pan[5]) / zoom; i += interval) {
		const line = new fabric.Line([0, i, 5 / zoom, i], {
			stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.TEXT_STROKE,
			strokeWidth: 1 / zoom,
			top: i,
			selectable: false,
			hoverCursor: 'default',
			left: (-pan[4] + 16) / zoom,
			data: {
				isSaveExclude: true,
				ignoreSnapping: true,
				type: RULER_ELEMENTS.Y_RULER_MARKER,
				id: generateId(),
			},
		});
		const text = new fabric.Text(`${i}`, {
			top: i + getAdjustedMarkerTextPosition(i) / zoom,
			left: -pan[4] / zoom,
			fontSize: 10 / zoom,
			strokeWidth: 2 / zoom,
			fontFamily: 'Inter',
			fill: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.TEXT_STROKE,
			selectable: false,
			angle: 270,
			hoverCursor: 'default',
			data: {
				isSaveExclude: true,
				ignoreSnapping: true,
				type: RULER_ELEMENTS.Y_RULER_MARKER_TEXT,
				id: generateId(),
			},
		});
		canva?.add(line, text);
	}
	const block = findBlock(canva);
	block?.set({
		left: -pan[4] / zoom,
		top: -pan[5] / zoom,
		strokeWidth: 1 / zoom,
		width: 20 / zoom,
		height: 20 / zoom,
		stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.RULER_BORDER,
		fill: colorScheme === 'dark' ? RULER_COLORS.DARK.BACKGROUND : RULER_COLORS.LIGHT.BACKGROUND,
	});
	block?.moveTo((canva.current?.getObjects()?.length) - 1);
	block?.setCoords();
	canva?.requestRenderAll();
}

export function renderRulerAxisBackground(
	canvasRef,
	colorScheme = 'light',
) {
	const zoom = canva?.getZoom();
	const xaxis = new fabric.Rect({
		left: 0,
		top: 0,
		fill: colorScheme === 'dark' ? RULER_COLORS.DARK.BACKGROUND : RULER_COLORS.LIGHT.BACKGROUND,
		width: canva?.width,
		height: 20,
		selectable: false,
		hoverCursor: 'default',
		stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.RULER_BORDER,
		strokeWidth: 1 / zoom,
		data: {
			ignoreSnapping: true,
			isSaveExclude: true,
			id: generateId(),
			type: RULER_ELEMENTS.X_RULER_BACKGROUND,
		},
	});
	const yaxis = new fabric.Rect({
		left: 0,
		top: 0,
		fill: colorScheme === 'dark' ? RULER_COLORS.DARK.BACKGROUND : RULER_COLORS.LIGHT.BACKGROUND,
		width: 20,
		selectable: false,
		hoverCursor: 'default',
		height: canva?.height,
		stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.RULER_BORDER,
		strokeWidth: 1 / zoom,
		data: {
			id: generateId(),
			type: RULER_ELEMENTS.Y_RULER_BACKGROUND,
			ignoreSnapping: true,
			isSaveExclude: true,
		},
	});
	const block = new fabric.Rect({
		left: 0,
		top: 0,
		fill: colorScheme === 'dark' ? RULER_COLORS.DARK.BACKGROUND : RULER_COLORS.LIGHT.BACKGROUND,
		width: 20 / zoom,
		selectable: false,
		height: 20 / zoom,
		hoverCursor: 'default',
		stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.RULER_BORDER,
		strokeWidth: 1 / zoom,
		data: {
			id: generateId(),
			type: RULER_ELEMENTS.BLOCK,
			ignoreSnapping: true,
			isSaveExclude: true,
		},
	});
	canva
		?.getObjects()
		.filter(item =>
			[RULER_ELEMENTS.X_RULER_BACKGROUND, RULER_ELEMENTS.Y_RULER_BACKGROUND, RULER_ELEMENTS.BLOCK].includes(
				item.data?.type,
			),
		)
		.forEach(item => {
			canva?.remove(item);
		});
	canva?.add(xaxis, yaxis, block);
	canva?.requestRenderAll();
}

export function adjustRulerLinesPosition(canva) {
	const allObjects = canvasRef?.current?.getObjects();
	const zoom = canva?.getZoom();
	const canvasHeight = canva?.height;
	const canvasWidth = canva?.width;
	const padding = zoom > 1 ? 10 / zoom : zoom * 10;
	allObjects
		.filter(x => x?.data?.type === RULER_LINES.X_RULER_LINE)
		.forEach(x => {
			const pan = canva?.viewportTransform;
			x?.set({
				strokeWidth: 1 / zoom,
				top: (-pan[5] + 20) / zoom,
				height: canvasHeight / zoom,
				width: 0,
				padding,
			});
			x.setCoords();
		});

	allObjects
		.filter(x => x?.data?.type === RULER_LINES.Y_RULER_LINE)
		.forEach(x => {
			const pan = canva?.viewportTransform;
			x?.set({
				strokeWidth: 1 / zoom,
				left: (-pan[4] + 20) / zoom,
				width: canvasWidth / zoom,
				height: 0,
				padding,
			});
			x.setCoords();
		});
}

export function removeRulerOnMoveMarker(canva) {
	canva
		?.getObjects()
		.filter(item => [RULER_ELEMENTS.X_ON_MOVE_MARKER, RULER_ELEMENTS.Y_ON_MOVE_MARKER].includes(item.data?.type))
		.forEach(item => {
			canva?.remove(item);
		});
}

export function findXAxis(canva) {
	return canva?.getObjects().find(x => x?.data?.type === RULER_ELEMENTS.X_RULER_BACKGROUND);
}

export function findYAxis(canva) {
	return canva?.getObjects().find(x => x?.data?.type === RULER_ELEMENTS.Y_RULER_BACKGROUND);
}

export function findBlock(canva) {
	return canva?.getObjects().find(x => x?.data?.type === RULER_ELEMENTS.BLOCK);
}

export function adjustRulerBackgroundPosition(
	canvasRef,
	colorScheme = 'light',
) {
	const xaxis = findXAxis(canva);
	const yaxis = findYAxis(canva);
	const block = findBlock(canva);
	const pan = canva?.viewportTransform;
	const zoom = canva?.getZoom();
	const canvasWidth = canva?.width;
	const canvasHeight = canva?.height;
	xaxis?.set({
		left: -pan[4] / zoom,
		top: -pan[5] / zoom,
		strokeWidth: 1 / zoom,
		stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.RULER_BORDER,
		fill: colorScheme === 'dark' ? RULER_COLORS.DARK.BACKGROUND : RULER_COLORS.LIGHT.BACKGROUND,
		width: canvasWidth / zoom,
		height: 20 / zoom,
	});
	yaxis?.set({
		left: -pan[4] / zoom,
		top: -pan[5] / zoom,
		strokeWidth: 1 / zoom,
		width: 20 / zoom,
		stroke: colorScheme === 'dark' ? RULER_COLORS.DARK.TEXT_STROKE : RULER_COLORS.LIGHT.RULER_BORDER,
		fill: colorScheme === 'dark' ? RULER_COLORS.DARK.BACKGROUND : RULER_COLORS.LIGHT.BACKGROUND,
		height: canvasHeight / zoom,
	});
	xaxis?.moveTo((canva.current?.getObjects()?.length) + 1);
	yaxis?.moveTo((canva.current?.getObjects()?.length) + 2);
	block?.moveTo((canva.current?.getObjects()?.length) + 3);
	xaxis?.setCoords();
	yaxis?.setCoords();
}

export function removeRuler(canva) {
	canva
		?.getObjects()
		.filter(x => [...Object.values(RULER_LINES), ...Object.values(RULER_ELEMENTS)].includes(x.data?.type))
		.forEach(x => {
			canva?.remove(x);
		});
	canva?.renderAll();
}

export function loadRulerLines(canva, id) {
	const rulerLines = readRulerDataFromStorage();
	const currentArtboardRuler = rulerLines?.[id];
	if (!currentArtboardRuler) return;
	const zoom = canva?.getZoom();
	const pan = canva?.viewportTransform;
	const canvasHeight =
		zoom > 1 ? (canva.current?.height) : (canva.current?.height) / zoom;
	const canvasWidth = zoom > 1 ? (canva.current?.width) : (canva.current?.width) / zoom;
	removeDuplicateRulerLines(currentArtboardRuler).forEach((item) => {
		const axis = item?.data?.type === RULER_LINES.X_RULER_LINE ? 'x' : 'y';
		const points =
			axis === 'x'
				? [item.left, (-pan[5] + 20) / zoom, item.left, canvasHeight]
				: [(-pan[4] + 20) / zoom, item.top, canvasWidth, item.top];
		const line = new fabric.Line(points, {
			stroke: RULER_COLORS.MARKER_LINE.DEFAULT,
			strokeWidth: 1 / zoom,
			hasControls: false,
			hasBorders: false,
			lockRotation: true,
			lockScalingX: true,
			lockScalingY: true,
			lockUniScaling: true,
			lockSkewingX: true,
			lockSkewingY: true,
			selectable: false,
			lockScalingFlip: true,
			...(axis === 'x'
				? { lockMovementY: true, hoverCursor: 'ew-resize', moveCursor: 'ew-resize' }
				: { lockMovementX: true, hoverCursor: 'ns-resize', moveCursor: 'ns-resize' }),
			data: {
				isSaveExclude: true,
				type: item.data.type,
				id: item.data.id,
			},
		});
		line.on('mouseout', () => {
			line.selectable = false;
		});
		line.on('mouseover', () => {
			line.selectable = true;
		});
		line.bringToFront();
		line.setCoords();
		canva?.add(line);
		canva?.renderAll();
	});
}

export function initializeRuler(
	canvasRef,
	colorScheme = 'light',
	artboardID,
) {
	renderRulerAxisBackground(canva, colorScheme);
	adjustRulerBackgroundPosition(canva, colorScheme);
	adjustRulerLinesPosition(canva);
	renderRulerStepMarkers(canva, colorScheme);
	loadRulerLines(canva, artboardID);
	canva?.requestRenderAll();
}

export function deleteRulerLines(
	canvasRef,
	currentArtboardID,
	ids = [],
) {
	const json = canva?.toJSON(FABRIC_JSON_ALLOWED_KEYS);
	const rulerLines = json?.objects.filter((x) => Object.values(RULER_LINES).includes(x.data?.type));
	const rulerState = readRulerDataFromStorage();
	const newState = {
		...rulerState,
		[currentArtboardID]: rulerLines?.filter((x) => !ids.includes(x.data?.id)),
	};
	localStorage.setItem('ruler', JSON.stringify(newState));
}

export function addNewRulerLine(
	options,
	canvasRef,
	id,
) {
	// create vertical line
	if (
		[RULER_ELEMENTS.X_RULER_BACKGROUND, RULER_ELEMENTS.X_RULER_MARKER, RULER_ELEMENTS.X_RULER_MARKER_TEXT].includes(
			options?.target?.data?.type,
		)
	) {
		const zoom = canva?.getZoom();
		const pointer = canva?.getPointer(options.e);
		const canvasHeight =
			zoom > 1 ? (canva.current?.height) : (canva.current?.height) / zoom;
		const pan = canva?.viewportTransform;
		const padding = zoom > 1 ? 10 / zoom : zoom * 10;
		const line = new fabric.Line([pointer.x, (-pan[5] + 20) / zoom, pointer.x, canvasHeight], {
			stroke: RULER_COLORS.MARKER_LINE.DEFAULT,
			strokeWidth: 1 / zoom,
			hasControls: false,
			hasBorders: false,
			lockRotation: true,
			lockMovementY: true,
			lockScalingX: true,
			lockScalingY: true,
			lockUniScaling: true,
			lockSkewingX: true,
			lockSkewingY: true,
			lockScalingFlip: true,
			selectable: false,
			padding,
			hoverCursor: 'ew-resize',
			moveCursor: 'ew-resize',
			data: {
				type: RULER_LINES.X_RULER_LINE,
				id: generateId(),
				isSaveExclude: true,
			},
		});
		line.on('mouseout', () => {
			line.selectable = false;
		});
		line.on('mouseover', () => {
			line.selectable = true;
		});
		line.bringToFront();
		line.set({ height: canvasHeight, width: 0 });
		line.setCoords();
		canva?.add(line);
		canva?.renderAll();
		// create horizontal line
	} else if (
		[RULER_ELEMENTS.Y_RULER_BACKGROUND, RULER_ELEMENTS.Y_RULER_MARKER, RULER_ELEMENTS.Y_RULER_MARKER_TEXT].includes(
			options?.target?.data?.type,
		)
	) {
		const zoom = canva?.getZoom();
		const pointer = canva?.getPointer(options.e);
		const canvasWidth =
			zoom > 1 ? (canva.current?.width) : (canva.current?.width) / zoom;
		const pan = canva?.viewportTransform;
		const padding = zoom > 1 ? 10 / zoom : zoom * 10;
		const line = new fabric.Line([(-pan[4] + 20) / zoom, pointer.y, canvasWidth, pointer.y], {
			stroke: RULER_COLORS.MARKER_LINE.DEFAULT,
			strokeWidth: 1 / zoom,
			lockMovementX: true,
			hasControls: false,
			lockRotation: true,
			lockScalingX: true,
			lockScalingY: true,
			hasBorders: false,
			lockUniScaling: true,
			lockSkewingX: true,
			lockSkewingY: true,
			lockScalingFlip: true,
			hoverCursor: 'ns-resize',
			moveCursor: 'ns-resize',
			padding,
			selectable: false,
			data: {
				isSaveExclude: true,
				type: RULER_LINES.Y_RULER_LINE,
				id: generateId(),
			},
		});
		line.on('mouseout', () => {
			line.selectable = false;
		});
		line.on('mouseover', () => {
			line.selectable = true;
		});
		line.bringToFront();
		line.set({ width: canvasWidth, height: 0 });
		line.setCoords();
		canva?.add(line);
		canva?.requestRenderAll();
		// change color of selected ruler line
	} else if (Object.values(RULER_LINES).includes(options?.target?.data?.type)) {
		options.target?.set({ fill: 'red', stroke: 'red' });
		renderRulerOnMoveMarker(options.target, canvasRef);
	}
	const json = canva?.toJSON(FABRIC_JSON_ALLOWED_KEYS);
	const rulerLines = json?.objects.filter((x) => Object.values(RULER_LINES).includes(x.data?.type));
	const rulerState = readRulerDataFromStorage();
	localStorage.setItem(
		'ruler',
		JSON.stringify({ ...rulerState, [id]: removeDuplicateRulerLines(rulerLines) }),
	);
}

export function renderRulerOnMoveMarker(
	target,
	canvasRef,
) {
	if (RULER_LINES.X_RULER_LINE === target.data?.type) {
		removeRulerOnMoveMarker(canva);
		const pan = canva?.viewportTransform;
		const zoom = canva?.getZoom();
		canva?.add(
			new fabric.Text(`${Math.round(target.left)}`, {
				left: (target.left) + 5 / zoom,
				top: (-pan[5] + 20) / zoom,
				fill: RULER_COLORS.MARKER_LINE.FOCUSED,
				fontFamily: 'Inter',
				fontSize: 12 / zoom,
				data: { type: RULER_ELEMENTS.X_ON_MOVE_MARKER, id: generateId(), isSaveExclude: true },
			}),
		);
	} else if (RULER_LINES.Y_RULER_LINE === target.data?.type) {
		removeRulerOnMoveMarker(canva);
		const pan = canva?.viewportTransform;
		const zoom = canva?.getZoom();
		canva?.add(
			new fabric.Text(`${Math.round(target.top)}`, {
				left: (-pan[4] + 20) / zoom,
				top: (target.top) - 5 / zoom,
				fill: RULER_COLORS.MARKER_LINE.FOCUSED,
				fontFamily: 'Inter',
				angle: 270,
				fontSize: 12 / zoom,
				data: { type: RULER_ELEMENTS.Y_ON_MOVE_MARKER, id: generateId(), isSaveExclude: true },
			}),
		);
	}
}

export function readRulerDataFromStorage() {
	const rulerLinesFromStorage = localStorage.getItem('ruler');
	const rulerState = JSON.parse(rulerLinesFromStorage || '{}');
	return rulerState;
}

export function removeDuplicateRulerLines(rulerLines) {
	const ids = rulerLines.map(x => x.data?.id);
	const uniqueIds = [...new Set(ids)];
	return rulerLines.filter(x => uniqueIds.includes(x.data?.id));
}

export function updateRulerLineInStorage(id, rulerLines) {
	const rulerState = readRulerDataFromStorage();
	localStorage.setItem('ruler', JSON.stringify({ ...rulerState, [id]: removeDuplicateRulerLines(rulerLines) }));
}

export function deleteRulerLineForArtboard(id) {
	const rulerState = readRulerDataFromStorage();
	delete rulerState[id];
	localStorage.setItem('ruler', JSON.stringify(rulerState));
}
