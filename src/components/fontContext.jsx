import { createContext, useState, useEffect, useContext } from 'react';

const FontContext = createContext();

export const FontProvider = ({ children }) => {
  const [fontName, setFontName] = useState('');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [fontList, setFontList] = useState([]);
  const [fontWeight, setFontWeight] = useState('regular');
  const [selectedFontColor, setSelectedFontColor] = useState('#000000');

  const currentFont = fontList.find((font) => font.family === fontName);

  useEffect(() => {
    fetch('/fonts.json')
      .then((response) => response.json())
      .then((fonts) => {
        setFontList(fonts.items);
      })
      .catch((error) => console.error(error));
  }, []);

  return (
    <FontContext.Provider
      value={{
        fontName, setFontName,
        isBold, setIsBold,
        isItalic, setIsItalic,
        isUnderline, setIsUnderline,
        fontList, setFontList,
        currentFont,
        fontWeight, setFontWeight,
        selectedFontColor, setSelectedFontColor
      }}
    >
      {children}
    </FontContext.Provider>
  );
};

export const useFont = () => useContext(FontContext);
