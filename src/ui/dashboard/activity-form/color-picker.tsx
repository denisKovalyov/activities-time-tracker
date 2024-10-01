import { useEffect } from 'react';

import { FormFieldInput } from '@/ui/common/form';
import { InputIcon } from '@/ui/common/form/input-icon';
import { Palette } from '@phosphor-icons/react';
import { HexColorPicker } from 'react-colorful';
import { getRandomValue } from '@/lib/utils';

const BASIC_COLORS = [
  "#FF5733", // Bright Orange
  "#33FF57", // Lime Green
  "#3357FF", // Bright Blue
  "#FF33A1", // Hot Pink
  "#33FFF5", // Aqua
  "#FFB833", // Golden Yellow
  "#8033FF", // Purple
  "#33FF83", // Light Green
  "#FF3333", // Red
  "#33A1FF", // Sky Blue
  "#FF5733", // Coral
  "#A833FF", // Violet
  "#FFD633", // Sunflower Yellow
  "#FF33B8", // Pink
  "#33FFAD", // Mint Green
];

export function ColorPicker({
  name,
  label,
  value,
  onColorChange,
}: {
  name: string;
  label: string;
  value: string;
  onColorChange: (color: string) => void;
}) {
  const selectedColorPicker = value.length === 6 ? value : '';

  useEffect(() => {
    onColorChange(getRandomValue(BASIC_COLORS));
  }, [onColorChange]);

  return (
    <>
      <FormFieldInput
        name={name}
        label={label}
        maxLength={6}
        allowedSymbols={/^[a-fA-F0-9]*$/}
        inputComponent={InputIcon}
        inputProps={{
          icon: (
            <Palette
              size="16"
              weight="fill"
              style={{
                color: value.length === 6 ? value : '000000',
              }}
            />
          ),
        }}
      />
      <HexColorPicker
        className="hexColorPicker"
        color={selectedColorPicker}
        onChange={onColorChange}
      />
    </>
  );
}
