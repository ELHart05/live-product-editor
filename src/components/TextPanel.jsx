import {
	ActionIcon,
	Box,
	ColorInput,
	Divider,
	Select,
	Stack,
	Text,
} from '@mantine/core';
import {
	IconBold,
	IconItalic,
	IconUnderline,
} from '@tabler/icons-react';
import { useEffect } from 'react';
import { useFont } from './fontContext';

const SectionTitle = ({ children }) => {
	return (
		<Text weight={500} size={'sm'}>
			{children}
		</Text>
	);
};

export default function TextPanel ({
	canvas,
	currentSelectedElements,
	text,
}) {

	const {
	fontName, setFontName,
	isBold, setIsBold, isItalic, setIsItalic,
	isUnderline, setIsUnderline,
	fontList, setFontList, currentFont, fontWeight, setFontWeight, selectedFontColor, setSelectedFontColor,
	} = useFont();

	useEffect(() => {
		const textElement = currentSelectedElements?.[0];

		if (textElement) {
			setFontName(textElement.fontFamily || '');
			setIsBold(textElement.fontWeight === 'bold');
			setIsItalic(textElement.fontStyle === 'italic');
			setIsUnderline(textElement.underline || false);

			setSelectedFontColor(textElement.fill);
		}
	}, [currentSelectedElements]);

	useEffect(() => {
		fetch('/fonts.json')
			.then((response) => response.json())
			.then((fonts) => {
				setFontList(fonts.items);
			})
			.catch((error) => console.error(error));
	}, []);

	const previewStyle = {
		fontFamily: fontName,
		fontWeight: isBold ? '700' : fontWeight === 'regular' ? 'normal' : fontWeight,
		fontStyle: isItalic ? 'italic' : 'normal',
		textDecoration: isUnderline ? 'underline' : 'none',
		color: selectedFontColor,
		fontSize: '1rem',
		verticalAlign: 'baseline',
	};

	const updateFontInCanvas = (fontFamily) => {
		const font = fontList.find((font) => font.family === fontFamily);
		setFontName(font.family);
		fetch(font.files.regular)
			.then((response) => response.arrayBuffer())
			.then((arrayBuffer) => {
				const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
				const fontFace = new FontFace(
					font.family,
					`url(data:font/woff;base64,${fontBase64}) format('woff')`
				);
				document.fonts.add(fontFace);
				return fontFace.load();
			})
			.then(() => {
				currentSelectedElements?.[0]?.set('fontFamily', font.family);
				canvas?.renderAll();
			})
			.catch((error) => console.error('Error loading font:', error));
	};

	const toggleStyle = (type) => {
		const textElement = currentSelectedElements?.[0];

		switch (type) {
			case 'bold':
				setIsBold(!isBold);
				!!textElement && textElement?.set({ fontWeight: isBold ? 'normal' : 'bold' });
				break;
			case 'italic':
				setIsItalic(!isItalic);
				!!textElement && textElement?.set({ fontStyle: isItalic ? 'normal' : 'italic' });
				break;
			case 'underline':
				setIsUnderline(!isUnderline);
				!!textElement && textElement?.set({ underline: !isUnderline });
				break;
			default:
				break;
		}
		canvas.requestRenderAll();
	};

	return (
		<Stack spacing={16} className='w-full'>
			<SectionTitle>Font Family</SectionTitle>
			<Select
				searchable
				value={fontName}
				nothingFound='No options'
				onChange={updateFontInCanvas}
				data={fontList.map((font) => ({
					value: font.family,
					label: font.family,
				}))}
			/>

			{currentFont && (
				<Box mt='md'>
					<SectionTitle>Font Weight</SectionTitle>
					<Select
						mt='sm'
						value={fontWeight}
						onChange={(e) => {
							setFontWeight(e);
							fetch(currentFont.files?.[e])
								.then((response) => response.arrayBuffer())
								.then((arrayBuffer) => {
									const fontBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
									const fontFace = new FontFace(
										currentFont.family,
										`url(data:font/woff;base64,${fontBase64}) format('woff')`,
										{ weight: e }
									);
									document.fonts.add(fontFace);
									return fontFace.load();
								})
								.then(() => {
									currentSelectedElements?.[0]?.set('fontWeight', e);
									canvas.renderAll();
								})
								.catch((error) => console.error('Error loading font:', error));
						}}
						data={Object.entries(currentFont?.files)?.map(([fontName]) => ({
							value: fontName,
							label: fontName,
						}))}
					/>
				</Box>
			)}

			<Divider />

			<SectionTitle>Font Styling</SectionTitle>
			<div style={{ display: 'flex', justifyContent: 'space-around' }}>
				<ActionIcon onClick={() => toggleStyle('bold')}>
					<IconBold size={20} style={{ color: isBold ? '#7950f2' : 'gray' }} />
				</ActionIcon>
				<ActionIcon onClick={() => toggleStyle('italic')}>
					<IconItalic size={20} style={{ color: isItalic ? '#7950f2' : 'gray' }} />
				</ActionIcon>
				<ActionIcon onClick={() => toggleStyle('underline')}>
					<IconUnderline size={20} style={{ color: isUnderline ? '#7950f2' : 'gray' }} />
				</ActionIcon>
			</div>

			<Divider />

			<SectionTitle>Font Color</SectionTitle>
			<ColorInput
				value={selectedFontColor}
				onChange={(e) => {
					setSelectedFontColor(e);
					currentSelectedElements?.[0]?.set('fill', e);
					canvas.requestRenderAll();
				}}
				format='hexa'
			/>

			<Divider />

			<SectionTitle>Live Preview</SectionTitle>
			<div
				style={{
					...previewStyle,
					padding: '10px',
					border: '1px dashed #ccc',
					borderRadius: 8,
					minHeight: '40px',
				}}
			>
				{text || 'Your styled preview text will appear here...'}
			</div>
		</Stack>
	);
};
